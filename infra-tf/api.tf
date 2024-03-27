data "archive_file" "deployable_package" {
  type = "zip"

  source_dir  = "./../src/HelloWorld.API/bin/Release/net8.0"
  output_path = "${path.root}/.terraform/hello-world-serverless-api.zip"
}

resource "aws_lambda_function" "lambda_api" {
  function_name = "hello-world-serverless-api"

  filename = data.archive_file.deployable_package.output_path
  runtime  = "dotnet8"
  handler  = "HelloWorld.API"

  source_code_hash = data.archive_file.deployable_package.output_base64sha256
  role             = aws_iam_role.lambda_exec.arn
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.serverless_api.execution_arn}/*"
}

resource "aws_apigatewayv2_api" "serverless_api" {
  name          = "hello-world-serverless-api"
  protocol_type = "HTTP"
  target        = aws_lambda_function.lambda_api.arn
}

