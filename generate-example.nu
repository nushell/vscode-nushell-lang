#!/usr/bin/env nu

$nu.scope.commands |
	where is_builtin and (not $it.is_extern) |
	get --ignore-errors examples |
	each {$it.example? | append (char nl)} |
	flatten |
	save --force example.nu
