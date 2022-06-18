#!/usr/bin/env nu

# generate combined regex for all single word commands
def match-for-single [
    commands:record
] {
    build-string '\b(' ($commands|where ($it.subcommands|length) == 1|get command|str collect '|'|str replace -a -s '?' '\?') ')\b'
}

# generate list of regexes for every two word command
def match-for-double [
    commands: record
] {
    $commands
    |where ($it.subcommands|length) > 1|each {|x|
        build-string '\b' $x.command '(\s' ($x.subcommands.second-word|compact|str collect '|\s') ')?\b'
    }
}
# returns regexes for all commands, both single and double word single-word append is conditional because some letters only have two word commands e.g 'q'
def generate-matches [
    category: record
] {
    let matches = (match-for-double $category.commands)
    if ($category.commands.subcommands|any? ($it|length) == 1) {
       $matches|append (match-for-single $category.commands)
    } else {
        $matches
    }
}
let patterns = (
    $nu.scope.commands
    |where is_builtin and (not $it.is_extern)
    |get command
    |split column ' ' first-word second-word
    |default '' second-word
    |uniq
    |upsert category {|x|
        let first-letter = ($x.first-word|split chars|get 0)
        if $x.second-word == '' {
            $"($first-letter)"
        } else {
            $"($first-letter)_sub"
        }
    }
    |group-by category
    |transpose category commands
    |upsert commands {
        get commands
        |group-by first-word
        |transpose command subcommands
    }
    |each {|category|
        generate-matches $category
        |each {|match|
            {name: $"keyword.other.($category.category)", match: $match}
        }
    }
    |flatten
)
open syntaxes/nushell.tmLanguage.json
|update repository.keywords.patterns $patterns
|save syntaxes/nushell.tmLanguage.json
