#!/usr/bin/env nu
let patterns = (
    $nu.scope.commands
    |where is_builtin and (not $it.is_extern)
    |get command
    |split column ' ' first-word second-word
    |group-by first-word
    |transpose command words
    |each {|it|
        let capture-group = (
            if 'second-word' in ($it.words|columns) {
                (build-string '(\s' ($it.words.second-word|compact|str collect '|\s') ')?\b')
            } else {
                ''
            }
        )
        let match = (build-string '\b' ($it.command|str replace -a -s '?' '\?') $capture-group)
        {name: $"keyword.other.($it.command|split chars|get 0)", match: $match}
    }
)
open syntaxes/nushell.tmLanguage.json
|update repository.keywords.patterns $patterns
|save syntaxes/nushell.tmLanguage.json
