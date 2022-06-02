#!/usr/bin/env nu
$nu.scope.commands
|get -i examples
|each {take 1}
|flatten
|get example
|save example.nu