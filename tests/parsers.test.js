import { describe, test, expect } from 'vitest';
import { createRequire } from 'module';

// Import parser functions from cli.cjs (CommonJS)
const require = createRequire(import.meta.url);
const { parseDiff, parseCsv } = require('../cli.cjs');

describe('parseDiff', () => {
  test('should parse simple unified diff', () => {
    const diff = `diff --git a/file.txt b/file.txt
index 1234567..abcdefg 100644
--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,4 @@
 line1
-old line
+new line
+added line
 line3`;

    const result = parseDiff(diff);

    expect(result).toHaveLength(1);
    expect(result[0].oldPath).toBe('file.txt');
    expect(result[0].newPath).toBe('file.txt');
    expect(result[0].isNew).toBe(false);
    expect(result[0].isDeleted).toBe(false);
    expect(result[0].isBinary).toBe(false);
    expect(result[0].hunks).toHaveLength(1);
    expect(result[0].hunks[0].oldStart).toBe(1);
    expect(result[0].hunks[0].newStart).toBe(1);
    expect(result[0].hunks[0].lines).toHaveLength(5);
  });

  test('should handle file additions (new file)', () => {
    const diff = `diff --git a/newfile.txt b/newfile.txt
new file mode 100644
index 0000000..abcdefg
--- /dev/null
+++ b/newfile.txt
@@ -0,0 +1,3 @@
+line1
+line2
+line3`;

    const result = parseDiff(diff);

    expect(result).toHaveLength(1);
    expect(result[0].newPath).toBe('newfile.txt');
    expect(result[0].isNew).toBe(true);
    expect(result[0].isDeleted).toBe(false);
    expect(result[0].hunks).toHaveLength(1);
    expect(result[0].hunks[0].lines).toHaveLength(3);
    expect(result[0].hunks[0].lines[0].type).toBe('add');
  });

  test('should handle file deletions', () => {
    const diff = `diff --git a/deleted.txt b/deleted.txt
deleted file mode 100644
index abcdefg..0000000
--- a/deleted.txt
+++ /dev/null
@@ -1,2 +0,0 @@
-line1
-line2`;

    const result = parseDiff(diff);

    expect(result).toHaveLength(1);
    expect(result[0].oldPath).toBe('deleted.txt');
    expect(result[0].isNew).toBe(false);
    expect(result[0].isDeleted).toBe(true);
    expect(result[0].hunks).toHaveLength(1);
    expect(result[0].hunks[0].lines).toHaveLength(2);
    expect(result[0].hunks[0].lines[0].type).toBe('del');
  });

  test('should parse hunk headers correctly', () => {
    const diff = `diff --git a/file.js b/file.js
index 1234567..abcdefg 100644
--- a/file.js
+++ b/file.js
@@ -10,5 +10,6 @@ function example() {
 context line
-removed
+added
 context`;

    const result = parseDiff(diff);

    expect(result[0].hunks[0].oldStart).toBe(10);
    expect(result[0].hunks[0].newStart).toBe(10);
    expect(result[0].hunks[0].context).toBe(' function example() {');
  });

  test('should handle binary files', () => {
    const diff = `diff --git a/image.png b/image.png
new file mode 100644
index 0000000..abcdefg
Binary files /dev/null and b/image.png differ`;

    const result = parseDiff(diff);

    expect(result).toHaveLength(1);
    expect(result[0].newPath).toBe('image.png');
    expect(result[0].isBinary).toBe(true);
    expect(result[0].hunks).toHaveLength(0);
  });

  test('should handle multiple files in diff', () => {
    const diff = `diff --git a/file1.txt b/file1.txt
index 1234567..abcdefg 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1,2 +1,2 @@
 line1
-old
+new
diff --git a/file2.txt b/file2.txt
index 2345678..bcdefgh 100644
--- a/file2.txt
+++ b/file2.txt
@@ -1,1 +1,2 @@
 content
+added`;

    const result = parseDiff(diff);

    expect(result).toHaveLength(2);
    expect(result[0].newPath).toBe('file1.txt');
    expect(result[1].newPath).toBe('file2.txt');
    expect(result[0].hunks).toHaveLength(1);
    expect(result[1].hunks).toHaveLength(1);
  });

  test('should handle diff with Japanese characters', () => {
    const diff = `diff --git a/japanese.txt b/japanese.txt
index 1234567..abcdefg 100644
--- a/japanese.txt
+++ b/japanese.txt
@@ -1,2 +1,2 @@
 \u3053\u3093\u306b\u3061\u306f
-\u53e4\u3044\u30c6\u30ad\u30b9\u30c8
+\u65b0\u3057\u3044\u30c6\u30ad\u30b9\u30c8`;

    const result = parseDiff(diff);

    expect(result).toHaveLength(1);
    expect(result[0].hunks[0].lines).toHaveLength(3);
    expect(result[0].hunks[0].lines[1].content).toBe('\u53e4\u3044\u30c6\u30ad\u30b9\u30c8');
    expect(result[0].hunks[0].lines[2].content).toBe('\u65b0\u3057\u3044\u30c6\u30ad\u30b9\u30c8');
  });

  test('should handle empty diff', () => {
    const result = parseDiff('');
    expect(result).toHaveLength(0);
  });

  test('should handle diff with multiple hunks', () => {
    const diff = `diff --git a/file.txt b/file.txt
index 1234567..abcdefg 100644
--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 line1
-old1
+new1
 line3
@@ -10,3 +10,3 @@
 line10
-old2
+new2
 line12`;

    const result = parseDiff(diff);

    expect(result).toHaveLength(1);
    expect(result[0].hunks).toHaveLength(2);
    expect(result[0].hunks[0].oldStart).toBe(1);
    expect(result[0].hunks[1].oldStart).toBe(10);
  });

  test('should correctly identify line types', () => {
    const diff = `diff --git a/file.txt b/file.txt
index 1234567..abcdefg 100644
--- a/file.txt
+++ b/file.txt
@@ -1,4 +1,4 @@
 context line
-deleted line
+added line
 another context`;

    const result = parseDiff(diff);
    const lines = result[0].hunks[0].lines;

    expect(lines[0].type).toBe('ctx');
    expect(lines[1].type).toBe('del');
    expect(lines[2].type).toBe('add');
    expect(lines[3].type).toBe('ctx');
  });

  test('should handle file paths with spaces', () => {
    const diff = `diff --git a/path with spaces/file.txt b/path with spaces/file.txt
index 1234567..abcdefg 100644
--- a/path with spaces/file.txt
+++ b/path with spaces/file.txt
@@ -1,1 +1,1 @@
-old
+new`;

    const result = parseDiff(diff);

    expect(result[0].oldPath).toBe('path with spaces/file.txt');
    expect(result[0].newPath).toBe('path with spaces/file.txt');
  });
});

