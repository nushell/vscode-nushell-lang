#!/usr/bin/env nu

# builtin sort functions only sort alphabetically
def sort-by-length [
    column: string
] {
    insert length {get $column | str length} |
        sort-by --reverse length |
        reject length
}

# generate combined regex for all single word commands
def match-for-single [
    commands: record
] {
    '\b(' + ($commands |
        where ($it.subcommands | length) == 1 |
        sort-by-length name |
        get name |
        str join '|' |
        str replace --all --string '?' '\?') + ')\b'
}

# generate list of regexes for every two word command name
def match-for-double [
    commands: record
] {
    $commands |
        where ($it.subcommands | length) > 0 and ($it.subcommands.second-word |
            all {$it != ''}) |
        each {
            '\b' + $it.name + '(\s' + ($it.subcommands.second-word |
                compact |
                str join '|\s') + ')\b'
        }
}

# returns regexes for all commands, both single and double word single-word append is conditional because some letters only have two word commands e.g 'q'
def generate-matches [
    category: record
] {
    if ($category | get category) ends-with '_sub' {
        match-for-double $category.commands
    } else {
        match-for-single $category.commands
    }
}

let patterns = ($nu.scope.commands |
    where is_builtin == true and is_extern == false |
    get name |
    split column ' ' first-word second-word |
    default '' second-word |
    uniq |
    upsert category {
        let first_letter = ($it.first-word | split chars | get 0)
        if $it.second-word == '' {
            $"($first_letter)"
        } else {
            $"($first_letter)_sub"
        }
    } |
    group-by category |
    transpose category commands |
    upsert commands {
        get commands |group-by first-word |transpose name subcommands
    } |
    reverse |
    each {|category|
        generate-matches $category |
        each {|match|
            {name: $"keyword.other.($category.category)", match: $match}
        }
    } |
    flatten
)

open syntaxes/nushell.tmLanguage.json |
    update repository.keywords.patterns $patterns |
    save syntaxes/nushell.tmLanguage.json

# TODO: don't allow keywords that have their own definition to be included keyword.other.blah

# like:
# alias, let, let-env, for, def, def-env, extern, module, overlay
# probably some others should be added