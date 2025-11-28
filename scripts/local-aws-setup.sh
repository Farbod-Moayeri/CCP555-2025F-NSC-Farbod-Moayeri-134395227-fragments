#!/bin/sh

echo "Configuring AWS mock credentials..."
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_SESSION_TOKEN=test
export AWS_DEFAULT_REGION=us-east-1

############################################
# Wait for LocalStack to start
############################################
echo "Waiting for LocalStack S3 + DynamoDB..."

until curl -s http://localhost:4566/health | grep "\"initialized\": true" > /dev/null; do
  echo "Still waiting..."
  sleep 2
done

echo "LocalStack is READY!"

############################################
# Create S3 bucket
############################################
aws --endpoint-url=http://localhost:4566 \
  s3api create-bucket --bucket fragments || true

############################################
# Create DynamoDB table
############################################
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name fragments \
  --attribute-definitions AttributeName=ownerId,AttributeType=S AttributeName=id,AttributeType=S \
  --key-schema AttributeName=ownerId,KeyType=HASH AttributeName=id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST || true

aws --endpoint-url=http://localhost:4566 dynamodb wait table-exists \
  --table-name fragments

echo "LocalStack setup complete!"
