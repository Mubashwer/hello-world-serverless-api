import { Construct } from "constructs";
import {
  App,
  TerraformStack,
  TerraformOutput,
  TerraformAsset,
  AssetType,
} from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import { Apigatewayv2Api } from "@cdktf/provider-aws/lib/apigatewayv2-api";
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

    const deploymentPackage = new TerraformAsset(this, "deployment_package", {
      path: path.resolve(__dirname, DIST_PATH),
      type: AssetType.ARCHIVE,
    });

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
      filename: deploymentPackage.path,
      runtime: "dotnet8",
      handler: LAMBDA_HANDLER,
      sourceCodeHash: deploymentPackage.assetHash,
      role: lambdaExecutionRole.arn,
    });

    const api = new Apigatewayv2Api(this, "serverless_api", {
      name: API_NAME,
      protocolType: "HTTP",
      target: lambda.arn,
    });

    new LambdaPermission(this, "api_gw_permission", {
      statementId: "AllowExecutionFromAPIGateway",
      action: "lambda:InvokeFunction",
      functionName: lambda.functionName,
      principal: "apigateway.amazonaws.com",
      sourceArn: `${api.executionArn}/*`,
    });

    new TerraformOutput(this, "api_endpoint", {
      value: api.apiEndpoint,
    });
  }
}

const app = new App();
new ServerlessApiStack(app, "hello_world_api_infra");
app.synth();
