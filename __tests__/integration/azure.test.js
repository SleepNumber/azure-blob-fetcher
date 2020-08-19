const {
  StorageSharedKeyCredential,
  BlobServiceClient,
} = require("@azure/storage-blob");
const { AbortController } = require("@azure/abort-controller");

const fs = require("fs");
const {
  streamToString,
  getBlobServiceClient,
  isJsonFile,
  getBlobItem,
  getBlockBlobClient,
  getBlobContent,
} = require("../../helpers");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME;
const BLOB_PREFIX = process.env.AZURE_BLOB_PREFIX;
const OUTPUT_FILENAME = process.env.OUTPUT_FILENAME;

const ONE_MINUTE = 60 * 1000;

async function main() {}

describe("index.js", () => {
  test("can retrieve a valid JSON file", async (done) => {
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(
      CONTAINER_NAME
    );
    const blobItem = await getBlobItem(containerClient);
    const blockBlobClient = getBlockBlobClient(containerClient, blobItem);
    const downloadedContent = await getBlobContent(blockBlobClient);
    const parsedContent = JSON.parse(downloadedContent);

    parsedContent.forEach((state) => {
      expect(state.state_code).toBeDefined();
      expect(state.last_sleep_date).toBeDefined();
      expect(state.sleep_iq).toBeDefined();
      expect(state.restful_time).toBeDefined();
      expect(state.heartrate).toBeDefined();
      expect(state.breathrate).toBeDefined();
      expect(state.bedtime).toBeDefined();
      expect(state.waketime).toBeDefined();
      expect(state.pc_difft_sleepnumber).toBeDefined();
      expect(state.snap_date).toBeDefined();
    });
    done();
  });
});
