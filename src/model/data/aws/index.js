// src/model/data/aws/index.js

const db = require('../memory/memory-db');
const s3Client = require('./s3Client');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

//
// Utility: convert S3 stream -> Buffer
//
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

//
// Read fragment data from S3
//
async function readFragmentDataFromS3(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new GetObjectCommand(params);

  try {
    const data = await s3Client.send(command);
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error reading fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

//
// Write fragment data to S3
//
async function writeFragmentDataToS3(ownerId, id, buffer) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: buffer,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

async function deleteFragmentFromS3(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new DeleteObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    logger.error({ err, params }, 'Error deleting fragment data from S3');
    throw new Error('unable to delete fragment data');
  }
}

//
// Module exports
//
module.exports = {
  readFragment: async (ownerId, id) => db.readFragment(ownerId, id),

  writeFragment: async (ownerId, fragment) => db.writeFragment(ownerId, fragment),

  // Use S3 instead of memory-db
  readFragmentData: readFragmentDataFromS3,

  writeFragmentData: writeFragmentDataToS3,

  listFragments: async (ownerId) => db.listFragments(ownerId),

  deleteFragment: async (ownerId, id) => {
    // 1. delete metadata from memory-db
    await db.deleteFragment(ownerId, id);

    // 2. delete binary data from S3
    await deleteFragmentFromS3(ownerId, id);

    return true;
  },
};
