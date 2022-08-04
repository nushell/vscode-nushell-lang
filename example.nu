[[a b]; [1 2] [1 4] [2 6] [2 4]]
    | into df
    | group-by a
    | agg [
        (col b | min | as "b_min")
        (col b | max | as "b_max")
        (col b | sum | as "b_sum")
     ]
[[a b]; [1 2] [1 4] [2 6] [2 4]]
    | into lazy
    | group-by a
    | agg [
        (col b | min | as "b_min")
        (col b | max | as "b_max")
        (col b | sum | as "b_sum")
     ]
    | collect





alias ll = ls -l


[false false false] | into df | all-false
let s = ([5 6 2 10] | into df);
    let res = ($s > 9);
    $res | all-false


[true true true] | into df | all-true
let s = ([5 6 2 8] | into df);
    let res = ($s > 9);
    $res | all-true


echo [[status]; [UP] [UP]] | all? status == UP
echo [2 4 6 8] | all? ($it mod 2) == 0


(field a) > 1 | and ((field a) < 10) | into nu


open db.mysql
    | into db
    | select a
    | from table_1
    | where ((field a) > 1)
    | and ((field b) == 1)
    | describe
open db.mysql
    | into db
    | select a
    | from table_1
    | where ((field a) > 1 | and ((field a) < 10))
    | and ((field b) == 1)
    | describe


ansi green
ansi reset


echo 'Hello, Nushell! This is a gradient.' | ansi gradient --fgstart 0x40c9ff --fgend 0xe81cff
echo 'Hello, Nushell! This is a gradient.' | ansi gradient --fgstart 0x40c9ff --fgend 0xe81cff --bgstart 0xe81cff --bgend 0x40c9ff


echo [ (ansi green) (ansi cursor_on) "hello" ] | str collect | ansi strip


echo [[status]; [UP] [DOWN] [UP]] | any? status == DOWN
echo [2 4 1 6 8] | any? ($it mod 2) == 1


[0,1,2,3] | append 4
[0,1] | append [2,3,4]


let a = ([[a b]; [1 2] [3 4]] | into df);
    $a | append $a
let a = ([[a b]; [1 2] [3 4]] | into df);
    $a | append $a --col


[1 3 2] | into df | arg-max


[1 3 2] | into df | arg-min


[1 2 2 3 3] | into df | arg-sort
[1 2 2 3 3] | into df | arg-sort -r


[false true false] | into df | arg-true


[1 2 2 3 3] | into df | arg-unique


col a | as new_a | into nu


field name_a | as new_a | into nu


open db.mysql
    | into db
    | select a
    | from table_1
    | as t1
    | describe
open db.mysql
    | into db
    | select a
    | from (
        open db.mysql
        | into db
        | select a b
        | from table_a
      )
    | as t1
    | describe


["2021-12-30" "2021-12-31"] | into df | as-datetime "%Y-%m-%d"


["2021-12-30 00:00:00" "2021-12-31 00:00:00"] | into df | as-datetime "%Y-%m-%d %H:%M:%S"


benchmark { sleep 500ms }


build-string a b c
build-string $"(1 + 2)" = one ' ' plus ' ' two


0x[1F FF AA AA] | bytes add 0x[AA]
0x[1F FF AA AA] | bytes add 0x[AA BB] -i 1


 0x[33 44 55 10 01 13] | bytes at [3 4]
 0x[33 44 55 10 01 13] | bytes at '3,4'


bytes build 0x[01 02] 0x[03] 0x[04]


[0x[11] 0x[13 15]] | bytes collect
[0x[11] 0x[33] 0x[44]] | bytes collect 0x[01]


0x[1F FF AA AA] | bytes ends-with 0x[AA]
0x[1F FF AA AA] | bytes ends-with 0x[FF AA AA]


 0x[33 44 55 10 01 13 44 55] | bytes index-of 0x[44 55]
 0x[33 44 55 10 01 13 44 55] | bytes index-of -e 0x[44 55]


0x[1F FF AA AB] | bytes length
[0x[1F FF AA AB] 0x[1F]] | bytes length


0x[10 AA FF AA FF] | bytes remove 0x[10 AA]
0x[10 AA 10 BB 10] | bytes remove -a 0x[10]


0x[10 AA FF AA FF] | bytes replace 0x[10 AA] 0x[FF]
0x[10 AA 10 BB 10] | bytes replace -a 0x[10] 0x[A0]


0x[1F FF AA AA] | bytes reverse
0x[FF AA AA] | bytes reverse


