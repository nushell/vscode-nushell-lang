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


echo [[status]; [UP] [UP]] | all status == UP


echo [2 4 6 8] | all ($it mod 2) == 0


[false false false] | into df | all-false


let s = ([5 6 2 10] | into df);
    let res = ($s > 9);
    $res | all-false


[true true true] | into df | all-true


let s = ([5 6 2 8] | into df);
    let res = ($s > 9);
    $res | all-true


(field a) > 1 | and ((field a) < 10) | into nu


open db.sqlite
    | from table table_1
    | select a
    | where ((field a) > 1)
    | and ((field b) == 1)
    | describe


open db.sqlite
    | from table table_1
    | select a
    | where ((field a) > 1 | and ((field a) < 10))
    | and ((field b) == 1)
    | describe


ansi green


ansi reset


echo [(ansi rb) Hello " " (ansi gb) Nu " " (ansi pb) World (ansi reset)] | str collect


echo [(ansi -e '3;93;41m') Hello (ansi reset) " " (ansi gb) Nu " " (ansi pb) World (ansi reset)] | str collect


$"(ansi -e { fg: '#0000ff' bg: '#ff0000' attr: b })Hello Nu World(ansi reset)"


echo 'Hello, Nushell! This is a gradient.' | ansi gradient --fgstart 0x40c9ff --fgend 0xe81cff


echo 'Hello, Nushell! This is a gradient.' | ansi gradient --fgstart 0x40c9ff --fgend 0xe81cff --bgstart 0xe81cff --bgend 0x40c9ff


echo 'Hello, Nushell! This is a gradient.' | ansi gradient --fgstart 0x40c9ff


echo 'Hello, Nushell! This is a gradient.' | ansi gradient --fgend 0xe81cff


echo [ (ansi green) (ansi cursor_on) "hello" ] | str collect | ansi strip


echo [[status]; [UP] [DOWN] [UP]] | any status == DOWN


echo [2 4 1 6 8] | any ($it mod 2) == 1


let a = ([[a b]; [1 2] [3 4]] | into df);
    $a | append $a


let a = ([[a b]; [1 2] [3 4]] | into df);
    $a | append $a --col


[0,1,2,3] | append 4


[0,1] | append [2,3,4]


[0,1] | append [2,nu,4,shell]


[1 3 2] | into df | arg-max


[1 3 2] | into df | arg-min


[1 2 2 3 3] | into df | arg-sort


[1 2 2 3 3] | into df | arg-sort -r


[false true false] | into df | arg-true


[1 2 2 3 3] | into df | arg-unique


let df = ([[a b]; [one 1] [two 2] [three 3]] | into df);
    $df | select (arg-where ((col b) >= 2) | as b_arg)


col a | as new_a | into nu


field name_a | as new_a | into nu


open db.sqlite
    | from table table_1
    | select a
    | as t1
    | describe


open db.sqlite
    | from table (
        open db.sqlite
        | from table table_a
        | select a b
      )
    | select a
    | as t1
    | describe


["2021-12-30" "2021-12-31"] | into df | as-datetime "%Y-%m-%d"


["2021-12-30 00:00:00" "2021-12-31 00:00:00"] | into df | as-datetime "%Y-%m-%d %H:%M:%S"


ast 'hello'


ast 'ls | where name =~ README'


ast 'for x in 1..10 { echo $x '


benchmark { sleep 500ms }


2 | bits and 2


[4 3 2] | bits and 2


[4 3 2] | bits not


[4 3 2] | bits not -n 2


[4 3 2] | bits not -s


2 | bits or 6


[8 3 2] | bits or 2


17 | bits rol 2


[5 3 2] | bits rol 2


17 | bits ror 60


[15 33 92] | bits ror 2 -n 1


2 | bits shl 7


2 | bits shl 7 -n 1


0x7F | bits shl 1 -s


[5 3 2] | bits shl 2


8 | bits shr 2


[15 35 2] | bits shr 2


2 | bits xor 2


[8 3 2] | bits xor 2


build-string a b c


build-string $"(1 + 2)" = one ' ' plus ' ' two


0x[1F FF AA AA] | bytes add 0x[AA]


0x[1F FF AA AA] | bytes add 0x[AA BB] -i 1


0x[FF AA AA] | bytes add 0x[11] -e


0x[FF AA BB] | bytes add 0x[11 22 33] -e -i 1


 0x[33 44 55 10 01 13] | bytes at [3 4]


 0x[33 44 55 10 01 13] | bytes at '3,4'


 0x[33 44 55 10 01 13] | bytes at ',-3'


 0x[33 44 55 10 01 13] | bytes at '3,'


 0x[33 44 55 10 01 13] | bytes at ',4'


 [[ColA ColB ColC]; [0x[11 12 13] 0x[14 15 16] 0x[17 18 19]]] | bytes at "1," ColB ColC


bytes build 0x[01 02] 0x[03] 0x[04]


[0x[11] 0x[13 15]] | bytes collect


[0x[11] 0x[33] 0x[44]] | bytes collect 0x[01]


0x[1F FF AA AA] | bytes ends-with 0x[AA]


0x[1F FF AA AA] | bytes ends-with 0x[FF AA AA]


0x[1F FF AA AA] | bytes ends-with 0x[11]


 0x[33 44 55 10 01 13 44 55] | bytes index-of 0x[44 55]


 0x[33 44 55 10 01 13 44 55] | bytes index-of -e 0x[44 55]


 0x[33 44 55 10 01 33 44 33 44] | bytes index-of -a 0x[33 44]


 0x[33 44 55 10 01 33 44 33 44] | bytes index-of -a -e 0x[33 44]


 [[ColA ColB ColC]; [0x[11 12 13] 0x[14 15 16] 0x[17 18 19]]] | bytes index-of 0x[11] ColA ColC


