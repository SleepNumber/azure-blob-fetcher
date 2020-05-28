const { main } = require("./helpers");

main()
  .then(() => console.log("SUCCESS: Done"))
  .catch((error) => console.error(`ERROR: ${error.message}`));
