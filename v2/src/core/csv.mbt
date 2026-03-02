///| Parse error types
pub suberror ParseError {
  UnexpectedEof
  InvalidQuote(Int)
  EmptyInput
}

///| Parse CSV/TSV content (RFC4180 compliant)
pub fn parse_csv(input : String, delimiter : Char) -> CsvData raise ParseError {
  if input.is_empty() {
    raise ParseError::EmptyInput
  }
  let rows : Array[Array[String]] = []
  let current_field = StringBuilder::new()
  let current_row : Array[String] = []
  let chars = input.to_array()
  let len = chars.length()
  let mut i = 0
  let mut in_quotes = false
  while i < len {
    let ch = chars[i]
    if in_quotes {
      if ch == '"' {
        if i + 1 < len && chars[i + 1] == '"' {
          // Escaped quote
          current_field.write_char('"')
          i = i + 2
        } else {
          // End of quoted field
          in_quotes = false
          i = i + 1
        }
      } else {
        current_field.write_char(ch)
        i = i + 1
      }
    } else if ch == '"' {
      in_quotes = true
      i = i + 1
    } else if ch == delimiter {
      current_row.push(current_field.to_string())
      current_field.reset()
      i = i + 1
    } else if ch == '\r' {
      // Handle CRLF
      current_row.push(current_field.to_string())
      current_field.reset()
      let row_copy = current_row.copy()
      rows.push(row_copy)
      current_row.clear()
      if i + 1 < len && chars[i + 1] == '\n' {
        i = i + 2
      } else {
        i = i + 1
      }
    } else if ch == '\n' {
      current_row.push(current_field.to_string())
      current_field.reset()
      let row_copy = current_row.copy()
      rows.push(row_copy)
      current_row.clear()
      i = i + 1
    } else {
      current_field.write_char(ch)
      i = i + 1
    }
  }
  // Handle last field
  if current_field.to_string().length() > 0 || current_row.length() > 0 {
    current_row.push(current_field.to_string())
    rows.push(current_row.copy())
  }
  if rows.is_empty() {
    raise ParseError::EmptyInput
  }
  let headers = rows[0]
  let data_rows : Array[Array[String]] = []
  for i in 1..<rows.length() {
    data_rows.push(rows[i])
  }
  { headers, rows: data_rows }
}
