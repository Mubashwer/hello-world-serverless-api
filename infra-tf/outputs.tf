output "api_endpoint" {
  description = "Base URL for API Gateway default stage"

  value = aws_apigatewayv2_api.serverless_api.api_endpoint
}
