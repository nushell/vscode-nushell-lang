#!/usr/bin/env nu
$nu.scope.commands
|where is_builtin and (not $it.is_extern)
|get -i examples
|each {take 1}
|get example
|compact
|each {append (char nl)}
|flatten
|save example.nu