0x[1F FF AA AB] | bytes length


[0x[1F FF AA AB] 0x[1F]] | bytes length


0x[10 AA FF AA FF] | bytes remove 0x[10 AA]


0x[10 AA 10 BB 10] | bytes remove -a 0x[10]


0x[10 AA 10 BB CC AA 10] | bytes remove -e 0x[10]


[[ColA ColB ColC]; [0x[11 12 13] 0x[14 15 16] 0x[17 18 19]]] | bytes remove 0x[11] ColA ColC


0x[10 AA FF AA FF] | bytes replace 0x[10 AA] 0x[FF]


0x[10 AA 10 BB 10] | bytes replace -a 0x[10] 0x[A0]


[[ColA ColB ColC]; [0x[11 12 13] 0x[14 15 16] 0x[17 18 19]]] | bytes replace -a 0x[11] 0x[13] ColA ColC


0x[1F FF AA AA] | bytes reverse


0x[FF AA AA] | bytes reverse


0x[1F FF AA AA] | bytes starts-with 0x[1F FF AA]


0x[1F FF AA AA] | bytes starts-with 0x[1F]


0x[1F FF AA AA] | bytes starts-with 0x[11]


[[a b]; [6 2] [4 2] [2 2]] | into df | reverse | cache


cal


cal --full-year 2012


cal --week-start monday


cd ~


cd d/s/9


cd -


char newline


echo [(char prompt) (char newline) (char hamburger)] | str collect


char -u 1f378


char -i (0x60 + 1) (0x60 + 2)


char -u 1F468 200D 1F466 200D 1F466


clear


col a | into nu


echo 1 2 3 | collect { |x| echo $x.1 }


open foo.db | from table table_1 db | select a | collect


[[a b]; [1 2] [3 4]] | into lazy | collect


[[a b]; [1 2] [3 4]] | into df | columns


[[name,age,grade]; [bill,20,a]] | columns


[[name,age,grade]; [bill,20,a]] | columns | first


[[name,age,grade]; [bill,20,a]] | columns | select 1


echo [["Hello" "World"]; [$nothing 3]]| compact Hello


echo [["Hello" "World"]; [$nothing 3]]| compact World


echo [1, $nothing, 2] | compact


^external arg1 | complete


let df = ([[a b c]; [one two 1] [three four 2]] | into df);
    $df | with-column ((concat-str "-" [(col a) (col b) ((col c) * 2)]) | as concat)


let other = ([za xs cd] | into df);
    [abc abc abc] | into df | concatenate $other


config env


config nu


config reset


[abc acb acb] | into df | contains ab





let s = ([1 1 0 0 3 3 4] | into df);
    ($s / $s) | count-null


cp myfile dir_b


cp -r dir_a dir_b


cp -r -v dir_a dir_b


cp *.txt dir_a


[1 2 3 4 5] | into df | cumulative sum


"2021-10-22 20:00:12 +01:00" | date format


date format '%Y-%m-%d'


date format "%Y-%m-%d %H:%M:%S"


"2021-10-22 20:00:12 +01:00" | date format "%Y-%m-%d"


date humanize


"2021-10-22 20:00:12 +01:00" | date humanize


date list-timezone | where timezone =~ Shanghai


date now | date format "%Y-%m-%d %H:%M:%S"


(date now) - 2019-05-01


(date now) - 2019-05-01T04:12:05.20+08:00


date now | debug


date to-table


date now | date to-record


 '2020-04-12 22:10:57 +0200' | date to-record


date to-table


date now | date to-table


 '2020-04-12 22:10:57 +0200' | date to-table


date now | date to-timezone +0500


date now | date to-timezone local


date now | date to-timezone US/Hawaii


"2020-10-10 10:00:00 +02:00" | date to-timezone "+0500"


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


[1, 2, $nothing, 4] | default 3


'hello' | describe


[[a b]; [1 1] [1 1]] | into df | describe


open foo.db | from table table_1 | select col_1 | describe


echo 'a b c' | detect columns -n


echo $'c1 c2 c3(char nl)a b c' | detect columns


[true false true] | into df | df-not


do { echo hello }


do -i { thisisnotarealcommand }


do {|x| 100 + $x } 50


[0,1,2,3] | drop


[0,1,2,3] | drop 0


[0,1,2,3] | drop 2


[[a b]; [1 2] [3 4]] | into df | drop a


echo [[lib, extension]; [nu-lib, rs] [nu-core, rb]] | drop column


[sam,sarah,2,3,4,5] | drop nth 0 1 2


[0,1,2,3,4,5] | drop nth 0 1 2


[0,1,2,3,4,5] | drop nth 0 2 4


[0,1,2,3,4,5] | drop nth 2 0 4


echo [first second third fourth fifth] | drop nth (1..3)


[0,1,2,3,4,5] | drop nth 1..


[0,1,2,3,4,5] | drop nth 3..


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


[1 2 3] | each -n { |it| if $it.item == 2 { echo $"found 2 at ($it.index)!"} }


[1 2 3] | each --keep-empty { |it| if $it == 2 { echo "found 2!"} }


[1 2 3] | each while { |it| if $it < 3 {$it} else {$nothing} }


[1 2 3] | each while -n { |it| if $it.item < 2 { $"value ($it.item) at ($it.index)!"} else { $nothing } }


echo 'hello'


echo $nu


echo "負けると知って戦うのが、遥かに美しいのだ" | encode shift-jis


echo 'Some Data' | encode base64


echo 'Some Data' | encode base64 --character-set binhex


enter ../dir-foo


env | where name == PATH


env | any name == MY_ENV_ABC


'PATH' in (env).name


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


