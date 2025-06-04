/**
 * ADF Parser Tests
 * Comprehensive test suite for ADF parsing and conversion utilities
 */

import { beforeEach, describe, expect, test } from "bun:test";
import {
  type ADFDocument,
  type ADFNode,
  ADFToMarkdownParser,
  ensureADFFormat,
  extractTextFromADF,
  parseADF,
  textToADF,
} from "@features/jira/shared/parsers/adf.parser";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("ADFToMarkdownParser", () => {
  let parser: ADFToMarkdownParser;

  beforeEach(() => {
    parser = new ADFToMarkdownParser();
  });

  describe("parse()", () => {
    test("should handle string input (backward compatibility)", () => {
      const result = parser.parse("Simple text");
      expect(result).toBe("Simple text");
    });

    test("should handle null and undefined input", () => {
      expect(parser.parse(null)).toBe("");
      expect(parser.parse(undefined)).toBe("");
    });

    test("should parse simple paragraph", () => {
      const adf: ADFNode = {
        type: "paragraph",
        content: [{ type: "text", text: "Hello world" }],
      };
      const result = parser.parse(adf);
      expect(result).toBe("Hello world\n\n");
    });

    test("should parse document with multiple paragraphs", () => {
      const adf: ADFNode = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "First paragraph" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Second paragraph" }],
          },
        ],
      };
      const result = parser.parse(adf);
      expect(result).toBe("First paragraph\n\nSecond paragraph\n\n");
    });

    test("should parse code blocks with language", () => {
      const adf: ADFNode = {
        type: "codeBlock",
        attrs: { language: "javascript" },
        content: [{ type: "text", text: "console.log('hello');" }],
      };
      const result = parser.parse(adf);
      expect(result).toBe("```javascript\nconsole.log('hello');\n```\n\n");
    });

    test("should parse bullet lists", () => {
      const adf: ADFNode = {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "First item" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Second item" }],
              },
            ],
          },
        ],
      };
      const result = parser.parse(adf);
      expect(result).toContain("- First item");
      expect(result).toContain("- Second item");
    });

    test("should parse ordered lists", () => {
      const adf: ADFNode = {
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "First item" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Second item" }],
              },
            ],
          },
        ],
      };
      const result = parser.parse(adf);
      expect(result).toContain("1. First item");
      expect(result).toContain("2. Second item");
    });

    test("should format text marks (bold, italic, code)", () => {
      const adf: ADFNode = {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "bold text",
            marks: [{ type: "strong" }],
          },
          { type: "text", text: " and " },
          {
            type: "text",
            text: "italic text",
            marks: [{ type: "em" }],
          },
          { type: "text", text: " and " },
          {
            type: "text",
            text: "code text",
            marks: [{ type: "code" }],
          },
        ],
      };
      const result = parser.parse(adf);
      expect(result).toContain("**bold text**");
      expect(result).toContain("*italic text*");
      expect(result).toContain("`code text`");
    });

    test("should parse headings with levels", () => {
      const adf: ADFNode = {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Heading Text" }],
      };
      const result = parser.parse(adf);
      expect(result).toBe("## Heading Text\n\n");
    });

    test("should handle complex nested ADF structure", () => {
      const adf: ADFNode = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Main Title" }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "This is " },
              {
                type: "text",
                text: "bold",
                marks: [{ type: "strong" }],
              },
              { type: "text", text: " text." },
            ],
          },
        ],
      };
      const result = parser.parse(adf);
      expect(result).toContain("# Main Title");
      expect(result).toContain("This is **bold** text.");
    });

    test("should handle unknown node types gracefully", () => {
      const adf: ADFNode = {
        type: "unknownType",
        content: [{ type: "text", text: "Some text" }],
      };
      const result = parser.parse(adf);
      expect(result).toBe("Some text");
    });
  });

  describe("extractPlainText()", () => {
    test("should extract plain text from complex ADF", () => {
      const adf: ADFNode = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Hello " },
              {
                type: "text",
                text: "world",
                marks: [{ type: "strong" }],
              },
            ],
          },
        ],
      };
      const result = parser.extractPlainText(adf);
      expect(result).toBe("Hello world");
    });

    test("should handle null and undefined input", () => {
      expect(parser.extractPlainText(null)).toBe("");
      expect(parser.extractPlainText(undefined)).toBe("");
    });

    test("should handle string input (backward compatibility)", () => {
      const result = parser.extractPlainText("Simple text");
      expect(result).toBe("Simple text");
    });
  });
});

