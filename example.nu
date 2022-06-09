alias ll = ls -l


echo [[status]; [UP] [UP]] | all? status == UP


ansi green


echo 'Hello, Nushell! This is a gradient.' | ansi gradient --fgstart 0x40c9ff --fgend 0xe81cff


echo [ (ansi green) (ansi cursor_on) "hello" ] | str collect | ansi strip


echo [[status]; [UP] [DOWN] [UP]] | any? status == DOWN


[0,1,2,3] | append 4


benchmark { sleep 500ms }


build-string a b c


cal


cd ~


char newline


clear


echo 1 2 3 | collect { |x| echo $x.1 }


[[name,age,grade]; [bill,20,a]] | columns


echo [["Hello" "World"]; [$nothing 3]]| compact Hello


^external arg1 | complete


config env


config nu


cp myfile dir_b


"2021-10-22 20:00:12 +01:00" | date format


date humanize


date list-timezone | where timezone =~ Shanghai


date now | date format "%Y-%m-%d %H:%M:%S"


date to-table


date to-table


date now | date to-timezone +0500


db open db.mysql 
    | db select a 
    | db from table_1 
    | db where ((db col a) > 1) 
    | db and ((db col b) == 1) 
    | db describe


db col name_a | db as new_a


db col name_1


open foo.db | db select a | db from table_1 | db collect


db open foo.db | db select table_1 | db describe


db fn count name_1


db open db.mysql | db from table_a


db open db.mysql 
    | db from table_a 
    | db select a 
    | db group-by a 
    | db describe





db open db.mysql 
    | db from table_a 
    | db select a 
    | db limit 10 
    | db describe


db open file.sqlite


db open db.mysql 
    | db select a 
    | db from table_1 
    | db where ((db col a) > 1) 
    | db or ((db col b) == 1) 
    | db describe


db open db.mysql 
    | db from table_a 
    | db select a 
    | db order-by a 
    | db describe


db function avg col_a | db over col_b


db open foo.db | db query "SELECT * FROM Bar"


open foo.db | db schema


db open db.mysql | db select a | db describe





db open db.mysql 
    | db select a 
    | db from table_1 
    | db where ((db col a) > 1) 
    | db describe


'hello' | debug


cat myfile.q | decode utf-8


def say-hi [] { echo 'hi' }; say-hi


def-env foo [] { let-env BAR = "BAZ" }; foo; $env.BAR


ls -la | default 'nothing' target 


'hello' | describe


echo 'a b c' | detect columns -n





[[a b]; [1 2] [1 4] [2 6] [2 4]]
    | dfr to-df
    | dfr group-by a
    | dfr aggregate [
        ("b" | dfr min | dfr as "b_min")
        ("b" | dfr max | dfr as "b_max")
        ("b" | dfr sum | dfr as "b_sum")
     ]


[false false false] | dfr to-df | dfr all-false


[true true true] | dfr to-df | dfr all-true


let a = ([[a b]; [1 2] [3 4]] | dfr to-df);
    $a | dfr append $a


[1 3 2] | dfr to-df | dfr arg-max


[1 3 2] | dfr to-df | dfr arg-min


[1 2 2 3 3] | dfr to-df | dfr arg-sort


[false true false] | dfr to-df | dfr arg-true


[1 2 2 3 3] | dfr to-df | dfr arg-unique


(dfr col a | df as new_a)


["2021-12-30" "2021-12-31"] | dfr to-df | dfr as-datetime "%Y-%m-%d"


["2021-12-30 00:00:00" "2021-12-31 00:00:00"] | dfr to-df | dfr as-datetime "%Y-%m-%d %H:%M:%S"





dfr col col_a | dfr to-nu





[[a b]; [1 2] [3 4]] | dfr to-df | dfr column a


let other = ([za xs cd] | dfr to-df);
    [abc abc abc] | dfr to-df | dfr concatenate $other


[abc acb acb] | dfr to-df | dfr contains ab