module spam { export def foo [] { "foo" } }
    module eggs { export use spam foo }
    use eggs foo
    foo
            


export-env { let-env SPAM = 'eggs' }; $env.SPAM


(col a) > 2) | expr-not


extern echo [text: string]


[[a b]; [6 2] [4 2] [2 2]] | into df | fetch 2


fetch url.com


fetch -u myuser -p mypass url.com


fetch -H [my-header-key my-header-value] url.com


field name_1 | into nu





[1 2 2 3 3] | into df | shift 2 | fill-null 0


[[a b]; [6 2] [4 2] [2 2]] | into df | filter ((col a) >= 4)


let mask = ([true false] | into df);
    [[a b]; [1 2] [3 4]] | into df | filter-with $mask


[[a b]; [1 2] [3 4]] | into df | filter-with ((col a) > 1)


ls | find toml md sh


echo Cargo.toml | find toml


[1 5 3kb 4 3Mb] | find 5 3kb


[moe larry curly] | find l


[2 4 3 6 5 8] | find --predicate { |it| ($it mod 2) == 1 }


[[version patch]; [0.1.0 false] [0.1.1 true] [0.2.0 false]] | find -p { |it| $it.patch }


[abc bde arc abf] | find --regex "ab"


[aBc bde Arc abf] | find --regex "ab" -i


[[version name]; [0.1.0 nushell] [0.1.1 fish] [0.2.0 zsh]] | find -r "nu"


[1 2 3] | first


[1 2 3] | first 2


0x[01 23 45] | first 2


col a | first


[[a b]; [1 2] [3 4]] | into df | first


[[a b]; [1 2] [3 4]] | into df | first 2


[[N, u, s, h, e, l, l]] | flatten 


[[N, u, s, h, e, l, l]] | flatten | first


[[origin, people]; [Ecuador, ([[name, meal]; ['Andres', 'arepa']])]] | flatten --all | get meal


[[origin, crate, versions]; [World, ([[name]; ['nu-cli']]), ['0.21', '0.22']]] | flatten versions --all | last | get versions


{ a: b, d: [ 1 2 3 4 ],  e: [ 4 3  ] } | flatten d --all





42 | fmt


fn count name_1 | into nu


open db.sqlite
    | from table table_a
    | select (fn lead col_a)
    | describe


for x in [1 2 3] { $x * $x }


for $x in 1..3 { $x }


for $it in ['bob' 'fred'] --numbered { $"($it.index) is ($it.item)" }


ls | format '{name}: {size}'


echo [[col1, col2]; [v1, v2] [v3, v4]] | format '{col2}'


ls | format filesize size KB


du | format filesize apparent B


open data.txt | from csv


open data.txt | from csv --noheaders


open data.txt | from csv -n


open data.txt | from csv --separator ';'


open data.txt | from csv --trim all


open data.txt | from csv --trim headers


open data.txt | from csv --trim fields


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


open db.sqlite | from table table_a | describe


'a = 1' | from toml


'a = 1
b = [1, 2]' | from toml


echo $'c1(char tab)c2(char tab)c3(char nl)1(char tab)2(char tab)3' | save tsv-data | open tsv-data | from tsv


echo $'a1(char tab)b1(char tab)c1(char nl)a2(char tab)b2(char tab)c2' | save tsv-data | open tsv-data | from tsv -n


echo $'a1(char tab)b1(char tab)c1(char nl)a2(char tab)b2(char tab)c2' | save tsv-data | open tsv-data | from tsv --trim all


echo $'a1(char tab)b1(char tab)c1(char nl)a2(char tab)b2(char tab)c2' | save tsv-data | open tsv-data | from tsv --trim headers


echo $'a1(char tab)b1(char tab)c1(char nl)a2(char tab)b2(char tab)c2' | save tsv-data | open tsv-data | from tsv --trim fields


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


g


mkdir foo bar; enter foo; enter ../bar; g 1


shells; g 2


mkdir foo bar; enter foo; enter ../bar; g -


[[a b]; [1 2] [3 4]] | into df | get a


ls | get name


ls | get name.2


ls | get 2.name


sys | get cpu


$env | get paTH


$env | get -s Path


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


glob "[Cc]*"


glob "{a?c,x?z}"


glob "(?i)c*"


glob "[!cCbMs]*"


glob <a*:3>


glob <[a-d]:1,10>


[1 2 3 a b c] | grid


[1 2 3 a b c] | wrap name | grid


{name: 'foo', b: 1, c: 2} | grid


[{name: 'A', v: 1} {name: 'B', v: 2} {name: 'C', v: 3}] | grid


[[name patch]; [0.1.0 false] [0.1.1 true] [0.2.0 false]] | grid


echo [1 2 3 4] | group 2


ls | group-by type


echo ['1' '3' '1' '3' '2' '1' '1'] | group-by


open db.sqlite
    | from table table_a
    | select (fn max a)
    | group-by a
    | describe


open db.sqlite
    | from table table_a
    | select (fn count *)
    | group-by a
    | describe


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


echo 'abcdefghijklmnopqrstuvwxyz' | hash md5


echo 'abcdefghijklmnopqrstuvwxyz' | hash md5 --binary


open ./nu_0_24_1_windows.zip | hash md5


echo 'abcdefghijklmnopqrstuvwxyz' | hash sha256


echo 'abcdefghijklmnopqrstuvwxyz' | hash sha256 --binary


open ./nu_0_24_1_windows.zip | hash sha256


"a b c|1 2 3" | split row "|" | split column " " | headers


"a b c|1 2 3|1 2 3 4" | split row "|" | split column " " | headers


help commands


help match


help str lpad


help --find char


alias lll = ls -l; hide lll


def say-hi [] { echo 'Hi!' }; hide say-hi


