#!/usr/bin/env nu
$nu.scope.commands
|get -i examples
|each {take 1}
|get example
|compact
|each {append (char nl)}
|flatten
|save example.nu