///| Parse unified diff format
pub fn parse_diff(input : String) -> DiffData {
  let files : Array[DiffFile] = []
  let lines = split_to_lines(input)
  let len = lines.length()
  let mut i = 0
  while i < len {
    let line = lines[i]
    if line.has_prefix("diff ") || line.has_prefix("--- ") {
      let mut old_path = ""
      let mut new_path = ""
      if line.has_prefix("--- ") {
        old_path = strip_diff_prefix(safe_slice(line, 4))
        i = i + 1
      } else {
        i = i + 1
        while i < len {
          let l = lines[i]
          if l.has_prefix("--- ") {
            old_path = strip_diff_prefix(safe_slice(l, 4))
            i = i + 1
            break
          }
          i = i + 1
        }
      }
      if i < len {
        let plus_line = lines[i]
        if plus_line.has_prefix("+++ ") {
          new_path = strip_diff_prefix(safe_slice(plus_line, 4))
          i = i + 1
        }
      }
      let hunks : Array[DiffHunk] = []
      while i < len {
        let hunk_line = lines[i]
        if hunk_line.has_prefix("@@ ") {
          let hunk = parse_hunk_header(hunk_line)
          let hunk_lines : Array[DiffLine] = []
          i = i + 1
          while i < len {
            let l = lines[i]
            if l.has_prefix("@@ ") || l.has_prefix("diff ") || l.has_prefix("--- ") {
              break
            }
            if l.has_prefix("+") {
              hunk_lines.push({ kind: Addition, content: safe_slice(l, 1) })
            } else if l.has_prefix("-") {
              hunk_lines.push({ kind: Deletion, content: safe_slice(l, 1) })
            } else if l.has_prefix(" ") {
              hunk_lines.push({ kind: Context, content: safe_slice(l, 1) })
            } else {
              hunk_lines.push({ kind: Context, content: l })
            }
            i = i + 1
          }
          hunks.push(
            {
              old_start: hunk.0,
              old_count: hunk.1,
              new_start: hunk.2,
              new_count: hunk.3,
              lines: hunk_lines,
            },
          )
        } else if hunk_line.has_prefix("diff ") || hunk_line.has_prefix("--- ") {
          break
        } else {
          i = i + 1
        }
      }
      files.push({ old_path, new_path, hunks })
    } else {
      i = i + 1
    }
  }
  DiffData::{ files }
}

///|
fn strip_diff_prefix(path : String) -> String {
  if path.has_prefix("a/") || path.has_prefix("b/") {
    safe_slice(path, 2)
  } else {
    path
  }
}

///|
fn parse_hunk_header(line : String) -> (Int, Int, Int, Int) {
  let mut old_start = 0
  let mut old_count = 0
  let mut new_start = 0
  let mut new_count = 0
  let chars = line.to_array()
  let len = chars.length()
  let mut i = 3
  if i < len && chars[i] == '-' {
    i = i + 1
    let result = parse_int_from(chars, i, len)
    old_start = result.0
    i = result.1
    if i < len && chars[i] == ',' {
      i = i + 1
      let result2 = parse_int_from(chars, i, len)
      old_count = result2.0
      i = result2.1
    } else {
      old_count = 1
    }
  }
  if i < len && chars[i] == ' ' {
    i = i + 1
  }
  if i < len && chars[i] == '+' {
    i = i + 1
    let result = parse_int_from(chars, i, len)
    new_start = result.0
    i = result.1
    if i < len && chars[i] == ',' {
      i = i + 1
      let result2 = parse_int_from(chars, i, len)
      new_count = result2.0
      ignore(result2.1)
    } else {
      new_count = 1
    }
  }
  (old_start, old_count, new_start, new_count)
}

///|
fn parse_int_from(chars : Array[Char], start : Int, len : Int) -> (Int, Int) {
  let mut n = 0
  let mut i = start
  while i < len && chars[i] >= '0' && chars[i] <= '9' {
    n = n * 10 + (chars[i].to_int() - '0'.to_int())
    i = i + 1
  }
  (n, i)
}