let-env HZ_ENV_ABC = 1; hide HZ_ENV_ABC; 'HZ_ENV_ABC' in (env).name


let-env HZ_ENV_ABC = 1; hide-env HZ_ENV_ABC; 'HZ_ENV_ABC' in (env).name


ls | histogram type


ls | histogram type freq


echo [1 2 3 1 1 1 2 2 1 1] | histogram


echo [1 2 3 1 1 1 2 2 1 1] | histogram --percentage-type relative


history | length


history | last 5


history | wrap cmd | where cmd =~ cargo


if 2 < 3 { 'yes!' }


if 5 < 3 { 'yes!' } else { 'no!' }


if 5 < 3 { 'yes!' } else if 4 < 5 { 'no!' } else { 'okay!' }


echo done | ignore


let user-input = (input)


echo {'name': 'nu', 'stars': 5} | insert alias 'Nushell'


'This is a string that is exactly 52 characters long.' | into binary


1 | into binary


true | into binary


ls | where name == LICENSE | get size | into binary


ls | where name == LICENSE | get name | path expand | into binary


1.234 | into binary


echo [[value]; ['false'] ['1'] [0] [1.0] [true]] | into bool value


true | into bool


1 | into bool


'0.0' | into bool


'true' | into bool


'27.02.2021 1:55 pm +0000' | into datetime


'2021-02-27T13:55:40+00:00' | into datetime


'20210227_135540+0000' | into datetime -f '%Y%m%d_%H%M%S%z'


1614434140 | into datetime


1614434140 | into datetime -o +9


1656165681720 | into datetime


open db.sqlite | into db


[[num]; ['5.01']] | into decimal num


'1.345' | into decimal


'-5.9' | into decimal


true | into decimal


[[a b];[1 2] [3 4]] | into df


[[1 2 a] [3 4 b] [5 6 c]] | into df


[a b c] | into df


[true true false] | into df


echo [[value]; ['1sec'] ['2min'] ['3hr'] ['4day'] ['5wk']] | into duration value


'7min' | into duration


'7min' | into duration --convert sec


[[bytes]; ['5'] [3.2] [4] [2kb]] | into filesize bytes


'2' | into filesize


8.3 | into filesize


5 | into filesize


4KB | into filesize


echo [[num]; ['-5'] [4] [1.5]] | into int num


'2' | into int


5.9 | into int


'5.9' | into int


4KB | into int


[false, true] | into int


2022-02-02 | into int


'1101' | into int -r 2


'FF' |  into int -r 16


'0o10132' | into int


'0010132' | into int


'0010132' | into int -r 8


[[a b];[1 2] [3 4]] | into lazy


col a | into nu


[[a b]; [1 2] [3 4]] | into df | into nu


[[a b]; [1 2] [5 6] [3 4]] | into df | into nu -t -n 1


field name_1 | into nu


ls | into sqlite my_ls.db


ls | into sqlite my_ls.db -t my_table


[[name]; [-----] [someone] [=====] [somename] ['(((((']] | into sqlite filename.db


[one 2 5.2 six true 100mib 25sec] | into sqlite variety.db


5 | into string -d 3


1.7 | into string -d 0


1.7 | into string -d 1


1.734 | into string -d 2


1.734 | into string -d -2


4.3 | into string


'1234' | into string


true | into string


date now | into string


ls Cargo.toml | get name | into string


ls Cargo.toml | get size | into string


if is-admin { echo "iamroot" } else { echo "iamnotroot" }


[5 6 6 6 8 8 8] | into df | is-duplicated


[[a, b]; [1 2] [1 2] [3 3] [3 3] [1 1]] | into df | is-duplicated


'' | is-empty


[] | is-empty


[[meal size]; [arepa small] [taco '']] | is-empty meal size


let df = ([[a b]; [one 1] [two 2] [three 3]] | into df);
    $df | with-column (col a | is-in [one two] | as a_in)


let other = ([1 3 6] | into df);
    [5 6 6 6 8 8 8] | into df | is-in $other


let s = ([5 6 0 8] | into df);
    let res = ($s / $s);
    $res | is-not-null


col a | is-not-null


col a | is-null


let s = ([5 6 0 8] | into df);
    let res = ($s / $s);
    $res | is-null


[5 6 6 6 8 8 8] | into df | is-unique


[[a, b]; [1 2] [1 2] [3 3] [3 3] [1 1]] | into df | is-unique


let df_a = ([[a b c];[1 "a" 0] [2 "b" 1] [1 "c" 2] [1 "c" 3]] | into lazy);
    let df_b = ([["foo" "bar" "ham"];[1 "a" "let"] [2 "c" "var"] [3 "c" "const"]] | into lazy);
    $df_a | join $df_b a foo | collect


let df_a = ([[a b c];[1 "a" 0] [2 "b" 1] [1 "c" 2] [1 "c" 3]] | into df);
    let df_b = ([["foo" "bar" "ham"];[1 "a" "let"] [2 "c" "var"] [3 "c" "const"]] | into lazy);
    $df_a | join $df_b a foo


open db.sqlite
    | from table table_1 --as t1
    | join table_2 col_b --as t2
    | select col_a
    | describe


open db.sqlite
    | from table table_1 --as t1
    | join (
        open db.sqlite
        | from table table_2
        | select col_c
      ) ((field t1.col_a) == (field t2.col_c)) --as t2 --right
    | select col_a
    | describe


keybindings default


keybindings list -m


keybindings list -e -d


keybindings list


keybindings listen


ps | sort-by mem | last | kill $in.pid


kill --force 12345


kill -s 2 12345


col a | last


[[a b]; [1 2] [3 4]] | into df | last 1


[1,2,3] | last 2


[1,2,3] | last


echo [1 2 3 4 5] | length


cal | length -c


let x = 10


let x = 10 + 100


