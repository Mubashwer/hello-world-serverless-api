import { Construct } from "constructs";
import {
  App,
  TerraformStack,
  TerraformOutput,
  TerraformAsset,
  AssetType,
} from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketOwnershipControls } from "@cdktf/provider-aws/lib/s3-bucket-ownership-controls";
import { S3BucketAcl } from "@cdktf/provider-aws/lib/s3-bucket-acl";
import { S3Object } from "@cdktf/provider-aws/lib/s3-object";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { CloudwatchLogGroup } from "@cdktf/provider-aws/lib/cloudwatch-log-group";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import { Apigatewayv2Api } from "@cdktf/provider-aws/lib/apigatewayv2-api";
import { Apigatewayv2Stage } from "@cdktf/provider-aws/lib/apigatewayv2-stage";
import { Apigatewayv2Integration } from "@cdktf/provider-aws/lib/apigatewayv2-integration";
import { Apigatewayv2Route } from "@cdktf/provider-aws/lib/apigatewayv2-route";
import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission";
import path = require("path");

export const API_NAME = "hello-world-serverless-api";
export const DIST_PATH = "./../src/HelloWorld.API/bin/Release/net8.0";
export const LAMBDA_HANDLER = "HelloWorld.API";

class ServerlessApiStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "aws", {
      region: "ap-southeast-2",
    });

    const deploymentBucket = new S3Bucket(this, "deployment_bucket", {
      bucket: API_NAME,
    });

    const deploymentBucketOwnershipControls = new S3BucketOwnershipControls(
      this,
      "deployment_bucket_ownership_controls",
      {
        bucket: deploymentBucket.id,
        rule: {
          objectOwnership: "BucketOwnerPreferred",
        },
      }
    );

    new S3BucketAcl(this, "deployment_bucket_acl", {
      bucket: deploymentBucket.id,
      acl: "private",
      dependsOn: [deploymentBucketOwnershipControls],
    });

    const deploymentPackage = new TerraformAsset(this, "deployment_package", {
      path: path.resolve(__dirname, DIST_PATH),
      type: AssetType.ARCHIVE,
    });

    const deploymentPackageS3Object = new S3Object(
      this,
      "deployment_package_s3_object",
      {
        bucket: deploymentBucket.id,
        key: `${API_NAME}.zip`,
        source: deploymentPackage.path,
        etag: deploymentPackage.assetHash,
      }
    );

    const lambdaExecutionRole = new IamRole(this, "lambda_exec", {
      name: `${API_NAME}`,
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Sid: "",
            Principal: {
              Service: "lambda.amazonaws.com",
            },
          },
        ],
      }),
    });

    new IamRolePolicyAttachment(this, "lambda_policy", {
      role: lambdaExecutionRole.name,
      policyArn:
        "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    });

    const lambda = new LambdaFunction(this, "lambda_api", {
      functionName: API_NAME,
      s3Bucket: deploymentBucket.id,
      s3Key: deploymentPackageS3Object.key,
      runtime: "dotnet8",
      handler: LAMBDA_HANDLER,
      sourceCodeHash: deploymentPackage.assetHash,
      role: lambdaExecutionRole.arn,
    });

    new CloudwatchLogGroup(this, "lambda_log_group", {
      name: `/aws/lambda/${lambda.functionName}`,
      retentionInDays: 30,
    });

    const api = new Apigatewayv2Api(this, "serverless_api", {
      name: API_NAME,
      protocolType: "HTTP",
    });

    const apiLogGroup = new CloudwatchLogGroup(this, "api_gw_log_group", {
      name: `/aws/api_gw/${api.name}`,
      retentionInDays: 30,
    });

    new Apigatewayv2Stage(this, "prod", {
      apiId: api.id,
      name: "prod",
      autoDeploy: true,
      accessLogSettings: {
        destinationArn: apiLogGroup.arn,
        format: JSON.stringify({
          requestId: "$context.requestId",
          sourceIp: "$context.identity.sourceIp",
          requestTime: "$context.requestTime",
          protocol: "$context.protocol",
          httpMethod: "$context.httpMethod",
          resourcePath: "$context.resourcePath",
          path: "$context.path",
          status: "$context.status",
          responseLength: "$context.responseLength",
          integrationErrorMessage: "$context.integrationErrorMessage",
        }),
      },
    });

    const lambdaApiGatewayIntegration = new Apigatewayv2Integration(
      this,
      "lambda_integration",
      {
        apiId: api.id,
        integrationUri: lambda.invokeArn,
        integrationType: "AWS_PROXY",
        payloadFormatVersion: "2.0",
      }
    );

    new Apigatewayv2Route(this, "lambda_route", {
      apiId: api.id,
      routeKey: "ANY /{proxy+}",
      target: `integrations/${lambdaApiGatewayIntegration.id}`,
    });

    new LambdaPermission(this, "api_gw_permission", {
      statementId: "AllowExecutionFromAPIGateway",
      action: "lambda:InvokeFunction",
      functionName: lambda.functionName,
      principal: "apigateway.amazonaws.com",
      sourceArn: `${api.executionArn}/*/*`,
    });

    new TerraformOutput(this, "api_endpoint", {
      value: api.apiEndpoint,
    });
  }
}

const app = new App();
new ServerlessApiStack(app, "hello_world_api_infra");
app.synth();
