test "review to yaml single file" {
  let result : ReviewResult = {
    file: "data.csv",
    mode: Csv,
    comments: [
      { row: 1, col: 2, text: "needs review", value: "150" },
    ],
    summary: "looks good",
    answers: "",
    mermaid_errors: [],
    decision: None,
    action: FinalApprove,
  }
  inspect(review_to_yaml(result), content=(
    #|action: final_approve
    #|file: data.csv
    #|mode: csv
    #|comments:
    #|  - row: 1
    #|    col: 2
    #|    text: needs review
    #|    value: 150
    #|summary: looks good
    #|
  ))
}

test "review to yaml escapes special chars" {
  let result : ReviewResult = {
    file: "test.csv",
    mode: Csv,
    comments: [
      { row: 0, col: 0, text: "has: colon and #hash", value: "" },
    ],
    summary: "it's fine",
    answers: "",
    mermaid_errors: [],
    decision: None,
    action: FinalApprove,
  }
  inspect(review_to_yaml(result), content=(
    #|action: final_approve
    #|file: test.csv
    #|mode: csv
    #|comments:
    #|  - row: 0
    #|    col: 0
    #|    text: 'has: colon and #hash'
    #|summary: 'it''s fine'
    #|
  ))
}

test "reviews to yaml multiple files" {
  let results = [
    ReviewResult::{
      file: "a.csv",
      mode: Csv,
      comments: [],
      summary: "ok",
      answers: "",
      mermaid_errors: [],
      decision: None,
      action: FinalApprove,
    },
    {
      file: "b.md",
      mode: Markdown,
      comments: [],
      summary: "ok",
      answers: "",
      mermaid_errors: [],
      decision: None,
      action: FinalApprove,
    },
  ]
  inspect(reviews_to_yaml(results), content=(
    #|action: final_approve
    #|files:
    #|  - file: a.csv
    #|    mode: csv
    #|    comments:
    #|    summary: ok
    #|  - file: b.md
    #|    mode: markdown
    #|    comments:
    #|    summary: ok
    #|
  ))
}

test "yaml escape empty value omitted" {
  let result : ReviewResult = {
    file: "f.csv",
    mode: Csv,
    comments: [
      { row: 0, col: 0, text: "note", value: "" },
    ],
    summary: "done",
    answers: "",
    mermaid_errors: [],
    decision: None,
    action: FinalApprove,
  }
  let yaml = review_to_yaml(result)
  // value should not appear when empty
  inspect(yaml.contains("value:"), content=(
    #|false
  ))
}

test "review to yaml with mermaid errors" {
  let result : ReviewResult = {
    file: "test.md",
    mode: Markdown,
    comments: [],
    summary: "no comments",
    answers: "",
    mermaid_errors: [
      { line: 12, message: "Parse error on line 2" },
      { line: 25, message: "Expecting 'TXT', got 'NEWLINE'" },
    ],
    decision: None,
    action: FinalApprove,
  }
  inspect(review_to_yaml(result), content=(
    #|action: final_approve
    #|file: test.md
    #|mode: markdown
    #|comments:
    #|summary: no comments
    #|mermaid_errors:
    #|  - line: 12
    #|    error: Parse error on line 2
    #|  - line: 25
    #|    error: 'Expecting ''TXT'', got ''NEWLINE'''
    #|
  ))
}
