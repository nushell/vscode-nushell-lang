#!/usr/bin/env nu
let patterns = (
    $nu.scope.commands
    |where is_builtin and (not $it.is_extern)
    |select command
    |upsert category {|a|
        if ($a.command|split row ' '|get 0) == 'dfr' {
            'dfr_sub'
        } else if ($a.command|split row ' '|get 0) == 'db' {
            'db_sub'
        } else if ($a.command|split row ' '|length) == 2 {
            $"($a.command|split chars|get 0)_sub"
        } else {
            ($a.command|split chars|get 0)
        }
    }
    |group-by category
    |transpose category commands
    |each {|it|
        let match = (build-string "\\b(" ($it.commands.command|str collect '|'|str replace -a ' ' "\\s"|str replace -a -s '?' '\?') ")\\b")
        {name: $"keyword.other.($it.category)", match: $match}
    }
)
open syntaxes/nushell.tmLanguage.json
|update repository.keywords.patterns $patterns
|save syntaxes/nushell.tmLanguage.json