let x = if false { -1 } else { 1 }


let-env MY_ENV_VAR = 1; $env.MY_ENV_VAR


open db.sqlite
    | from table table_a
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


ls -f ..


ls *.rs


ls -s | where name !~ bar


ls ~ | where type == dir


ls -s ~ | where type == dir && modified < ((date now) - 7day)


['/path/to/directory' '/path/to/file'] | each { |it| ls -D $it } | flatten


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


[[a b]; [6 2] [1 4] [4 1]] | into df | max


[[a b]; [one 2] [one 4] [two 1]]
    | into df
    | group-by a
    | agg (col b | max)


[[a b]; [6 2] [4 2] [2 2]] | into df | mean


[[a b]; [one 2] [one 4] [two 1]]
    | into df
    | group-by a
    | agg (col b | mean)


[[a b]; [one 2] [one 4] [two 1]]
    | into df
    | group-by a
    | agg (col b | median)


[[a b]; [6 2] [4 2] [2 2]] | into df | median


[[a b c d]; [x 1 4 a] [y 2 5 b] [z 3 6 c]] | into df | melt -c [b c] -v [a d]


[a b c] | wrap name | merge { [1 2 3] | wrap index }


{a: 1, b: 2} | merge { {c: 3} }


{a: 1, b: 3} | merge { {b: 2, c: 4} }


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


module foo { export def-env bar [] { let-env FOO_BAR = "BAZ" } }; use foo bar; bar; $env.FOO_BAR


[[name value index]; [foo a 1] [bar b 2] [baz c 3]] | move index --before name


[[name value index]; [foo a 1] [bar b 2] [baz c 3]] | move value name --after index


{ name: foo, value: a, index: 1 } | move name --before index


mv before.txt after.txt


mv test.txt my/subdirectory


mv *.txt my/subdirectory


mkdir foo bar; enter foo; enter ../bar; n


n


col a | n-unique


[1 1 2 2 3 3 4] | into df | n-unique


nu-check script.nu


nu-check --as-module module.nu


nu-check -d script.nu


open foo.nu | nu-check -d script.nu


open module.nu | lines | nu-check -d --as-module module.nu


echo $'two(char nl)lines' | nu-check 


nu-check -a script.nu


open foo.nu | lines | nu-check -ad


'let x = 3' | nu-highlight


open myfile.json


open myfile.json --raw


echo 'myfile.txt' | open


open myfile.txt --raw | decode utf-8


open-db file.sqlite


open test.csv


open db.sqlite
    | from table table_1
    | select a
    | where ((field a) > 1)
    | or ((field b) == 1)
    | describe


open db.sqlite
    | from table table_1
    | select a
    | where ((field a) > 1 | or ((field a) < 10))
    | or ((field b) == 1)
    | describe


(field a) > 1 | or ((field a) < 10) | into nu


open db.sqlite
    | from table table_a
    | select a
    | order-by a
    | describe


open db.sqlite
    | from table table_a
    | select a
    | order-by a --ascending
    | order-by b
    | describe


when ((col a) > 2) 4 | otherwise 5


when ((col a) > 2) 4 | when ((col a) < 0) 6 | otherwise 0


[[a b]; [6 2] [1 4] [4 1]]
   | into lazy
   | with-column (
       when ((col a) > 2) 4 | otherwise 5 | as c
     )
   | with-column (
       when ((col a) > 5) 10 | when ((col a) < 2) 6 | otherwise 0 | as d
     )
   | collect


fn avg col_a | over col_b | into nu


open db.sqlite
    | from table table_a
    | select (fn lead col_a | over col_b)
    | describe


module spam { export def foo [] { "foo" } }
    overlay use spam
    overlay hide spam


echo 'export alias f = "foo"' | save spam.nu
    overlay use spam.nu
    overlay hide spam


module spam { export env FOO { "foo" } }
    overlay use spam
    overlay hide


overlay new spam
    cd some-dir
    overlay hide --keep-env [ PWD ] spam


module spam { export def foo [] { "foo" } }
    overlay use spam
    overlay list | last


overlay new spam


module spam { export def foo [] { "foo" } }
    overlay use spam
    foo


echo 'export def foo { "foo" }'
    overlay use --prefix spam
    spam foo


echo 'export env FOO { "foo" }' | save spam.nu
    overlay use spam.nu
    $env.FOO


mkdir foo bar; enter foo; enter ../bar; p


p


[1 2 3] | par-each { |it| 2 * $it }


[1 2 3] | par-each -n { |it| if $it.item == 2 { echo $"found 2 at ($it.index)!"} }


echo "hi there" | parse "{foo} {bar}"


echo "hi there" | parse -r '(?P<foo>\w+) (?P<bar>\w+)'


echo "foo bar." | parse -r '\s*(?<name>\w+)(?=\.)'


echo "foo! bar." | parse -r '(\w+)(?=\.)|(\w+)(?=!)'


echo " @another(foo bar)   " | parse -r '\s*(?<=[() ])(@\w+)(\([^)]*\))?\s*'


echo "abcd" | parse -r '^a(bc(?=d)|b)cd$'


'/home/joe/test.txt' | path basename


[[name];[/home/joe]] | path basename -c [ name ]


'/home/joe/test.txt' | path basename -r 'spam.png'


'/home/joe/code/test.txt' | path dirname


ls ('.' | path expand) | path dirname -c [ name ]


'/home/joe/code/test.txt' | path dirname -n 2


'/home/joe/code/test.txt' | path dirname -n 2 -r /home/viking


'/home/joe/todo.txt' | path exists


ls | path exists -c [ name ]


'/home/joe/foo/../bar' | path expand


ls | path expand -c [ name ]


'foo/../bar' | path expand


'/home/viking' | path join spam.txt


