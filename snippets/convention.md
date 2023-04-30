# Convention for snippets

## Naming

Naming convention for `description`:

- for operators it's `"<operator>" operator` (e.g. `"in" operator`)
- for functions it's `function definition` or `"<function>" function definition`
- for builtins it's `"<builtin>" invocation` (e.g. `"alias" invocation"`) or
  `"<builtin> <subcommand>" invocation` (e.g. `"bits or" invocation"`)
- for shell shebang it's `shebang`
- for anything else it's any string

Naming convention for `prefix`:

- for operators it's `<operator>` (e.g. `in`)
- for functions it's `function`, `<function>` (e.g. `main`)
- for builtins it's `<builtin>` (e.g. `alias`) or `<builtin>-<subcommand>`
  (e.g. `bits-or`)
- for shebang it's `shebang`
- for anything else it's any string

If snippet contains a documenting comment than prefix should begin with at `@`
symbol.

Snippets are only created for commands those satisfy at least one condition:

- read data from stdin
- have at least one mandatory or optional argument (not `...rest`)
  Here by argument positional argument or argument for an option is meant.

If there are options available for command or a subcommand then there is no
restriction about what options to pick to put in snippet definition.

## Placeholders

Placeholders by default should describe what kind of value is expected like
`${1:path/to/directory}`. But when there is a format defined for placeholder
then example value should be used like `${1:ff}`.

Placeholders can not to list all available choices like
`${1|big5,euc-jp,euc-kr,gbk,iso-8859-1,utf-16,cp1252,latin5|}`. When there are
more then 8 alternatives, provide the most common ones in terms of usage
frequency (it doesn't apply for `date` snippet, data
types, durations and subcommands).

## Grouping

Always group snippets presenting different subcommands for the same command and
sharing the same set of options via placeholders with alternatives. Write this:

```json
{
    "hash builtin": {
        "prefix": "hash",
        "description": "\"hash\" invocation",
        "body": "${1:command} | hash ${2|md5,sha256|}"
    }
}
```

instead of:

```json
{
    "hash md5 builtin": {
        "prefix": "hash-md5",
        "description": "\"hash md5\" invocation",
        "body": "${1:command} | hash md5"
    },
    "hash sha256 builtin": {
        "prefix": "hash-sha256",
        "description": "\"hash sha256\" invocation",
        "body": "${1:command} | hash sha256"
    }
}
```