let s = ([1 1 0 0 3 3 4] | dfr to-df);
    ($s / $s) | dfr count-null


[1 1 2 2 3 3 4] | dfr to-df | dfr count-unique


[1 2 3 4 5] | dfr to-df | dfr cumulative sum


[[a b]; [1 1] [1 1]] | dfr to-df | dfr describe


[[a b]; [1 2] [3 4]] | dfr to-df | dfr drop a


[[a b]; [1 2] [3 4] [1 2]] | dfr to-df | dfr drop-duplicates


let df = ([[a b]; [1 2] [3 0] [1 2]] | dfr to-df);
    let res = ($df.b / $df.b);
    let a = ($df | dfr with-column $res --name res);
    $a | dfr drop-nulls


[[a b]; [1 2] [3 4]] | dfr to-df | dfr dtypes














let mask = ([true false] | dfr to-df);
    [[a b]; [1 2] [3 4]] | dfr to-df | dfr filter-with $mask


[[a b]; [1 2] [3 4]] | dfr to-df | dfr first 1





[[a b]; [1 2] [3 4]] | dfr to-df | dfr get a


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | dfr to-df);
    $df | dfr get-day


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | dfr to-df);
    $df | dfr get-hour


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | dfr to-df);
    $df | dfr get-minute


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | dfr to-df);
    $df | dfr get-month


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | dfr to-df);
    $df | dfr get-nanosecond


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | dfr to-df);
    $df | dfr get-ordinal


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | dfr to-df);
    $df | dfr get-second


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | dfr to-df);
    $df | dfr get-week


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | dfr to-df);
    $df | dfr get-weekday


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | dfr to-df);
    $df | dfr get-year


[[a b]; [1 2] [1 4] [2 6] [2 4]]
    | dfr to-df
    | dfr group-by a
    | dfr aggregate [
        ("b" | dfr min | dfr as "b_min")
        ("b" | dfr max | dfr as "b_max")
        ("b" | dfr sum | dfr as "b_sum")
     ]


[5 6 6 6 8 8 8] | dfr to-df | dfr is-duplicated


let other = ([1 3 6] | dfr to-df);
    [5 6 6 6 8 8 8] | dfr to-df | dfr is-in $other


let s = ([5 6 0 8] | dfr to-df);
    let res = ($s / $s);
    $res | dfr is-not-null


let s = ([5 6 0 8] | dfr to-df);
    let res = ($s / $s);
    $res | dfr is-null


[5 6 6 6 8 8 8] | dfr to-df | dfr is-unique


let df_a = ([[a b c];[1 "a" 0] [2 "b" 1] [1 "c" 2] [1 "c" 3]] | dfr to-lazy);
    let df_b = ([["foo" "bar" "ham"];[1 "a" "let"] [1 "c" "var"] [1 "c" "const"]] | dfr to-lazy);
    $df_a | dfr join $df_b a foo | dfr collect


[[a b]; [1 2] [3 4]] | dfr to-df | dfr last 1





dfr lit 2 | dfr to-nu


let test = ([[a b];[1 2] [3 4]] | dfr to-df);
    dfr ls











[[a b c d]; [x 1 4 a] [y 2 5 b] [z 3 6 c]] | dfr to-df | dfr melt -c [b c] -v [a d]





[true false true] | dfr to-df | dfr not


dfr open test.csv





[5 6 7 8] | dfr to-df | dfr rename new_name


[[a b]; [1 2] [3 4]] | dfr to-df | dfr rename-col a a_new


[abc abc abc] | dfr to-df | dfr replace -p ab -r AB


[abac abac abac] | dfr to-df | dfr replace-all -p a -r A





[1 2 3 4 5] | dfr to-df | dfr rolling sum 2 | dfr drop-nulls


[[a b]; [1 2] [3 4]] | dfr to-df | dfr sample -n 1





let s = ([1 2 2 3 3] | dfr to-df | dfr shift 2);
    let mask = ($s | dfr is-null);
    $s | dfr set 0 --mask $mask


