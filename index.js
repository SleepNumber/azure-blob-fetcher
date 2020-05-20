const {
  StorageSharedKeyCredential,
  BlobServiceClient,
} = require("@azure/storage-blob");
const { AbortController } = require("@azure/abort-controller");
const fs = require("fs");
const Rsync = require("rsync");
const async = require("async");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME;
const BLOB_PREFIX = process.env.AZURE_BLOB_PREFIX;
const OUTPUT_FILENAME = process.env.OUTPUT_FILENAME;
const DESTINATION_PATHS = process.env.DESTINATION_PATHS;
const DESTINATION_USER = process.env.DESTINATION_USER;

const ONE_MINUTE = 60 * 1000;

let processes = [];

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

async function executeRsync(rsync) {
  return await rsync.execute(
    (err, code, cmd) => {
      if (err) {
        console.log(`ERROR: ${err}\n\n`);
        process.exit(0);
      }
      console.log(`SUCCESS: \`rsync\` complete (${code}) (${cmd})\n\n`);
    },
    (data) => {
      console.log(`  - ${data.toString("utf-8").replace("\n", "")}`);
    },
    () => {
      console.log(`  - ERROR: ${err.toString("utf-8")}`);
    }
  );
}

function handleExits(code) {
  console.log(`Exiting with code: ${code}`);
  processes.forEach((pid) => {
    if (pid) {
      console.log(`== Killing rsync process`);
      pid.kill();
    } else {
      console.log(`== WARN: No Rsync PID reference found`);
    }
    console.log(`== Exiting node process`);
  });
}

function handleRsyncResults(err, results) {
  if (err) {
    console.error(`ERROR: ${error.message}`);
  }
  rsyncPid = results;
}

async function main() {
  // setup exit handlers
  process.on("SIGINT", handleExits); // CTRL-C
  process.on("SIGTERM", handleExits); // SIGTERM
  process.on("exit", handleExits); // main process exit

  // setup sdk
  const credentials = new StorageSharedKeyCredential(
    STORAGE_ACCOUNT_NAME,
    ACCOUNT_ACCESS_KEY
  );
  const blobServiceClient = new BlobServiceClient(
    `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    credentials
  );

  // get container
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  console.log(`SUCCESS: Container "${CONTAINER_NAME}" retrieved`);

  // get blob name
  const iterator = containerClient.listBlobsFlat({ prefix: BLOB_PREFIX });
  const blobItem = (await iterator.next()).value;
  console.log(`SUCCESS: Blob "${blobItem.name}" found`);

  // get blob item
  const blobClient = containerClient.getBlobClient(blobItem.name);
  const blockBlobClient = blobClient.getBlockBlobClient();

  // download blob
  const aborter = AbortController.timeout(30 * ONE_MINUTE);
  const downloadResponse = await blockBlobClient.download(0, aborter);
  const downloadedContent = await streamToString(
    downloadResponse.readableStreamBody
  );
  console.log(
    `SUCCESS: Downloaded content: \n\n---\n\n${downloadedContent}\n\n---\n\n`
  );

  fs.writeFile(OUTPUT_FILENAME, downloadedContent, (err) => {
    if (err) throw err;
    console.log(
      `SUCCESS: Saved blob "${blobItem.name}" to "${OUTPUT_FILENAME}"`
    );
  });

  if (!DESTINATION_PATHS) {
    throw new Error("FAILURE: No destination paths set");
  }

  const destinations = DESTINATION_PATHS.split(",");
  const rsyncInstances = destinations.map((destination) =>
    new Rsync()
      .shell("ssh")
      .flags("avzt")
      .source(OUTPUT_FILENAME)
      .destination(`${DESTINATION_USER}@${destination}`)
  );

  async.parallel(
    rsyncInstances.map((rsyncInstance) => () => executeRsync(rsyncInstance)),
    handleRsyncResults
  );
}

main()
  .then(() => console.log("SUCCESS: Done"))
  .catch((error) => console.error(`ERROR: ${error.message}`));
