#!/usr/bin/env nu

# Regenerate the command-name regex in syntaxes/nushell.tmLanguage.json.
#
# This follows the "list-to-tree" section of CONTRIBUTING.md: it collects the
# names of every built-in, keyword and plugin command, turns them into a
# prefix-tree regex (the same output as `list-to-tree --format regex`), and
# writes it into the grammar in place of the current list-to-tree regex.
#
# Usage:
#   nu generate-patterns.nu                       # use the commands of this nu
#   nu generate-patterns.nu --input cmds.txt      # use a combined list (see CONTRIBUTING.md)
#   nu generate-patterns.nu --dry-run             # print the regex instead of writing it

const grammar_file = 'syntaxes/nushell.tmLanguage.json'
const marker = 'Regex generated with list-to-tree'

# Escape a literal string for use inside a regex
def escape-regex []: string -> string {
  str replace --all --regex '([\\.^$|?*+()\[\]{}])' '\$1'
}

# Longest common prefix of a list of strings
def common-prefix []: list<string> -> string {
  let words = $in
  mut prefix = ($words | first)
  for word in ($words | skip 1) {
    let limit = [($prefix | str length) ($word | str length)] | math min
    mut i = 0
    while $i < $limit and (($prefix | str substring $i..$i) == ($word | str substring $i..$i)) {
      $i += 1
    }
    $prefix = ($prefix | str substring 0..<$i)
  }
  $prefix
}

# Turn a sorted, de-duplicated list of words into an alternation regex,
# factoring out common prefixes: [ls, let, lines] -> l(?:et|ines|s)
def to-tree-regex []: list<string> -> string {
  let words = $in
  $words
  | group-by { str substring 0..0 }
  | values
  | each {|group|
      let prefix = $group | common-prefix
      let rest = $group | each { str substring ($prefix | str length).. }
      let head = $prefix | escape-regex
      if ($rest | length) == 1 {
        $head + ($rest | first | escape-regex)
      } else {
        let optional = '' in $rest
        let branches = $rest | where $it != '' | to-tree-regex
        $head + '(?:' + $branches + ')' + (if $optional { '?' } else { '' })
      }
    }
  | str join '|'
}

def main [
  --input: path   # file with one command name per line; defaults to `scope commands`
  --dry-run       # print the regex instead of updating the grammar
] {
  let names = if $input != null {
    open --raw $input | lines
  } else {
    scope commands | where type in [built-in keyword plugin] | get name
  }
  let names = $names | str trim | where $it != '' | uniq | sort

  let regex = $names | to-tree-regex
  if $dry_run {
    print $regex
    return
  }

  let match_suffix = '(?![\w-])( (.*))?'
  let match = '(' + $regex + ')' + $match_suffix
  let lines = open --raw $grammar_file | lines
  # The marker comment appears more than once; the command regex is the one
  # whose "match" line ends with the argument capture.
  let target = $lines
    | enumerate
    | where item =~ $marker
    | get index
    | each {|i| $i + 1 }
    | where {|i| ($lines | get $i) | str ends-with '( (.*))?",' }
    | get 0?
  if $target == null {
    error make { msg: $"could not find the '($marker)' command regex in ($grammar_file)" }
  }
  let indent = $lines | get $target | parse --regex '^(?<indent>\s*)"match"' | get 0?.indent
  if $indent == null {
    error make { msg: $"expected a \"match\" line after the marker in ($grammar_file)" }
  }
  let new_line = $indent + '"match": ' + ($match | to json --raw) + ','
  $lines
  | update $target $new_line
  | str join (char nl)
  | $in + (char nl)
  | save --force --raw $grammar_file
  print $"updated ($grammar_file) with ($names | length) command names"
}