let series = ([4 1 5 2 4 3] | dfr to-df);
    let indices = ([0 2] | dfr to-df);
    $series | dfr set-with-idx 6 -i $indices


[[a b]; [1 2] [3 4]] | dfr to-df | dfr shape


[1 2 2 3 3] | dfr to-df | dfr shift 2 | dfr drop-nulls


[[a b]; [1 2] [3 4]] | dfr to-df | dfr slice 0 1


[[a b]; [3 4] [1 2]] | dfr to-df | dfr sort a








[a ab abc] | dfr to-df | dfr str-lengths


[abcded abc321 abc123] | dfr to-df | dfr str-slice 1 -l 2


let dt = ('2020-08-04T16:39:18+00:00' | into datetime -z 'UTC');
    let df = ([$dt $dt] | dfr to-df);
    $df | dfr strftime "%Y/%m/%d"





let df = ([[a b]; [4 1] [5 2] [4 3]] | dfr to-df);
    let indices = ([0 2] | dfr to-df);
    $df | dfr take $indices


[[a b]; [1 2] [3 4]] | dfr to-df | dfr to-csv test.csv


[[a b];[1 2] [3 4]] | dfr to-df


[[a b]; [1 2] [3 4]] | dfr to-df | dfr to-dummies


[[a b];[1 2] [3 4]] | dfr to-df | dfl to-lazy


[Abc aBc abC] | dfr to-df | dfr to-lowercase


dfr col col_a | dfr to-nu


[[a b]; [1 2] [3 4]] | dfr to-df | dfr to-parquet test.parquet


[Abc aBc abC] | dfr to-df | dfr to-uppercase


[2 2 2 2 2] | dfr to-df | dfr unique


[5 5 5 5 6 6] | dfr to-df | dfr value-counts





[[a b]; [1 2] [3 4]]
   | dfr to-df
   | dfr to-lazy
   | dfr with-column (
       dfr when ((dfr col a) > 2) --then 4 --otherwise 5  | dfr as "c"
     )
   | dfr collect


[[a b]; [1 2] [3 4]] 
    | dfr to-df 
    | dfr with-column ([5 6] | dfr to-df) --name c


do { echo hello }


[0,1,2,3] | drop


echo [[lib, extension]; [nu-lib, rs] [nu-core, rb]] | drop column


[sam,sarah,2,3,4,5] | drop nth 0 1 2


du


[1 2 3] | each { |it| 2 * $it }


echo 'hello'


'' | empty?


enter ../dir-foo


env | where name == PATH


def foo [x] {
      let span = (metadata $x).span;
      error make {msg: "this is fishy", label: {text: "fish right here", start: $span.start, end: $span.end } }
    }


[1 2 3 4 5] | every 2


exec ps aux


exit


module utils { export def my-command [] { "hello" } }; use utils my-command; my-command


export alias ll = ls -l


module spam { export def foo [] { "foo" } }; use spam foo; foo


module foo { export def-env bar [] { let-env FOO_BAR = "BAZ" } }; use foo bar; bar; $env.FOO_BAR


module foo { export env FOO_ENV { "BAZ" } }; use foo FOO_ENV; $env.FOO_ENV


export extern echo [text: string]


extern echo [text: string]


fetch url.com


ls | find toml md sh


[1 2 3] | first


[[N, u, s, h, e, l, l]] | flatten 


42 | fmt


for x in [1 2 3] { $x * $x }


ls | format '{name}: {size}'


ls | format filesize size KB


open data.txt | from csv


'From: test@email.com
Subject: Welcome
To: someone@somewhere.com

Test' | from eml


'BEGIN:VCALENDAR
END:VCALENDAR' | from ics


'[foo]
a=1
b=2' | from ini


'{ "a": 1 }' | from json


'{ a:1 }' | from nuon


open test.txt | from ods


'FOO   BAR
1   2' | from ssv


'a = 1' | from toml


