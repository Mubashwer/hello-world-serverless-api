# `hello-world-serverless-api`

This is an extremely minimal skeleton of a dotnet serverless API which can be deployed using Terraform (HCL) or CDKTF (TS).

- adapted from ASP.NET Core Minimal API Serverless Application AWS template
- uses AWS Lambda exposed through Amazon API Gateway
- _Written for learning purposes_

## Prequisites

- dotnet 8
- node.js >= 18.0
- aws account
- [authentication of aws provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration)

## Build

```
dotnet build --configuration Release
```

## Deploy using TF (HCL)

```
cd infra-tf
terraform init
terraform plan
terraform apply --auto-approve
```

## Deploy using CDKTF (TS)

```
cd infra-cdktf
npm install
cdktf diff
cdktf deploy --auto-approve

```
