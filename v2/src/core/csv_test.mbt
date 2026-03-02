test "parse simple csv" {
  let data = parse_csv("name,age,city\nAlice,30,Tokyo\nBob,25,Osaka", ',')
  inspect(data.headers, content=(
    #|["name", "age", "city"]
  ))
  inspect(data.rows.length(), content=(
    #|2
  ))
  inspect(data.rows[0], content=(
    #|["Alice", "30", "Tokyo"]
  ))
}

test "parse csv with quoted fields" {
  let data = parse_csv("name,desc\n\"Alice\",\"hello, world\"", ',')
  inspect(data.headers, content=(
    #|["name", "desc"]
  ))
  inspect(data.rows[0], content=(
    #|["Alice", "hello, world"]
  ))
}

test "parse csv with escaped quotes" {
  let data = parse_csv("val\n\"she said \"\"hi\"\"\"", ',')
  inspect(data.rows[0][0], content=(
    #|she said "hi"
  ))
}

test "parse csv with newline in quoted field" {
  let data = parse_csv("val\n\"line1\nline2\"", ',')
  inspect(data.rows[0][0], content=(
    #|line1
    #|line2
  ))
}

test "parse tsv" {
  let data = parse_csv("a\tb\n1\t2", '\t')
  inspect(data.headers, content=(
    #|["a", "b"]
  ))
  inspect(data.rows[0], content=(
    #|["1", "2"]
  ))
}

test "parse csv with crlf" {
  let data = parse_csv("a,b\r\n1,2\r\n3,4", ',')
  inspect(data.rows.length(), content=(
    #|2
  ))
  inspect(data.rows[0], content=(
    #|["1", "2"]
  ))
}

test "parse csv empty input raises" {
  let result : Result[CsvData, _] = try? parse_csv("", ',')
  inspect(result.is_err(), content=(
    #|true
  ))
}