describe("parseADF()", () => {
  test("should parse ADF document", () => {
    const adf: ADFNode = {
      type: "paragraph",
      content: [{ type: "text", text: "Test content" }],
    };
    const result = parseADF(adf);
    expect(result).toBe("Test content\n\n");
  });

  test("should handle null input", () => {
    const result = parseADF(null);
    expect(result).toBe("");
  });
});

describe("extractTextFromADF()", () => {
  test("should extract plain text from ADF", () => {
    const adf: ADFNode = {
      type: "paragraph",
      content: [{ type: "text", text: "Plain text content" }],
    };
    const result = extractTextFromADF(adf);
    expect(result).toBe("Plain text content");
  });

  test("should handle null input", () => {
    const result = extractTextFromADF(null);
    expect(result).toBe("");
  });
});

describe("textToADF()", () => {
  test("should convert simple text to ADF document", () => {
    const result = textToADF("Hello world");

    expect(result).toBeDefined();
    expect(result?.type).toBe("doc");
    expect(result?.version).toBe(1);
    expect(result?.content).toHaveLength(1);
    expect(result?.content[0].type).toBe("paragraph");
    expect(result?.content[0].content?.[0].type).toBe("text");
    expect(result?.content[0].content?.[0].text).toBe("Hello world");
  });

  test("should convert multi-paragraph text to ADF document", () => {
    const result = textToADF("First paragraph\n\nSecond paragraph");

    expect(result).toBeDefined();
    expect(result?.content).toHaveLength(2);
    expect(result?.content[0].content?.[0].text).toBe("First paragraph");
    expect(result?.content[1].content?.[0].text).toBe("Second paragraph");
  });

  test("should handle empty or null text", () => {
    expect(textToADF("")).toBeNull();
    expect(textToADF("   ")).toBeNull();
    expect(textToADF(null)).toBeNull();
    expect(textToADF(undefined)).toBeNull();
  });

  test("should handle text with only whitespace", () => {
    const result = textToADF("   \n\n   ");
    expect(result).toBeNull();
  });

  test("should handle single line text properly", () => {
    const result = textToADF("Single line");

    expect(result?.content).toHaveLength(1);
    expect(result?.content[0].type).toBe("paragraph");
    expect(result?.content[0].content?.[0].text).toBe("Single line");
  });

  test("should preserve line breaks within paragraphs", () => {
    const result = textToADF("Line 1\nLine 2\n\nParagraph 2");

    expect(result?.content).toHaveLength(2);
    expect(result?.content[0].content?.[0].text).toBe("Line 1\nLine 2");
    expect(result?.content[1].content?.[0].text).toBe("Paragraph 2");
  });
});

describe("ensureADFFormat()", () => {
  test("should return existing ADF document unchanged", () => {
    const adf: ADFDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Existing ADF" }],
        },
      ],
    };

    const result = ensureADFFormat(adf);
    expect(result).toBe(adf);
  });

  test("should wrap ADF node in document structure", () => {
    const node: ADFNode = {
      type: "paragraph",
      content: [{ type: "text", text: "Wrapped node" }],
    };

    const result = ensureADFFormat(node);
    expect(result?.type).toBe("doc");
    expect(result?.version).toBe(1);
    expect(result?.content).toHaveLength(1);
    expect(result?.content[0]).toBe(node);
  });

  test("should convert string to ADF document", () => {
    const result = ensureADFFormat("Test string");

    expect(result?.type).toBe("doc");
    expect(result?.version).toBe(1);
    expect(result?.content[0].type).toBe("paragraph");
    expect(result?.content[0].content?.[0].text).toBe("Test string");
  });

  test("should handle null and undefined input", () => {
    expect(ensureADFFormat(null)).toBeNull();
    expect(ensureADFFormat(undefined)).toBeNull();
  });

  test("should handle empty string", () => {
    expect(ensureADFFormat("")).toBeNull();
    expect(ensureADFFormat("   ")).toBeNull();
  });

  test("should handle complex text with multiple paragraphs", () => {
    const result = ensureADFFormat("Para 1\n\nPara 2\n\nPara 3");

    expect(result?.content).toHaveLength(3);
    expect(result?.content[0].content?.[0].text).toBe("Para 1");
    expect(result?.content[1].content?.[0].text).toBe("Para 2");
    expect(result?.content[2].content?.[0].text).toBe("Para 3");
  });

  test("should preserve existing ADF structure", () => {
    const complexADF: ADFDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Title" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Bold text", marks: [{ type: "strong" }] },
          ],
        },
      ],
    };

    const result = ensureADFFormat(complexADF);
    expect(result).toBe(complexADF);
    expect(result?.content).toHaveLength(2);
    expect(result?.content[0].type).toBe("heading");
    expect(result?.content[1].type).toBe("paragraph");
  });
});
