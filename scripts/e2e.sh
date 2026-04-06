#!/usr/bin/env bash

# Use the cross-platform Node-based test runner so the same flow works on all hosts.
node "$(dirname "$0")/e2e.js"