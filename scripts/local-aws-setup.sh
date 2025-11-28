#!/bin/sh

echo "Setting Local AWS environment variables..."

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_SESSION_TOKEN=test
export AWS_DEFAULT_REGION=us-east-1

echo "AWS env configured."


##################################
# Create S3 Bucket (no waiting)
##################################

echo "Creating S3 bucket (no wait)..."

aws --endpoint-url=http://localhost:4566 \
    s3api create-bucket --bucket fragments 2>/dev/null || true


##################################
# Create DynamoDB Table (no waiting)
##################################

echo "Creating DynamoDB table (no wait)..."

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

# No "dynamodb wait" here — completely removed

echo "Local AWS setup complete! (no waiting performed)"
