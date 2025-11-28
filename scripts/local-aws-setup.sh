#!/bin/sh

echo "Configuring AWS mock credentials..."
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_SESSION_TOKEN=test
export AWS_DEFAULT_REGION=us-east-1

AWS_ENDPOINT="http://localhost:4566"

echo "AWS env configured."

############################################
# Wait for LocalStack by pinging via AWS CLI
############################################
echo "Waiting for LocalStack S3 on ${AWS_ENDPOINT}..."

MAX_TRIES=30
COUNT=0

while [ $COUNT -lt $MAX_TRIES ]; do
  # This will succeed once LocalStack is up and S3 is ready
  if aws --endpoint-url="${AWS_ENDPOINT}" s3 ls >/dev/null 2>&1; then
    echo "LocalStack S3 is READY!"
    break
  fi

  COUNT=$((COUNT + 1))
  echo "Still waiting... (${COUNT}/${MAX_TRIES})"
  sleep 2
done

if [ $COUNT -eq $MAX_TRIES ]; then
  echo "ERROR: LocalStack did not become ready in time."
  exit 1
fi

############################################
# Create S3 bucket
############################################
echo "Creating S3 bucket 'fragments' (if not exists)..."
aws --endpoint-url="${AWS_ENDPOINT}" \
  s3api create-bucket --bucket fragments 2>/dev/null || true

############################################
# Create DynamoDB table
############################################
echo "Creating DynamoDB table 'fragments' (if not exists)..."
aws --endpoint-url="${AWS_ENDPOINT}" dynamodb create-table \
  --table-name fragments \
  --attribute-definitions \
    AttributeName=ownerId,AttributeType=S \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=ownerId,KeyType=HASH \
    AttributeName=id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || true

echo "Waiting until 'fragments' table exists..."
aws --endpoint-url="${AWS_ENDPOINT}" dynamodb wait table-exists \
  --table-name fragments

echo "Local AWS (LocalStack) setup complete!"
