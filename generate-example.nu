#!/usr/bin/env nu

# Collect the examples of every built-in command into example.nu.
scope commands
| where type == built-in
| get examples
| flatten
| get example
| each {|example| $example + (char nl)}
| str join (char nl)
| save --force example.nu
