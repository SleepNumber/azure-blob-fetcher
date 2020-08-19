const fs = require("fs").promises;
require("dotenv").config();

const OUTPUT_FILENAME = process.env.OUTPUT_FILENAME;

const MINUTES = 60 * 1000;
const THRESHOLD = 120 * MINUTES;
const EXPECTED_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DC",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TOTAL US",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

describe("Validating results", () => {
  test("The file exists", async () => {
    const fileStats = await fs.stat(OUTPUT_FILENAME);
    expect(fileStats).toBeTruthy();
  });

  test("The file was created within defined threshold", async () => {
    const fileStats = await fs.stat(OUTPUT_FILENAME);
    const createdDate = new Date(fileStats.ctime);
    expect(new Date().getTime() - THRESHOLD).toBeLessThan(
      createdDate.getTime()
    );
  });
  test("The file is valid JSON and able to be parsed", async () => {
    const fileBuffer = await fs.readFile(OUTPUT_FILENAME);

    try {
      const fileData = JSON.parse(fileBuffer);
      expect(fileData.length).toBeGreaterThan(1);
      expect(fileData.map((row) => row.state_code).sort()).toEqual(
        EXPECTED_STATES.sort()
      );
    } catch (error) {
      throw error;
    }
  });

  test("The JSON includes all 50 states, DC, and TOTAL US", async () => {
    try {
      const fileBuffer = await fs.readFile(OUTPUT_FILENAME);
      const fileData = JSON.parse(fileBuffer);
      // Do we need 50 states + total?
      expect(fileData.length).toBeGreaterThan(50);
    } catch (error) {
      throw error;
    }
  });

  test("Each row contains the expected properties", async () => {
    const fileBuffer = await fs.readFile(OUTPUT_FILENAME);
    try {
      const fileData = JSON.parse(fileBuffer);
      fileData.forEach((row) => {
        expect(row).toMatchObject({
          state_code: expect.any(String),
          last_sleep_date: expect.any(String),
          sleep_iq: expect.any(String),
          restful_time: expect.any(String),
          sleep_number: expect.any(String),
          heartrate: expect.any(String),
          breathrate: expect.any(String),
          bedtime: expect.any(String),
          waketime: expect.any(String),
          pc_difft_sleepnumber: expect.any(String),
          snap_date: expect.any(String),
        });
      });
    } catch (error) {
      throw error;
    }
  });

  test("Each row is in its expected format", async () => {
    const fileBuffer = await fs.readFile(OUTPUT_FILENAME);
    try {
      const fileData = JSON.parse(fileBuffer);
      fileData.forEach((row) => {
        expect(row).toMatchObject({
          state_code: expect.stringMatching(/(\w\w$|TOTAL\sUS$)/),
          last_sleep_date: expect.stringMatching(/\d\d\d\d-\d\d-\d\d$/),
          sleep_iq: expect.stringMatching(/\d*\.\d*$/),
          restful_time: expect.stringMatching(/\d\d?h\s\d\d?m$/),
          sleep_number: expect.stringMatching(/\d[05]$/),
          heartrate: expect.stringMatching(/\d*\.\d*$/),
          breathrate: expect.stringMatching(/\d*\.\d*$/),
          bedtime: expect.stringMatching(/\d\d?:\d\d\s[AP]M$/),
          waketime: expect.stringMatching(/\d\d?:\d\d\s[AP]M$/),
          pc_difft_sleepnumber: expect.stringMatching(/\d\d?$/),
          snap_date: expect.stringMatching(/\d\d\d\d-\d\d-\d\d$/),
        });
      });
    } catch (error) {
      throw error;
    }
  });
});