describe('parseCsv', () => {
  test('should parse simple CSV', () => {
    const csv = `a,b,c
1,2,3
4,5,6`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['a', 'b', 'c']);
    expect(result[1]).toEqual(['1', '2', '3']);
    expect(result[2]).toEqual(['4', '5', '6']);
  });

  test('should handle quoted fields', () => {
    const csv = `name,description
"John Doe","A simple description"
"Jane","Another one"`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(3);
    expect(result[1][0]).toBe('John Doe');
    expect(result[1][1]).toBe('A simple description');
  });

  test('should handle escaped quotes (RFC4180)', () => {
    const csv = `text
"He said ""Hello"""
"Normal text"`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(3);
    expect(result[1][0]).toBe('He said "Hello"');
    expect(result[2][0]).toBe('Normal text');
  });

  test('should detect and parse TSV format', () => {
    const tsv = `a\tb\tc
1\t2\t3
4\t5\t6`;

    const result = parseCsv(tsv, '\t');

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['a', 'b', 'c']);
    expect(result[1]).toEqual(['1', '2', '3']);
  });

  test('should handle empty fields', () => {
    const csv = `a,,c
,b,
1,2,3`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['a', '', 'c']);
    expect(result[1]).toEqual(['', 'b', '']);
  });

  test('should handle newlines in quoted fields', () => {
    const csv = `name,address
"John","123 Main St
Apt 4"
"Jane","456 Oak Ave"`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(3);
    expect(result[1][1]).toBe('123 Main St\nApt 4');
    expect(result[2][1]).toBe('456 Oak Ave');
  });

  test('should handle CRLF line endings', () => {
    const csv = `a,b,c\r\n1,2,3\r\n4,5,6`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['a', 'b', 'c']);
    expect(result[1]).toEqual(['1', '2', '3']);
    expect(result[2]).toEqual(['4', '5', '6']);
  });

  test('should handle empty CSV', () => {
    const result = parseCsv('');
    expect(result).toHaveLength(0);
  });

  test('should handle single field', () => {
    const csv = `single`;
    const result = parseCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(['single']);
  });

  test('should handle single row with multiple fields', () => {
    const csv = `a,b,c,d`;
    const result = parseCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(['a', 'b', 'c', 'd']);
  });

  test('should handle field with comma inside quotes', () => {
    const csv = `name,value
"Smith, John",100
"Doe, Jane",200`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(3);
    expect(result[1][0]).toBe('Smith, John');
    expect(result[2][0]).toBe('Doe, Jane');
  });

  test('should handle mixed quoted and unquoted fields', () => {
    const csv = `a,"b",c
"1",2,"3"
4,"5",6`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['a', 'b', 'c']);
    expect(result[1]).toEqual(['1', '2', '3']);
    expect(result[2]).toEqual(['4', '5', '6']);
  });

  test('should handle Japanese characters', () => {
    const csv = `\u540d\u524d,\u4fa1\u683c
\u308a\u3093\u3054,100
\u307f\u304b\u3093,150`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(['\u540d\u524d', '\u4fa1\u683c']);
    expect(result[1]).toEqual(['\u308a\u3093\u3054', '100']);
    expect(result[2]).toEqual(['\u307f\u304b\u3093', '150']);
  });

  test('should handle trailing newline', () => {
    const csv = `a,b,c
1,2,3
`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(['a', 'b', 'c']);
    expect(result[1]).toEqual(['1', '2', '3']);
  });

  test('should handle complex quoted field with multiple escaped quotes', () => {
    const csv = `text
"He said ""Hello"" and then ""Goodbye"""`;

    const result = parseCsv(csv);

    expect(result).toHaveLength(2);
    expect(result[1][0]).toBe('He said "Hello" and then "Goodbye"');
  });

  test('should handle tab separator with quoted fields', () => {
    const tsv = `name\tdescription
"John Doe"\t"A\ttab\tin\ttext"
Simple\tValue`;

    const result = parseCsv(tsv, '\t');

    expect(result).toHaveLength(3);
    expect(result[1][0]).toBe('John Doe');
    expect(result[1][1]).toBe('A\ttab\tin\ttext');
    expect(result[2]).toEqual(['Simple', 'Value']);
  });
});