'/home/viking' | path join spams this_spam.txt


ls | path join spam.txt -c [ name ]


[ '/' 'home' 'viking' 'spam.txt' ] | path join


[[ parent stem extension ]; [ '/home/viking' 'spam' 'txt' ]] | path join


'/home/viking/spam.txt' | path parse


'/home/viking/spam.tar.gz' | path parse -e tar.gz | upsert extension { 'txt' }


'/etc/conf.d' | path parse -e ''


ls | path parse -c [ name ]


'/home/viking' | path relative-to '/home'


ls ~ | path relative-to ~ -c [ name ]


'eggs/bacon/sausage/spam' | path relative-to 'eggs/bacon/sausage'


'/home/viking/spam.txt' | path split


ls ('.' | path expand) | path split -c [ name ]


'.' | path type


ls | path type -c [ name ]


port 3121 4000


port


post url.com 'body'


post -u myuser -p mypass url.com 'body'


post -H [my-header-key my-header-value] url.com


post -t application/json url.com { field: value }


[1,2,3,4] | prepend 0


[2,3,4] | prepend [0,1]


[2,nu,4,shell] | prepend [0,1,rocks]


print "hello world"


print (2 + 3)


ps


ps | sort-by mem | last 5


ps | sort-by cpu | last 3


ps | where name =~ 'nu'


[[a b]; [6 2] [1 4] [4 1]] | into df | quantile 0.5


[[a b]; [one 2] [one 4] [two 1]]
    | into df
    | group-by a
    | agg (col b | quantile 0.5)


open foo.db | query db "SELECT * FROM Bar"


random bool


random bool --bias 0.75


random chars


random chars -l 20


random decimal


random decimal ..500


random decimal 100000..


random decimal 1.0..1.1


random dice


random dice -d 10 -s 12


random integer


random integer ..500


random integer 100000..


random integer 1..10


random uuid


[0,1,2,3,4,5] | range 4..5


[0,1,2,3,4,5] | range (-2)..


[0,1,2,3,4,5] | range (-3)..-2


[ 1 2 3 4 ] | reduce {|it, acc| $it + $acc }


[ 1 2 3 ] | reduce -n {|it, acc| $acc.item + $it.item }


[ 1 2 3 4 ] | reduce -f 10 {|it, acc| $acc + $it }


[ i o t ] | reduce -f "Arthur, King of the Britons" {|it, acc| $acc | str replace -a $it "X" }


[ one longest three bar ] | reduce -n { |it, acc|
                    if ($it.item | str length) > ($acc.item | str length) {
                        $it.item
                    } else {
                        $acc.item
                    }
                }


register -e json ~/.cargo/bin/nu_plugin_query


let plugin = ((which nu).path.0 | path dirname | path join 'nu_plugin_query'); nu -c $'register -e json ($plugin); version'


ls | reject modified


echo {a: 1, b: 2} | reject a


echo {a: {b: 3,c: 5}} | reject a.b


[[a, b]; [1, 2]] | rename my_column


[[a, b, c]; [1, 2, 3]] | rename eggs ham bacon


[[a, b, c]; [1, 2, 3]] | rename -c [a ham]


[5 6 7 8] | into df | rename '0' new_name


[[a b]; [1 2] [3 4]] | into df | rename a a_new


[[a b]; [1 2] [3 4]] | into df | rename [a b] [a_new b_new]


[abc abc abc] | into df | replace -p ab -r AB


[abac abac abac] | into df | replace-all -p a -r A


[0,1,2,3] | reverse


[[a b]; [6 2] [4 2] [2 2]] | into df | reverse


rm file.txt


rm --trash file.txt


rm --permanent file.txt


rm --force file.txt


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


[[a b]; [1 2]] | rotate col_a col_b


[[a b]; [1 2]] | rotate --ccw


[[a b]; [1 2] [3 4] [5 6]] | rotate --ccw


[[a b]; [1 2]] | rotate --ccw col_a col_b


run-external "echo" "-n" "hello"


[[a b]; [1 2] [3 4]] | into df | sample -n 1


[[a b]; [1 2] [3 4] [5 6]] | into df | sample -f 0.5 -e


echo 'save me' | save foo.txt


echo 'append me' | save --append foo.txt


echo { a: 1, b: 2 } | save foo.json


open foo.db | schema


ls | select name


ls | select name size


open db.sqlite | into db | select a | describe


open db.sqlite
    | into db
    | select (field a | as new_a) b c
    | from table table_1
    | describe


[[a b]; [6 2] [4 2] [2 2]] | into df | select a


seq 1 10


seq 1.0 0.1 2.0


seq -s '|' 1 10


seq -s '|' -w 1 10


seq -s ' | ' -w 1 2 10


seq char a e


seq char -s '|' a e


seq date --days 10


seq date --days 10 -r


seq date --days 10 -o '%m/%d/%Y' -r


seq date -b '2020-01-01' -e '2020-01-10'


seq date -b '2020-01-01' -e '2020-01-31' -n 5


seq date -o %x -s ':' -d 10 -b '2020-05-01'


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


"Amélie Amelie" | size


echo [[editions]; [2015] [2018] [2021]] | skip 2


echo [2 4 6 8] | skip


echo [-2 0 2 -1] | skip until $it > 0


echo [-2 0 2 -1] | skip while $it < 0


sleep 1sec


sleep 1sec 1sec 1sec


sleep 1sec; echo done


[[a b]; [1 2] [3 4]] | into df | slice 0 1


[2 0 1] | sort


[2 0 1] | sort -r


[betty amy sarah] | sort


[betty amy sarah] | sort -r


echo [airplane Truck Car] | sort -i


echo [airplane Truck Car] | sort -i -r


{b: 3, a: 4} | sort


