const { main } = require("./helpers");

main()
  .then(function () {
    console.log("SUCCESS: Done");
  })
  .catch(function (error) {
    console.trace(error);
    process.exit(1);
  });