echo $'c1(char tab)c2(char tab)c3(char nl)1(char tab)2(char tab)3' | save tsv-data | open tsv-data | from tsv


'bread=baguette&cheese=comt%C3%A9&meat=ham&fat=butter' | from url


'BEGIN:VCARD
N:Foo
FN:Bar
EMAIL:foo@bar.com
END:VCARD' | from vcf


open test.txt | from xlsx


'<?xml version="1.0" encoding="UTF-8"?>
<note>
  <remember>Event</remember>
</note>' | from xml


'a: 1' | from yaml


'a: 1' | from yaml


mkdir foo bar; enter foo; enter ../bar; g 1


ls | get name


glob *.rs


[1 2 3 a b c] | grid


echo [1 2 3 4] | group 2


ls | group-by type


echo 'username:password' | hash base64


echo 'abcdefghijklmnopqrstuvwxyz' | hash md5


echo 'abcdefghijklmnopqrstuvwxyz' | hash sha256


"a b c|1 2 3" | split row "|" | split column " " | headers


help commands


alias lll = ls -l; hide lll


ls | histogram type


history | length


if 2 < 3 { 'yes!' }


echo done | ignore


let user-input = (input)


echo {'name': 'nu', 'stars': 5} | insert alias 'Nushell'


'This is a string that is exactly 52 characters long.' | into binary


echo [[value]; ['false'] ['1'] [0] [1.0] [true]] | into bool value


'27.02.2021 1:55 pm +0000' | into datetime


[[num]; ['5.01']] | into decimal num


echo [[value]; ['1sec'] ['2min'] ['3hr'] ['4day'] ['5wk']] | into duration value


[[bytes]; ['5'] [3.2] [4] [2kb]] | into filesize bytes


echo [[num]; ['-5'] [4] [1.5]] | into int num


1.7 | into string -d 0


keybindings default


keybindings list -m


keybindings listen


ps | sort-by mem | last | kill $in.pid


[1,2,3] | last 2


echo [1 2 3 4 5] | length


let x = 10


let-env MY_ENV_VAR = 1; $env.MY_ENV_VAR


echo $'two(char nl)lines' | lines


{NAME: ABE, AGE: UNKNOWN} | load-env; echo $env.NAME


ls


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


[9 16] | math sqrt


[1 2 3 4 5] | math stddev


[1 2 3] | math sum


echo [1 2 3 4 5] | math variance


[a b c] | wrap name | merge { [1 2 3] | wrap index }


metadata $a


mkdir foo


module spam { export def foo [] { "foo" } }; use spam foo; foo


[[name value index]; [foo a 1] [bar b 2] [baz c 3]] | move index --before name


mv before.txt after.txt


mkdir foo bar; enter foo; enter ../bar; n


'let x = 3' | nu-highlight


open myfile.json


module spam { export def foo [] { "foo" } }
    overlay add spam


module spam { export def foo [] { "foo" } }
    overlay add spam
    overlay list | last


module spam { export def foo [] { "foo" } }
    overlay add spam
    overlay remove spam


mkdir foo bar; enter foo; enter ../bar; p


[1 2 3] | par-each { |it| 2 * $it }


echo "hi there" | parse "{foo} {bar}"


'/home/joe/test.txt' | path basename


'/home/joe/code/test.txt' | path dirname


'/home/joe/todo.txt' | path exists


'/home/joe/foo/../bar' | path expand


'/home/viking' | path join spam.txt


'/home/viking/spam.txt' | path parse


'/home/viking' | path relative-to '/home'


'/home/viking/spam.txt' | path split


'.' | path type


post url.com 'body'


[1,2,3,4] | prepend 0


print "hello world"


ps


random bool


random chars


random decimal


random dice


random integer


random uuid


[0,1,2,3,4,5] | range 4..5


[ 1 2 3 4 ] | reduce {|it, acc| $it + $acc }


register -e json ~/.cargo/bin/nu_plugin_query


