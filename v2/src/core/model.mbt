///| File format modes
pub(all) enum FileMode {
  Csv
  Tsv
  Markdown
  Diff
  Text
} derive(Show, Eq)

///|
pub fn FileMode::to_string(self : FileMode) -> String {
  match self {
    Csv => "csv"
    Tsv => "tsv"
    Markdown => "markdown"
    Diff => "diff"
    Text => "text"
  }
}

///|
pub fn FileMode::from_extension(ext : String) -> FileMode {
  match ext {
    "csv" => Csv
    "tsv" | "tab" => Tsv
    "md" | "markdown" => Markdown
    "diff" | "patch" => Diff
    _ => Text
  }
}

///| A single review comment
pub(all) struct Comment {
  row : Int
  col : Int
  text : String
  value : String
} derive(Show, Eq)

///| Review result for one file
pub(all) struct ReviewResult {
  file : String
  mode : FileMode
  comments : Array[Comment]
  summary : String
} derive(Show)

///| Parsed CSV data
pub(all) struct CsvData {
  headers : Array[String]
  rows : Array[Array[String]]
} derive(Show)

///| A single diff hunk
pub(all) struct DiffHunk {
  old_start : Int
  old_count : Int
  new_start : Int
  new_count : Int
  lines : Array[DiffLine]
} derive(Show)

///| A line in a diff
pub(all) struct DiffLine {
  kind : DiffLineKind
  content : String
} derive(Show, Eq)

///| Type of diff line
pub(all) enum DiffLineKind {
  Context
  Addition
  Deletion
} derive(Show, Eq)

///| A parsed diff file entry
pub(all) struct DiffFile {
  old_path : String
  new_path : String
  hunks : Array[DiffHunk]
} derive(Show)

///| Parsed diff data
pub(all) struct DiffData {
  files : Array[DiffFile]
} derive(Show)

///| Parsed markdown data
pub(all) struct MarkdownData {
  source : String
  html : String
  frontmatter : Map[String, String]
} derive(Show)
