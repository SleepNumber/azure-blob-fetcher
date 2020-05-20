# azure-blob-fetcher

Given an Azure Blob Container and an optional prefix (directory path), find the first blob that matches these criteria and download it to a specified file.

> This was built for a singular, personal use case. I'm happy to modify, but please feel free to fork.

## Setup

1. `npm install`
2. Either add a .env file, or setup your environment variables to contain:
    
    * AZURE_STORAGE_ACCOUNT_NAME
    * AZURE_STORAGE_ACCOUNT_ACCESS_KEY
    * AZURE_CONTAINER_NAME
    * AZURE_BLOB_PREFIX
    * OUTPUT_FILENAME

3. `node index.js`

## Consider
* Be sure the user running this script has write permissions.
* You will also require appropriate permissions to the blob you are fetching
