# Convention for snippets

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
