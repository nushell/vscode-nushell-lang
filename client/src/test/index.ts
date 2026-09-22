import * as fs from 'fs';
import * as path from 'path';
import Mocha = require('mocha');

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });
  mocha.timeout(100000);

  const testsRoot = __dirname;

  return new Promise((resolve, reject) => {
    const files = fs
      .readdirSync(testsRoot)
      .filter((f) => f.endsWith('.test.js'));

    // Add files to the test suite
    files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

    try {
      // Run the mocha test
      mocha.run((failures: number) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