{a: 4, b: 3} | sort


[[a b]; [6 2] [1 4] [4 1]] | into df | sort-by a


[[a b]; [6 2] [1 1] [1 4] [2 4]] | into df | sort-by [a b] -r [false true]


[2 0 1] | sort-by


[2 0 1] | sort-by -r


[betty amy sarah] | sort-by


[betty amy sarah] | sort-by -r


[test1 test11 test2] | sort-by -n


echo [airplane Truck Car] | sort-by -i


echo [airplane Truck Car] | sort-by -i -r


[[fruit count]; [apple 9] [pear 3] [orange 7]] | sort-by fruit -r


source foo.nu


source ./foo.nu; say-hi


source-env foo.nu


'hello' | split chars


echo 'a--b--c' | split column '--'


echo 'abc' | split column -c ''


[a, b, c, d, e, f, g] | split list d


[[1,2], [2,3], [3,4]] | split list [2,3]


echo 'abc' | split row ''


echo 'a--b--c' | split row '--'


'hello world' | split words


'hello to the world' | split words -l 3


fetch https://www.gutenberg.org/files/11/11-0.txt | str downcase | split words -l 2 | uniq -c | sort-by count --reverse | first 10



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


 'this_is_the_second_case' | str camel-case


[[lang, gems]; [nu_test, 100]] | str camel-case lang


'good day' | str capitalize


'anton' | str capitalize


[[lang, gems]; [nu_test, 100]] | str capitalize lang


['nu', 'shell'] | str collect


['nu', 'shell'] | str collect '-'


'my_library.rb' | str contains '.rb'


'my_library.rb' | str contains -i '.RB'


 [[ColA ColB]; [test 100]] | str contains 'e' ColA


 [[ColA ColB]; [test 100]] | str contains -i 'E' ColA


 [[ColA ColB]; [test hello]] | str contains 'e' ColA ColB


'hello' | str contains 'banana'


[one two three] | str contains o


[one two three] | str contains -n o


'nushell' | str distance 'nutshell'


'NU' | str downcase


'TESTa' | str downcase


[[ColA ColB]; [Test ABC]] | str downcase ColA


[[ColA ColB]; [Test ABC]] | str downcase ColA ColB


'my_library.rb' | str ends-with '.rb'


'my_library.rb' | str ends-with '.txt'


 'my_library.rb' | str index-of '.rb'


 '.rb.rb' | str index-of '.rb' -r '1,'


 '123456' | str index-of '6' -r ',4'


 '123456' | str index-of '3' -r '1,4'


 '123456' | str index-of '3' -r [1 4]


 '/this/is/some/path/file.txt' | str index-of '/' -e


'NuShell' | str kebab-case


'thisIsTheFirstCase' | str kebab-case


'THIS_IS_THE_SECOND_CASE' | str kebab-case


[[lang, gems]; [nuTest, 100]] | str kebab-case lang


'hello' | str length


['hi' 'there'] | str length


'nushell' | str lpad -l 10 -c '*'


'123' | str lpad -l 10 -c '0'


'123456789' | str lpad -l 3 -c '0'


'▉' | str lpad -l 10 -c '▉'


'nu-shell' | str pascal-case


'this-is-the-first-case' | str pascal-case


'this_is_the_second_case' | str pascal-case


[[lang, gems]; [nu_test, 100]] | str pascal-case lang


'my_library.rb' | str replace '(.+).rb' '$1.nu'


'abc abc abc' | str replace -a 'b' 'z'


[[ColA ColB ColC]; [abc abc ads]] | str replace -a 'b' 'z' ColA ColC


'dogs_$1_cats' | str replace '\$1' '$2' -n


'c:\some\cool\path' | str replace 'c:\some\cool' '~' -s


'abc abc abc' | str replace -a 'b' 'z' -s


'a sucessful b' | str replace '\b([sS])uc(?:cs|s?)e(ed(?:ed|ing|s?)|ss(?:es|ful(?:ly)?|i(?:ons?|ve(?:ly)?)|ors?)?)\b' '${1}ucce$2'


'GHIKK-9+*' | str replace '[*[:xdigit:]+]' 'z'


'Nushell' | str reverse


['Nushell' 'is' 'cool'] | str reverse


'nushell' | str rpad -l 10 -c '*'


'123' | str rpad -l 10 -c '0'


'123456789' | str rpad -l 3 -c '0'


'▉' | str rpad -l 10 -c '▉'


 "NuShell" | str screaming-snake-case


 "this_is_the_second_case" | str screaming-snake-case


"this-is-the-first-case" | str screaming-snake-case


[[lang, gems]; [nu_test, 100]] | str screaming-snake-case lang


 "NuShell" | str snake-case


 "this_is_the_second_case" | str snake-case


"this-is-the-first-case" | str snake-case


[[lang, gems]; [nuTest, 100]] | str snake-case lang


'my_library.rb' | str starts-with 'my'


'Cargo.toml' | str starts-with 'Car'


'Cargo.toml' | str starts-with '.toml'


 'good nushell' | str substring [5 12]


 'good nushell' | str substring '5,12'


 'good nushell' | str substring ',-5'


 'good nushell' | str substring '5,'


 'good nushell' | str substring ',7'


'nu-shell' | str title-case


'this is a test case' | str title-case


[[title, count]; ['nu test', 100]] | str title-case title


'Nu shell ' | str trim


'=== Nu shell ===' | str trim -c '=' | str trim


' Nu   shell ' | str trim -a


' Nu shell ' | str trim -l


'=== Nu shell ===' | str trim -c '='


' Nu shell ' | str trim -r


'=== Nu shell ===' | str trim -r -c '='


'nu' | str upcase


[a ab abc] | into df | str-lengths


