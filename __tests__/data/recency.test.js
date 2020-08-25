const fs = require("fs").promises;
require("dotenv").config();

const OUTPUT_FILENAME = process.env.OUTPUT_FILENAME;

describe("Data is recent", () => {
  test("Each row was processed on the correct day", async () => {
    const fileBuffer = await fs.readFile(OUTPUT_FILENAME);
    const fileData = JSON.parse(fileBuffer);
    const today = new Date().toISOString().split("T")[0];
    fileData.forEach((row) => {
      expect(row).toMatchObject({
        snap_date: expect.stringMatching(today),
      });
    });
  });
});