0x[1F FF AA AA] | bytes starts-with 0x[1F FF AA]
0x[1F FF AA AA] | bytes starts-with 0x[1F]


[[a b]; [6 2] [4 2] [2 2]] | into df | reverse | cache


cal
cal --full-year 2012


cd ~
cd d/s/9


char newline
echo [(char prompt) (char newline) (char hamburger)] | str collect


clear


col a | into nu


open foo.db | into db | select a | from table_1 | collect


echo 1 2 3 | collect { |x| echo $x.1 }


[[a b]; [1 2] [3 4]] | into lazy | collect


[[name,age,grade]; [bill,20,a]] | columns
[[name,age,grade]; [bill,20,a]] | columns | first


echo [["Hello" "World"]; [$nothing 3]]| compact Hello
echo [["Hello" "World"]; [$nothing 3]]| compact World


^external arg1 | complete


let df = ([[a b c]; [one two 1] [three four 2]] | into df);
    $df | with-column ((concat-str "-" [(col a) (col b) ((col c) * 2)]) | as concat)


let other = ([za xs cd] | into df);
    [abc abc abc] | into df | concatenate $other


config env


config nu


[abc acb acb] | into df | contains ab





let s = ([1 1 0 0 3 3 4] | into df);
    ($s / $s) | count-null


cp myfile dir_b
cp -r dir_a dir_b


[1 2 3 4 5] | into df | cumulative sum


"2021-10-22 20:00:12 +01:00" | date format
date format '%Y-%m-%d'


date humanize
"2021-10-22 20:00:12 +01:00" | date humanize


date list-timezone | where timezone =~ Shanghai


date now | date format "%Y-%m-%d %H:%M:%S"
(date now) - 2019-05-01


date to-table
date now | date to-record


date to-table
date now | date to-table


date now | date to-timezone +0500
date now | date to-timezone local


'hello' | debug
echo [[version patch]; [0.1.0 false] [0.1.1 true] [0.2.0 false]] | debug


^cat myfile.q | decode utf-8
0x[00 53 00 6F 00 6D 00 65 00 20 00 44 00 61 00 74 00 61] | decode utf-16be


echo 'U29tZSBEYXRh' | decode base64
echo 'U29tZSBEYXRh' | decode base64 --binary


def say-hi [] { echo 'hi' }; say-hi
def say-sth [sth: string] { echo $sth }; say-sth hi


def-env foo [] { let-env BAR = "BAZ" }; foo; $env.BAR


ls -la | default 'nothing' target 
$env | get -i MY_ENV | default 'abc'


'hello' | describe


[[a b]; [1 1] [1 1]] | into df | describe


open foo.db | into db | select col_1 | from table_1 | describe


echo 'a b c' | detect columns -n
echo $'c1 c2 c3(char nl)a b c' | detect columns


[true false true] | into df | df-not


do { echo hello }
do -i { thisisnotarealcommand }


[0,1,2,3] | drop
[0,1,2,3] | drop 0


[[a b]; [1 2] [3 4]] | into df | drop a


echo [[lib, extension]; [nu-lib, rs] [nu-core, rb]] | drop column


[sam,sarah,2,3,4,5] | drop nth 0 1 2
[0,1,2,3,4,5] | drop nth 0 1 2


[[a b]; [1 2] [3 4] [1 2]] | into df | drop-duplicates


let df = ([[a b]; [1 2] [3 0] [1 2]] | into df);
    let res = ($df.b / $df.b);
    let a = ($df | with-column $res --name res);
    $a | drop-nulls
let s = ([1 2 0 0 3 4] | into df);
    ($s / $s) | drop-nulls


[[a b]; [1 2] [3 4]] | into df | dtypes


du


[[a b]; [1 2] [3 4]] | into df | dummies
[1 2 2 3 3] | into df | dummies


[1 2 3] | each { |it| 2 * $it }
[1 2 3] | each { |it| if $it == 2 { echo "found 2!"} }


[1 2 3] | each while { |it| if $it < 3 {$it} else {$nothing} }
[1 2 3] | each while -n { |it| if $it.item < 2 { $"value ($it.item) at ($it.index)!"} else { $nothing } }


echo 'hello'
echo $nu


'' | empty?
[] | empty?


echo "負けると知って戦うのが、遥かに美しいのだ" | encode shift-jis


echo 'Some Data' | encode base64
echo 'Some Data' | encode base64 --character-set binhex


enter ../dir-foo


env | where name == PATH
env | any? name == MY_ENV_ABC


def foo [x] {
      let span = (metadata $x).span;
      error make {msg: "this is fishy", label: {text: "fish right here", start: $span.start, end: $span.end } }
    }