[abcded abc321 abc123] | into df | str-slice 1 -l 2


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | into df);
    $df | strftime "%Y/%m/%d"


[[a b]; [6 2] [1 4] [4 1]] | into df | sum


[[a b]; [one 2] [one 4] [two 1]]
    | into df
    | group-by a
    | agg (col b | sum)


sys


(sys).host | get name


(sys).host.name


ls | table -n 1


echo [[a b]; [1 2] [3 4]] | table


[1 2 3] | take


[1 2 3] | take 2


let df = ([[a b]; [4 1] [5 2] [4 3]] | into df);
    let indices = ([0 2] | into df);
    $df | take $indices


let series = ([4 1 5 2 4 3] | into df);
    let indices = ([0 2] | into df);
    $series | take $indices


echo [-1 -2 9 1] | take until $it > 0


echo [-1 -2 9 1] | take while $it < 0


term size


term size -c


term size -r





[[foo bar]; [1 2]] | to csv


[[foo bar]; [1 2]] | to csv -s ';' 


[[a b]; [1 2] [3 4]] | into df | to csv test.csv


[[a b]; [1 2] [3 4]] | into df | to csv test.csv -d '|'


[[foo bar]; [1 2]] | to html


[[foo bar]; [1 2]] | to html --partial


[[foo bar]; [1 2]] | to html --dark


[a b c] | to json


[Joe Bob Sam] | to json -i 4


[1 2 3] | to json -r


[[foo bar]; [1 2]] | to md


[[foo bar]; [1 2]] | to md --pretty


[{"H1": "Welcome to Nushell" } [[foo bar]; [1 2]]] | to md --per-element --pretty


[0 1 2] | to md --pretty


[1 2 3] | to nuon


[[a b]; [1 2] [3 4]] | into df | to parquet test.parquet


1 | to text


git help -a | lines | find -r '^ ' |  to text


ls |  to text


[[foo bar]; ["1" "2"]] | to toml


[[foo bar]; [1 2]] | to tsv


[[foo bar]; ["1" "2"]] | to url


{ "note": { "children": [{ "remember": {"attributes" : {}, "children": [Event]}}], "attributes": {} } } | to xml


{ "note": { "children": [{ "remember": {"attributes" : {}, "children": [Event]}}], "attributes": {} } } | to xml -p 3


[[foo bar]; ["1" "2"]] | to yaml


touch fixture.json


touch a b c


touch -m fixture.json


touch -m -t 201908241230.30 d e


touch -m -d "yesterday" a b c


touch -m -r fixture.json d e


touch -a -d "August 24, 2019; 12:30:30" fixture.json


touch -c -t 201908241230.30 a b c


echo [[c1 c2]; [1 2]] | transpose


echo [[c1 c2]; [1 2]] | transpose key val


echo [[c1 c2]; [1 2]] | transpose -i val


echo {c1: 1, c2: 2} | transpose | transpose -i -r -d


tutor begin


tutor -f "$in"


[2 3 3 4] | uniq


[1 2 2] | uniq -d


[1 2 2] | uniq -u


['hello' 'goodbye' 'Hello'] | uniq -i


[1 2 2] | uniq -c


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


echo [[count fruit]; [1 'apple']] | upsert count {|f| $f.count + 1}


echo [[project, authors]; ['nu', ['Andrés', 'JT', 'Yehuda']]] | upsert authors {|a| $a.authors | str collect ','}


echo 'http://www.example.com/foo/bar' | url host


echo 'http://www.example.com/foo/bar' | url path


echo 'http://www.example.com' | url path


echo 'http://www.example.com/?foo=bar&baz=quux' | url query


echo 'http://www.example.com/' | url query


echo 'http://www.example.com' | url scheme


echo 'test' | url scheme


module spam { export def foo [] { "foo" } }; use spam foo; foo


module foo { export env FOO_ENV { "BAZ" } }; use foo FOO_ENV; $env.FOO_ENV


module foo { export def-env bar [] { let-env FOO_BAR = "BAZ" } }; use foo bar; bar; $env.FOO_BAR


[5 5 5 5 6 6] | into df | value-counts


[[a b]; [6 2] [4 2] [2 2]] | into df | var


[[a b]; [one 2] [one 2] [two 1] [two 1]]
    | into df
    | group-by a
    | agg (col b | var)


version


let abc = { echo 'hi' }; view-source $abc


def hi [] { echo 'Hi!' }; view-source hi


def-env foo [] { let-env BAR = 'BAZ' }; view-source foo


module mod-foo { export env FOO_ENV { 'BAZ' } }; view-source mod-foo


alias hello = echo hi; view-source hello


watch . --glob=**/*.rs { cargo test }


watch . { |op, path, new_path| $"($op) ($path) ($new_path)"}


watch /foo/bar { |op, path| $"($op) - ($path)(char nl)" | save --append changes_in_bar.log }


when ((col a) > 2) 4


when ((col a) > 2) 4 | when ((col a) < 0) 6


[[a b]; [6 2] [1 4] [4 1]]
   | into lazy
   | with-column (
       when ((col a) > 2) 4 | otherwise 5 | as c
     )
   | with-column (
       when ((col a) > 5) 10 | when ((col a) < 2) 6 | otherwise 0 | as d
     )
   | collect


open db.sqlite
    | from table table_1
    | select a
    | where ((field a) > 1)
    | describe


ls | where size > 2kb


ls | where type == file


ls | where name =~ "Car"


ls | where modified >= (date now) - 2wk


let a = {$in > 3}; [1, 2, 5, 6] | where -b $a


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


with-env [[X W]; [Y Z]] { $env.W }


echo '{"X":"Y","W":"Z"}'|from json|with-env $in { echo $env.X $env.W }


echo [1 2 3] | wrap num


1..3 | zip 4..6


