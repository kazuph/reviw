test "safe_slice normal" {
  inspect(safe_slice("hello", 2), content=(
    #|llo
  ))
}

test "safe_slice from start" {
  inspect(safe_slice("hello", 0), content=(
    #|hello
  ))
}

test "safe_slice out of range" {
  inspect(safe_slice("hi", 10), content="")
}

test "safe_slice negative" {
  inspect(safe_slice("hi", -1), content="")
}

test "safe_slice_range" {
  inspect(safe_slice_range("hello world", 6, 11), content=(
    #|world
  ))
}

test "parse_int_safe normal" {
  inspect(parse_int_safe("42"), content=(
    #|42
  ))
}

test "parse_int_safe empty" {
  inspect(parse_int_safe(""), content=(
    #|0
  ))
}

test "parse_int_safe non-numeric" {
  inspect(parse_int_safe("abc"), content=(
    #|0
  ))
}

test "split_to_lines" {
  let lines = split_to_lines("a\nb\nc")
  inspect(lines.length(), content=(
    #|3
  ))
  inspect(lines[0], content=(
    #|a
  ))
  inspect(lines[2], content=(
    #|c
  ))
}