ls | reject modified


[[a, b]; [1, 2]] | rename my_column


[0,1,2,3] | reverse


rm file.txt


[[a b]; [1 2] [3 4] [5 6]] | roll down


[[a b c]; [1 2 3] [4 5 6]] | roll left


[[a b c]; [1 2 3] [4 5 6]] | roll right


[[a b]; [1 2] [3 4] [5 6]] | roll up


[[a b]; [1 2]] | rotate


run-external "echo" "-n" "hello"


echo 'save me' | save foo.txt


ls | select name


seq 1 10


seq char a e


seq date --days 10


enter ..; shells


echo [[version patch]; [1.0.0 false] [3.0.1 true] [2.0.0 false]] | shuffle


"There are seven words in this sentence" | size


echo [[editions]; [2015] [2018] [2021]] | skip 2


echo [-2 0 2 -1] | skip until $it > 0


echo [-2 0 2 -1] | skip while $it < 0


sleep 1sec


[2 0 1] | sort


[2 0 1] | sort-by


source foo.nu


'hello' | split chars


echo 'a--b--c' | split column '--'


echo 'abc' | split row ''



                {
                    '2019': [
                      { name: 'andres', lang: 'rb', year: '2019' },
                      { name: 'jt', lang: 'rs', year: '2019' }
                    ],
                    '2021': [
                      { name: 'storm', lang: 'rs', 'year': '2021' }
                    ]
                } | split-by lang
                


 'NuShell' | str camel-case


'good day' | str capitalize


['nu', 'shell'] | str collect


'my_library.rb' | str contains '.rb'


'NU' | str downcase


'my_library.rb' | str ends-with '.rb'


 'my_library.rb' | str index-of '.rb'


'NuShell' | str kebab-case


'hello' | str length


'nushell' | str lpad -l 10 -c '*'


'nu-shell' | str pascal-case


'my_library.rb' | str replace '(.+).rb' '$1.nu'


'Nushell' | str reverse


'nushell' | str rpad -l 10 -c '*'


 "NuShell" | str screaming-snake-case


 "NuShell" | str snake-case


'my_library.rb' | str starts-with 'my'


 'good nushell' | str substring [5 12]


'nu-shell' | str title-case


'Nu shell ' | str trim


'nu' | str upcase


sys


ls | table -n 1


echo [[editions]; [2015] [2018] [2021]] | take 2


echo [-1 -2 9 1] | take until $it > 0


echo [-1 -2 9 1] | take while $it < 0


term size


[[foo bar]; [1 2]] | to csv


[[foo bar]; [1 2]] | to html


[a b c] | to json


[[foo bar]; [1 2]] | to md


[1 2 3] | to nuon


1 | to text


[[foo bar]; ["1" "2"]] | to toml


[[foo bar]; [1 2]] | to tsv


[[foo bar]; ["1" "2"]] | to url


{ "note": { "children": [{ "remember": {"attributes" : {}, "children": [Event]}}], "attributes": {} } } | to xml


[[foo bar]; ["1" "2"]] | to yaml


touch fixture.json


echo [[c1 c2]; [1 2]] | transpose


tutor begin


[2 3 3 4] | uniq


echo {'name': 'nu', 'stars': 5} | update name 'Nushell'


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


echo {'name': 'nu', 'stars': 5} | upsert name 'Nushell'


echo 'http://www.example.com/foo/bar' | url host


echo 'http://www.example.com/foo/bar' | url path


echo 'http://www.example.com/?foo=bar&baz=quux' | url query


echo 'http://www.example.com' | url scheme


module spam { export def foo [] { "foo" } }; use spam foo; foo


version


let abc = { echo 'hi' }; view-source $abc


watch . --glob=**/*.rs { cargo test }


ls | where size > 2kb


which myapp


echo [1 2 3 4] | window 2


with-env [MYENV "my env value"] { $env.MYENV }


echo [1 2 3] | wrap num


1..3 | zip 4..6


