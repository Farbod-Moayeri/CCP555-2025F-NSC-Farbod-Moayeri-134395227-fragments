#!/bin/sh

echo "Setting Local AWS environment variables..."

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_SESSION_TOKEN=test
export AWS_DEFAULT_REGION=us-east-1

echo "AWS env configured."


##################################
# Wait for LocalStack S3 service
##################################

echo "Waiting for LocalStack (S3 + DynamoDB) on port 4566..."

until awslocal s3 ls >/dev/null 2>&1; do
    echo "Still waiting..."
    sleep 3
done

echo "LocalStack is READY!"
echo "Creating S3 bucket..."


##################################
# Create S3 Bucket
##################################

aws --endpoint-url=http://localhost:4566 \
    s3api create-bucket --bucket fragments 2>/dev/null || true


##################################
# Create DynamoDB Table (LocalStack)
##################################

echo "Creating DynamoDB table on LocalStack..."

aws --endpoint-url=http://localhost:4566 \
    dynamodb create-table \
        --table-name fragments \
        --attribute-definitions \
            AttributeName=ownerId,AttributeType=S \
            AttributeName=id,AttributeType=S \
        --key-schema \
            AttributeName=ownerId,KeyType=HASH \
            AttributeName=id,KeyType=RANGE \
        --billing-mode PAY_PER_REQUEST \
    2>/dev/null || true

aws --endpoint-url=http://localhost:4566 dynamodb wait table-exists \
    --table-name fragments

echo "DynamoDB table ready."

echo "Local AWS setup complete!"
