#!/usr/bin/env node
const path = require('path');
const { spawn } = require('child_process');

const scriptPath = path.resolve(__dirname, '../client/out/test/runTest');
const nodePath = process.execPath;

const child = spawn(nodePath, [scriptPath], {
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error('Failed to execute e2e tests:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});
