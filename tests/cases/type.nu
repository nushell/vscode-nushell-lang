type Point = record<x: float, y: float>
type Polygon = list<Point>  # a comment after the type
type Shape = oneof<Point, Polygon>
type my-id = int
type A = int; type B = list<A>
type Odd = record<"a}b": int, 'c;d': int, "e#f": int>
type Esc = record<"a\"b": int>
let after = "still a string"
type Gt = record<"a>b": int, c: string>
type Hash = record<a#b: int>; let hashed = 1
type Ids = list<my-id>
type Keys = record<a.b: int, c?: int, d-e: int, f: record<g.h: int>>
module geometry {
  export type Vector = list<float>
}
def area [] { type Side = float }
ls | where type == file
def kind [type: string] { $type }
let r = { type: file, name: x }
$env.type = 5
^type ls
