#!/usr/bin/env bash

export CODE_TESTS_PATH="$PWD/client/out/test"
export CODE_TESTS_WORKSPACE="$PWD/client/testFixture"

node "$PWD/client/out/test/runTest"
