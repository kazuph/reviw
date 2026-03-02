test "parse markdown headings" {
  let md = parse_markdown("# Hello\n\nSome text\n\n## World")
  inspect(md.source.length() > 0, content=(
    #|true
  ))
  inspect(md.html.contains("<h1>"), content=(
    #|true
  ))
  inspect(md.html.contains("<h2>"), content=(
    #|true
  ))
}

test "parse markdown paragraphs" {
  let md = parse_markdown("Hello world\n\nSecond paragraph")
  inspect(md.html.contains("<p>Hello world</p>"), content=(
    #|true
  ))
  inspect(md.html.contains("<p>Second paragraph</p>"), content=(
    #|true
  ))
}

test "parse markdown bold and italic" {
  let md = parse_markdown("**bold** and *italic*")
  inspect(md.html.contains("<strong>bold</strong>"), content=(
    #|true
  ))
  inspect(md.html.contains("<em>italic</em>"), content=(
    #|true
  ))
}

test "parse markdown code block" {
  let md = parse_markdown("```js\nconst x = 1;\n```")
  inspect(md.html.contains("<pre><code>"), content=(
    #|true
  ))
  inspect(md.html.contains("const x = 1;"), content=(
    #|true
  ))
}

test "parse markdown inline code" {
  let md = parse_markdown("use `hello()` function")
  inspect(md.html.contains("<code>hello()</code>"), content=(
    #|true
  ))
}

test "parse markdown unordered list" {
  let md = parse_markdown("- item 1\n- item 2\n- item 3")
  inspect(md.html.contains("<ul>"), content=(
    #|true
  ))
  inspect(md.html.contains("<li>item 1</li>"), content=(
    #|true
  ))
}

test "parse markdown ordered list" {
  let md = parse_markdown("1. first\n2. second")
  inspect(md.html.contains("<ol>"), content=(
    #|true
  ))
  inspect(md.html.contains("<li>first</li>"), content=(
    #|true
  ))
}

test "parse markdown links" {
  let md = parse_markdown("[click here](https://example.com)")
  inspect(md.html.contains("<a href=\"https://example.com\">click here</a>"), content=(
    #|true
  ))
}

test "parse markdown images" {
  let md = parse_markdown("![alt text](image.png)")
  inspect(md.html.contains("<img"), content=(
    #|true
  ))
  inspect(md.html.contains("src=\"image.png\""), content=(
    #|true
  ))
}

test "parse markdown blockquote" {
  let md = parse_markdown("> quoted text")
  inspect(md.html.contains("<blockquote>"), content=(
    #|true
  ))
}

test "parse markdown horizontal rule" {
  let md = parse_markdown("above\n\n---\n\nbelow")
  inspect(md.html.contains("<hr"), content=(
    #|true
  ))
}

test "parse markdown table" {
  let md = parse_markdown("| a | b |\n|---|---|\n| 1 | 2 |")
  inspect(md.html.contains("<table>"), content=(
    #|true
  ))
  inspect(md.html.contains("<th>"), content=(
    #|true
  ))
  inspect(md.html.contains("<td>"), content=(
    #|true
  ))
}

test "parse markdown frontmatter" {
  let md = parse_markdown("---\ntitle: Hello\nauthor: Alice\n---\n\n# Content")
  inspect(md.frontmatter.get("title"), content=(
    #|Some("Hello")
  ))
  inspect(md.frontmatter.get("author"), content=(
    #|Some("Alice")
  ))
  inspect(md.html.contains("<h1>"), content=(
    #|true
  ))
  // frontmatter should not appear in html
  inspect(md.html.contains("title:"), content=(
    #|false
  ))
}

test "parse markdown empty" {
  let md = parse_markdown("")
  inspect(md.html, content="")
  inspect(md.source, content="")
}
