// src/model/data/aws/index.js

const logger = require('../../../logger');

// DynamoDB Document Client
const ddbDocClient = require('./ddbDocClient');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// S3 client + utilities
const s3Client = require('./s3Client');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

//
// Utility: Convert S3 stream → Buffer
//
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

//
// ─────────────────────────────────────────────
// S3 OPERATIONS
// ─────────────────────────────────────────────
//

async function readFragmentDataFromS3(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  try {
    const data = await s3Client.send(new GetObjectCommand(params));
    return streamToBuffer(data.Body);
  } catch (err) {
    logger.error({ err, params }, 'Error reading fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

async function writeFragmentDataToS3(ownerId, id, buffer) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: buffer,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
  } catch (err) {
    logger.error({ err, params }, 'Error writing fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

async function deleteFragmentFromS3(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
  } catch (err) {
    logger.error({ err, params }, 'Error deleting fragment data from S3');
    throw new Error('unable to delete fragment data');
  }
}

//
// ─────────────────────────────────────────────
// DYNAMO DB OPERATIONS
// ─────────────────────────────────────────────
//

// Write fragment metadata
async function writeFragment(ownerId, fragment) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    return fragment;
  } catch (err) {
    logger.warn({ err, params }, 'error writing fragment metadata to DynamoDB');
    throw err;
  }
}

// Read one fragment metadata
async function readFragment(ownerId, id) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'error reading fragment from DynamoDB');
    throw err;
  }
}

// List fragment metadata
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    return expand ? data?.Items : data?.Items.map((item) => item.id);
  } catch (err) {
    logger.error({ err, params }, 'error listing fragments from DynamoDB');
    throw err;
  }
}

// Delete metadata from DynamoDB + binary from S3
async function deleteFragment(ownerId, id) {
  //
  // 1️⃣ Delete metadata (DynamoDB)
  //
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  try {
    await ddbDocClient.send(new DeleteCommand(params));
  } catch (err) {
    logger.error({ err, params }, 'error deleting fragment metadata from DynamoDB');
    throw err;
  }

  //
  // 2️⃣ Delete binary data (S3)
  //
  try {
    await deleteFragmentFromS3(ownerId, id);
  } catch (err) {
    logger.error({ err, ownerId, id }, 'error deleting fragment data from S3');
    throw err;
  }

  return true;
}

//
// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
//

module.exports = {
  writeFragment,
  readFragment,
  listFragments,
  deleteFragment,
  writeFragmentData: writeFragmentDataToS3,
  readFragmentData: readFragmentDataFromS3,
};