def foo [x] {
      error make {msg: "this is fishy"}
    }


[1 2 3 4 5] | every 2
[1 2 3 4 5] | every 2 --skip


exec ps aux
exec nautilus


exit
exit --now





module utils { export def my-command [] { "hello" } }; use utils my-command; my-command


export alias ll = ls -l


module spam { export def foo [] { "foo" } }; use spam foo; foo


module foo { export def-env bar [] { let-env FOO_BAR = "BAZ" } }; use foo bar; bar; $env.FOO_BAR


module foo { export env FOO_ENV { "BAZ" } }; use foo FOO_ENV; $env.FOO_ENV


export extern echo [text: string]


(col a) > 2) | expr-not


extern echo [text: string]


fetch url.com
fetch -u myuser -p mypass url.com


[[a b]; [6 2] [4 2] [2 2]] | into df | fetch 2


field name_1 | into nu





[1 2 2 3 3] | into df | shift 2 | fill-null 0


let mask = ([true false] | into df);
    [[a b]; [1 2] [3 4]] | into df | filter-with $mask
[[a b]; [1 2] [3 4]] | into df | filter-with ((col a) > 1)


ls | find toml md sh
echo Cargo.toml | find toml


[[a b]; [1 2] [3 4]] | into df | first 1


[1 2 3] | first
[1 2 3] | first 2


col a | first





[[N, u, s, h, e, l, l]] | flatten 
[[N, u, s, h, e, l, l]] | flatten | first


42 | fmt


fn count name_1 | into nu
open db.mysql
    | into db
    | select (fn lead col_a)
    | from table_a
    | describe


for x in [1 2 3] { $x * $x }
for $x in 1..3 { $x }


ls | format '{name}: {size}'
echo [[col1, col2]; [v1, v2] [v3, v4]] | format '{col2}'


ls | format filesize size KB
du | format filesize apparent B


open db.mysql | into db | from table_a | describe


open data.txt | from csv
open data.txt | from csv --noheaders


'From: test@email.com
Subject: Welcome
To: someone@somewhere.com

Test' | from eml
'From: test@email.com
Subject: Welcome
To: someone@somewhere.com

Test' | from eml -b 1


'BEGIN:VCALENDAR
END:VCALENDAR' | from ics


'[foo]
a=1
b=2' | from ini


'{ "a": 1 }' | from json
'{ "a": 1, "b": [1, 2] }' | from json


'{ a:1 }' | from nuon
'{ a:1, b: [1, 2] }' | from nuon


open --raw test.ods | from ods
open --raw test.ods | from ods -s [Spreadsheet1]


'FOO   BAR
1   2' | from ssv
'FOO   BAR
1   2' | from ssv -n


'a = 1' | from toml
'a = 1
b = [1, 2]' | from toml


echo $'c1(char tab)c2(char tab)c3(char nl)1(char tab)2(char tab)3' | save tsv-data | open tsv-data | from tsv
echo $'a1(char tab)b1(char tab)c1(char nl)a2(char tab)b2(char tab)c2' | save tsv-data | open tsv-data | from tsv -n


'bread=baguette&cheese=comt%C3%A9&meat=ham&fat=butter' | from url


'BEGIN:VCARD
N:Foo
FN:Bar
EMAIL:foo@bar.com
END:VCARD' | from vcf


open --raw test.xlsx | from xlsx
open --raw test.xlsx | from xlsx -s [Spreadsheet1]


'<?xml version="1.0" encoding="UTF-8"?>
<note>
  <remember>Event</remember>
</note>' | from xml


'a: 1' | from yaml
'[ a: 1, b: [1, 2] ]' | from yaml


'a: 1' | from yaml
'[ a: 1, b: [1, 2] ]' | from yaml


mkdir foo bar; enter foo; enter ../bar; g 1
shells; g 2


[[a b]; [1 2] [3 4]] | into df | get a


ls | get name
ls | get name.2


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | get-day


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | get-hour


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | get-minute


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | get-month


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | get-nanosecond


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | get-ordinal


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | get-second


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | get-week


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | get-weekday


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | get-year


