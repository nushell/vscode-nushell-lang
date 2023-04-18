#!/usr/bin/env nu
$nu.scope.commands | 
where is_builtin and (not $it.is_extern) |
get -i examples | 
each {|r| $r.example? | append (char nl)} | 
flatten | save -f example.nu