# a script exercising the shapes launch cares about
print "side effect"
module m { def main [a] {} }
export def --env "my cmd" [a] {}
def greet [x: list<int> = [1 2], name # who, to greet
] {}
def opt (y?: int, --v(-v)) {}
extern foo [x]
alias q = ls
@example "attributed" { attributed 1 }
def attributed [x: int] {}
def typed [x: int]: nothing -> int { $x }
def multi [
  name: string   # the name
]: nothing -> nothing {}
def main [--verbose name: string, ...rest] {}