glob *.rs
glob **/*.{rs,toml} --depth 2


[1 2 3 a b c] | grid
[1 2 3 a b c] | wrap name | grid


echo [1 2 3 4] | group 2


[[a b]; [1 2] [1 4] [2 6] [2 4]]
    | into df
    | group-by a
    | agg [
        (col b | min | as "b_min")
        (col b | max | as "b_max")
        (col b | sum | as "b_sum")
     ]
[[a b]; [1 2] [1 4] [2 6] [2 4]]
    | into lazy
    | group-by a
    | agg [
        (col b | min | as "b_min")
        (col b | max | as "b_max")
        (col b | sum | as "b_sum")
     ]
    | collect


open db.mysql
    | into db
    | from table_a
    | select (fn max a)
    | group-by a
    | describe
open db.mysql
    | into db
    | from table_a
    | select (fn count *)
    | group-by a
    | describe


ls | group-by type
echo ['1' '3' '1' '3' '2' '1' '1'] | group-by


echo 'abcdefghijklmnopqrstuvwxyz' | hash md5
echo 'abcdefghijklmnopqrstuvwxyz' | hash md5 --binary


echo 'abcdefghijklmnopqrstuvwxyz' | hash sha256
echo 'abcdefghijklmnopqrstuvwxyz' | hash sha256 --binary


"a b c|1 2 3" | split row "|" | split column " " | headers
"a b c|1 2 3|1 2 3 4" | split row "|" | split column " " | headers


help commands
help match


alias lll = ls -l; hide lll
def say-hi [] { echo 'Hi!' }; hide say-hi


ls | histogram type
ls | histogram type freq


history | length
history | last 5


if 2 < 3 { 'yes!' }
if 5 < 3 { 'yes!' } else { 'no!' }


echo done | ignore


let user-input = (input)


echo {'name': 'nu', 'stars': 5} | insert alias 'Nushell'


'This is a string that is exactly 52 characters long.' | into binary
1 | into binary


echo [[value]; ['false'] ['1'] [0] [1.0] [true]] | into bool value
true | into bool


'27.02.2021 1:55 pm +0000' | into datetime
'2021-02-27T13:55:40+00:00' | into datetime


open db.mysql | into db


[[num]; ['5.01']] | into decimal num
'1.345' | into decimal


[[a b];[1 2] [3 4]] | into df
[[1 2 a] [3 4 b] [5 6 c]] | into df


echo [[value]; ['1sec'] ['2min'] ['3hr'] ['4day'] ['5wk']] | into duration value
'7min' | into duration


[[bytes]; ['5'] [3.2] [4] [2kb]] | into filesize bytes
'2' | into filesize


echo [[num]; ['-5'] [4] [1.5]] | into int num
'2' | into int


[[a b];[1 2] [3 4]] | into lazy


field name_1 | into nu


[[a b]; [1 2] [3 4]] | into df | into nu
[[a b]; [1 2] [5 6] [3 4]] | into df | into nu -t -n 1


col a | into nu


5 | into string -d 3
1.7 | into string -d 0


if is-admin { echo "iamroot" } else { echo "iamnotroot" }


[5 6 6 6 8 8 8] | into df | is-duplicated


let other = ([1 3 6] | into df);
    [5 6 6 6 8 8 8] | into df | is-in $other


col a | is-not-null


let s = ([5 6 0 8] | into df);
    let res = ($s / $s);
    $res | is-not-null


let s = ([5 6 0 8] | into df);
    let res = ($s / $s);
    $res | is-null


col a | is-null


[5 6 6 6 8 8 8] | into df | is-unique


let df_a = ([[a b c];[1 "a" 0] [2 "b" 1] [1 "c" 2] [1 "c" 3]] | into lazy);
    let df_b = ([["foo" "bar" "ham"];[1 "a" "let"] [2 "c" "var"] [3 "c" "const"]] | into lazy);
    $df_a | join $df_b a foo | collect
let df_a = ([[a b c];[1 "a" 0] [2 "b" 1] [1 "c" 2] [1 "c" 3]] | into df);
    let df_b = ([["foo" "bar" "ham"];[1 "a" "let"] [2 "c" "var"] [3 "c" "const"]] | into lazy);
    $df_a | join $df_b a foo


open db.mysql
    | into db
    | select col_a
    | from table_1 --as t1
    | join table_2 col_b --as t2
    | describe
open db.mysql
    | into db
    | select col_a
    | from table_1 --as t1
    | join (
        open db.mysql
        | into db
        | select col_c
        | from table_2
      ) ((field t1.col_a) == (field t2.col_c)) --as t2 --right
    | describe


keybindings default


keybindings list -m
keybindings list -e -d


keybindings listen


ps | sort-by mem | last | kill $in.pid
kill --force 12345


[[a b]; [1 2] [3 4]] | into df | last 1


col a | last


[1,2,3] | last 2
[1,2,3] | last


echo [1 2 3 4 5] | length
cal | length -c


let x = 10
let x = 10 + 100


let-env MY_ENV_VAR = 1; $env.MY_ENV_VAR


open db.mysql
    | into db
    | from table_a
    | select a
    | limit 10
    | describe


echo $'two(char nl)lines' | lines





lit 2 | into nu


{NAME: ABE, AGE: UNKNOWN} | load-env; echo $env.NAME
load-env {NAME: ABE, AGE: UNKNOWN}; echo $env.NAME


[Abc aBc abC] | into df | lowercase


ls
ls subdir


let test = ([[a b];[1 2] [3 4]] | into df);
    ls-df


[-50 -100.0 25] | math abs


[-50 100.0 25] | math avg


[1.5 2.3 -3.1] | math ceil


'10 / 4' | math eval


[1.5 2.3 -3.1] | math floor


[-50 100 25] | math max


[3 8 9 12 12 15] | math median


[-50 100 25] | math min


[3 3 9 12 12 15] | math mode


[2 3 3 4] | math product


[1.5 2.3 -3.1] | math round
[1.555 2.333 -3.111] | math round -p 2


[9 16] | math sqrt


[1 2 3 4 5] | math stddev
[1 2 3 4 5] | math stddev -s


[1 2 3] | math sum
ls | get size | math sum


echo [1 2 3 4 5] | math variance
[1 2 3 4 5] | math variance -s


[[a b]; [one 2] [one 4] [two 1]]
    | into df
    | group-by a
    | agg (col b | max)


[[a b]; [6 2] [1 4] [4 1]] | into df | max


[[a b]; [one 2] [one 4] [two 1]]
    | into df
    | group-by a
    | agg (col b | mean)


[[a b]; [6 2] [4 2] [2 2]] | into df | mean


[[a b]; [one 2] [one 4] [two 1]]
    | into df
    | group-by a
    | agg (col b | median)


[[a b]; [6 2] [4 2] [2 2]] | into df | median


[[a b c d]; [x 1 4 a] [y 2 5 b] [z 3 6 c]] | into df | melt -c [b c] -v [a d]


[a b c] | wrap name | merge { [1 2 3] | wrap index }
{a: 1, b: 2} | merge { {c: 3} }


metadata $a
ls | metadata


[[a b]; [6 2] [1 4] [4 1]] | into df | min


[[a b]; [one 2] [one 4] [two 1]]
    | into df
    | group-by a
    | agg (col b | min)


mkdir foo
mkdir -s foo/bar foo2


module spam { export def foo [] { "foo" } }; use spam foo; foo
module foo { export env FOO_ENV { "BAZ" } }; use foo FOO_ENV; $env.FOO_ENV


[[name value index]; [foo a 1] [bar b 2] [baz c 3]] | move index --before name
[[name value index]; [foo a 1] [bar b 2] [baz c 3]] | move value name --after index


mv before.txt after.txt
mv test.txt my/subdirectory


mkdir foo bar; enter foo; enter ../bar; n
n


[1 1 2 2 3 3 4] | into df | n-unique


col a | n-unique


nu-check script.nu
nu-check --as-module module.nu


'let x = 3' | nu-highlight


open myfile.json
open myfile.json --raw


open-db file.sqlite


open test.csv


open db.mysql
    | into db
    | select a
    | from table_1
    | where ((field a) > 1)
    | or ((field b) == 1)
    | describe
open db.mysql
    | into db
    | select a
    | from table_1
    | where ((field a) > 1 | or ((field a) < 10))
    | or ((field b) == 1)
    | describe


(field a) > 1 | or ((field a) < 10) | into nu


open db.mysql
    | into db
    | from table_a
    | select a
    | order-by a
    | describe
open db.mysql
    | into db
    | from table_a
    | select a
    | order-by a --ascending
    | order-by b
    | describe


when ((col a) > 2) 4 | otherwise 5
when ((col a) > 2) 4 | when ((col a) < 0) 6 | otherwise 0


fn avg col_a | over col_b | into nu
open db.mysql
    | into db
    | select (fn lead col_a | over col_b)
    | from table_a
    | describe


module spam { export def foo [] { "foo" } }
    overlay add spam
echo 'export env FOO { "foo" }' | save spam.nu
    overlay add spam.nu


module spam { export def foo [] { "foo" } }
    overlay add spam
    overlay list | last


overlay new spam


module spam { export def foo [] { "foo" } }
    overlay add spam
    overlay remove spam
echo 'export alias f = "foo"' | save spam.nu
    overlay add spam.nu
    overlay remove spam


mkdir foo bar; enter foo; enter ../bar; p
p


[1 2 3] | par-each { |it| 2 * $it }
[1 2 3] | par-each -n { |it| if $it.item == 2 { echo $"found 2 at ($it.index)!"} }


echo "hi there" | parse "{foo} {bar}"
echo "hi there" | parse -r '(?P<foo>\w+) (?P<bar>\w+)'


'/home/joe/test.txt' | path basename
[[name];[/home/joe]] | path basename -c [ name ]


'/home/joe/code/test.txt' | path dirname
ls ('.' | path expand) | path dirname -c [ name ]


'/home/joe/todo.txt' | path exists
ls | path exists -c [ name ]


'/home/joe/foo/../bar' | path expand
ls | path expand -c [ name ]


'/home/viking' | path join spam.txt
'/home/viking' | path join spams this_spam.txt


'/home/viking/spam.txt' | path parse
'/home/viking/spam.tar.gz' | path parse -e tar.gz | upsert extension { 'txt' }


'/home/viking' | path relative-to '/home'
ls ~ | path relative-to ~ -c [ name ]


'/home/viking/spam.txt' | path split
ls ('.' | path expand) | path split -c [ name ]


'.' | path type
ls | path type -c [ name ]


port 3121 4000
port


post url.com 'body'
post -u myuser -p mypass url.com 'body'


[1,2,3,4] | prepend 0
[2,3,4] | prepend [0,1]


print "hello world"
print (2 + 3)


ps
ps | sort-by mem | last 5


[[a b]; [one 2] [one 4] [two 1]]
    | into df
    | group-by a
    | agg (col b | quantile 0.5)


[[a b]; [6 2] [1 4] [4 1]] | into df | quantile 0.5


open foo.db | into db | query "SELECT * FROM Bar"


random bool
random bool --bias 0.75


random chars
random chars -l 20


random decimal
random decimal ..500


random dice
random dice -d 10 -s 12


random integer
random integer ..500


random uuid


[0,1,2,3,4,5] | range 4..5
[0,1,2,3,4,5] | range (-2)..


[ 1 2 3 4 ] | reduce {|it, acc| $it + $acc }
[ 1 2 3 ] | reduce -n {|it, acc| $acc.item + $it.item }


register -e json ~/.cargo/bin/nu_plugin_query
let plugin = ((which nu).path.0 | path dirname | path join 'nu_plugin_query'); nu -c $'register -e json ($plugin); version'


ls | reject modified
echo {a: 1, b: 2} | reject a


[5 6 7 8] | into df | rename '0' new_name
[[a b]; [1 2] [3 4]] | into df | rename a a_new


[[a, b]; [1, 2]] | rename my_column
[[a, b, c]; [1, 2, 3]] | rename eggs ham bacon


[abc abc abc] | into df | replace -p ab -r AB


[abac abac abac] | into df | replace-all -p a -r A


[0,1,2,3] | reverse


[[a b]; [6 2] [4 2] [2 2]] | into df | reverse


rm file.txt
rm --trash file.txt


[[a b]; [1 2] [3 4] [5 6]] | roll down


[[a b c]; [1 2 3] [4 5 6]] | roll left
[[a b c]; [1 2 3] [4 5 6]] | roll left --cells-only


[[a b c]; [1 2 3] [4 5 6]] | roll right
[[a b c]; [1 2 3] [4 5 6]] | roll right --cells-only


[[a b]; [1 2] [3 4] [5 6]] | roll up


[1 2 3 4 5] | into df | rolling sum 2 | drop-nulls
[1 2 3 4 5] | into df | rolling max 2 | drop-nulls


[[a b]; [1 2]] | rotate
[[a b]; [1 2] [3 4] [5 6]] | rotate


run-external "echo" "-n" "hello"


[[a b]; [1 2] [3 4]] | into df | sample -n 1
[[a b]; [1 2] [3 4] [5 6]] | into df | sample -f 0.5 -e


echo 'save me' | save foo.txt
echo 'append me' | save --append foo.txt


open foo.db | into db | schema


[[a b]; [6 2] [4 2] [2 2]] | into df | select a


ls | select name
ls | select name size


open db.mysql | into db | select a | describe
open db.mysql
    | into db
    | select (field a | as new_a) b c
    | from table_1
    | describe


seq 1 10
seq 1.0 0.1 2.0


seq char a e
seq char -s '|' a e


seq date --days 10
seq date --days 10 -r


let s = ([1 2 2 3 3] | into df | shift 2);
    let mask = ($s | is-null);
    $s | set 0 --mask $mask


let series = ([4 1 5 2 4 3] | into df);
    let indices = ([0 2] | into df);
    $series | set-with-idx 6 -i $indices


[[a b]; [1 2] [3 4]] | into df | shape


enter ..; shells
shells | where active == true


[1 2 2 3 3] | into df | shift 2 | drop-nulls


echo [[version patch]; [1.0.0 false] [3.0.1 true] [2.0.0 false]] | shuffle


"There are seven words in this sentence" | size
'今天天气真好' | size 


echo [[editions]; [2015] [2018] [2021]] | skip 2
echo [2 4 6 8] | skip


echo [-2 0 2 -1] | skip until $it > 0


echo [-2 0 2 -1] | skip while $it < 0


sleep 1sec
sleep 1sec 1sec 1sec


[[a b]; [1 2] [3 4]] | into df | slice 0 1


[2 0 1] | sort
[2 0 1] | sort -r


[2 0 1] | sort-by
[2 0 1] | sort-by -r


[[a b]; [6 2] [1 4] [4 1]] | into df | sort-by a
[[a b]; [6 2] [1 1] [1 4] [2 4]] | into df | sort-by [a b] -r [false true]


source foo.nu
source ./foo.nu; say-hi


'hello' | split chars


echo 'a--b--c' | split column '--'
echo 'abc' | split column -c ''


[a, b, c, d, e, f, g] | split list d
[[1,2], [2,3], [3,4]] | split list [2,3]


echo 'abc' | split row ''
echo 'a--b--c' | split row '--'



                {
                    '2019': [
                      { name: 'andres', lang: 'rb', year: '2019' },
                      { name: 'jt', lang: 'rs', year: '2019' }
                    ],
                    '2021': [
                      { name: 'storm', lang: 'rs', 'year': '2021' }
                    ]
                } | split-by lang
                


[[a b]; [one 2] [one 2] [two 1] [two 1]]
    | into df
    | group-by a
    | agg (col b | std)


[[a b]; [6 2] [4 2] [2 2]] | into df | std


 'NuShell' | str camel-case
'this-is-the-first-case' | str camel-case


'good day' | str capitalize
'anton' | str capitalize


['nu', 'shell'] | str collect
['nu', 'shell'] | str collect '-'


'my_library.rb' | str contains '.rb'
'my_library.rb' | str contains -i '.RB'


'NU' | str downcase
'TESTa' | str downcase


'my_library.rb' | str ends-with '.rb'
'my_library.rb' | str ends-with '.txt'


 'my_library.rb' | str index-of '.rb'
 '.rb.rb' | str index-of '.rb' -r '1,'


'NuShell' | str kebab-case
'thisIsTheFirstCase' | str kebab-case


'hello' | str length
['hi' 'there'] | str length


'nushell' | str lpad -l 10 -c '*'
'123' | str lpad -l 10 -c '0'


'nu-shell' | str pascal-case
'this-is-the-first-case' | str pascal-case


'my_library.rb' | str replace '(.+).rb' '$1.nu'
'abc abc abc' | str replace -a 'b' 'z'


'Nushell' | str reverse
['Nushell' 'is' 'cool'] | str reverse


'nushell' | str rpad -l 10 -c '*'
'123' | str rpad -l 10 -c '0'


 "NuShell" | str screaming-snake-case
 "this_is_the_second_case" | str screaming-snake-case


 "NuShell" | str snake-case
 "this_is_the_second_case" | str snake-case


'my_library.rb' | str starts-with 'my'
'Cargo.toml' | str starts-with 'Car'


 'good nushell' | str substring [5 12]
 'good nushell' | str substring '5,12'


'nu-shell' | str title-case
'this is a test case' | str title-case


'Nu shell ' | str trim
'=== Nu shell ===' | str trim -c '=' | str trim


'nu' | str upcase


[a ab abc] | into df | str-lengths


[abcded abc321 abc123] | into df | str-slice 1 -l 2


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | strftime "%Y/%m/%d"


[[a b]; [one 2] [one 4] [two 1]]
    | into df
    | group-by a
    | agg (col b | sum)


[[a b]; [6 2] [1 4] [4 1]] | into df | sum


sys
(sys).host | get name


ls | table -n 1
echo [[a b]; [1 2] [3 4]] | table


let df = ([[a b]; [4 1] [5 2] [4 3]] | into df);
    let indices = ([0 2] | into df);
    $df | take $indices
let series = ([4 1 5 2 4 3] | into df);
    let indices = ([0 2] | into df);
    $series | take $indices


[1 2 3] | take
[1 2 3] | take 2


echo [-1 -2 9 1] | take until $it > 0


echo [-1 -2 9 1] | take while $it < 0


term size
term size -c





[[a b]; [1 2] [3 4]] | into df | to csv test.csv
[[a b]; [1 2] [3 4]] | into df | to csv test.csv -d '|'


[[foo bar]; [1 2]] | to csv
[[foo bar]; [1 2]] | to csv -s ';' 


[[foo bar]; [1 2]] | to html
[[foo bar]; [1 2]] | to html --partial


[a b c] | to json
[Joe Bob Sam] | to json -i 4


[[foo bar]; [1 2]] | to md
[[foo bar]; [1 2]] | to md --pretty


[1 2 3] | to nuon


[[a b]; [1 2] [3 4]] | into df | to parquet test.parquet


1 | to text
git help -a | lines | find -r '^ ' |  to text


[[foo bar]; ["1" "2"]] | to toml


[[foo bar]; [1 2]] | to tsv


[[foo bar]; ["1" "2"]] | to url


{ "note": { "children": [{ "remember": {"attributes" : {}, "children": [Event]}}], "attributes": {} } } | to xml
{ "note": { "children": [{ "remember": {"attributes" : {}, "children": [Event]}}], "attributes": {} } } | to xml -p 3


[[foo bar]; ["1" "2"]] | to yaml


touch fixture.json
touch a b c


echo [[c1 c2]; [1 2]] | transpose
echo [[c1 c2]; [1 2]] | transpose key val


tutor begin
tutor -f "$in"


[2 3 3 4] | uniq
[1 2 2] | uniq -d


[2 2 2 2 2] | into df | unique
col a | unique


echo {'name': 'nu', 'stars': 5} | update name 'Nushell'
echo [[count fruit]; [1 'apple']] | update count {|f| $f.count + 1}


[
    ["2021-04-16", "2021-06-10", "2021-09-18", "2021-10-15", "2021-11-16", "2021-11-17", "2021-11-18"];
    [          37,            0,            0,            0,           37,            0,            0]
] | update cells { |value|
      if $value == 0 {
        ""
      } else {
        $value
      }
}
[
    ["2021-04-16", "2021-06-10", "2021-09-18", "2021-10-15", "2021-11-16", "2021-11-17", "2021-11-18"];
    [          37,            0,            0,            0,           37,            0,            0]
] | update cells -c ["2021-11-18", "2021-11-17"] { |value|
        if $value == 0 {
          ""
        } else {
          $value
        }
}


[Abc aBc abC] | into df | uppercase


echo {'name': 'nu', 'stars': 5} | upsert name 'Nushell'
echo {'name': 'nu', 'stars': 5} | upsert language 'Rust'


echo 'http://www.example.com/foo/bar' | url host


echo 'http://www.example.com/foo/bar' | url path
echo 'http://www.example.com' | url path


echo 'http://www.example.com/?foo=bar&baz=quux' | url query
echo 'http://www.example.com/' | url query


echo 'http://www.example.com' | url scheme
echo 'test' | url scheme


module spam { export def foo [] { "foo" } }; use spam foo; foo
module foo { export env FOO_ENV { "BAZ" } }; use foo FOO_ENV; $env.FOO_ENV


[5 5 5 5 6 6] | into df | value-counts


[[a b]; [one 2] [one 2] [two 1] [two 1]]
    | into df
    | group-by a
    | agg (col b | var)


[[a b]; [6 2] [4 2] [2 2]] | into df | var


version


let abc = { echo 'hi' }; view-source $abc
def hi [] { echo 'Hi!' }; view-source hi


watch . --glob=**/*.rs { cargo test }
watch . { |op, path, new_path| $"($op) ($path) ($new_path)"}


when ((col a) > 2) 4
when ((col a) > 2) 4 | when ((col a) < 0) 6


open db.mysql
    | into db
    | select a
    | from table_1
    | where ((field a) > 1)
    | describe


ls | where size > 2kb
ls | where type == file


which myapp


echo [1 2 3 4] | window 2
[1, 2, 3, 4, 5, 6, 7, 8] | window 2 --stride 3


[[a b]; [1 2] [3 4]]
    | into df
    | with-column ([5 6] | into df) --name c
[[a b]; [1 2] [3 4]]
    | into lazy
    | with-column [
        ((col a) * 2 | as "c")
        ((col a) * 3 | as "d")
      ]
    | collect


with-env [MYENV "my env value"] { $env.MYENV }
with-env [X Y W Z] { $env.X }


echo [1 2 3] | wrap num


1..3 | zip 4..6


