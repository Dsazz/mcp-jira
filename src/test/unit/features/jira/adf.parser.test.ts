/**
 * ADF Parser Unit Tests
 * Co-located unit tests for ADF to markdown conversion functionality
 */

import { beforeEach, describe, expect, test } from "bun:test";
import {
  type ADFNode,
  ADFToMarkdownParser,
  extractTextFromADF,
  parseADF,
} from "@features/jira/parsers/adf.parser";
import { mockFactory } from "@test/mocks/jira-mock-factory";
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
      const result = parser.parse("Simple string description");
      expect(result).toBe("Simple string description");
    });

    test("should handle null and undefined input", () => {
      expect(parser.parse(null)).toBe("");
      expect(parser.parse(undefined)).toBe("");
    });

    test("should parse simple paragraph", () => {
      const adf: ADFNode = {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This is a simple paragraph.",
          },
        ],
      };

      const result = parser.parse(adf);
      expect(result).toBe("This is a simple paragraph.\n\n");
    });

    test("should parse document with multiple paragraphs", () => {
      const adf: ADFNode = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "First paragraph." }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Second paragraph." }],
          },
        ],
      };

      const result = parser.parse(adf);
      expect(result).toBe("First paragraph.\n\nSecond paragraph.\n\n");
    });

    test("should parse code blocks with language", () => {
      const adf: ADFNode = {
        type: "codeBlock",
        attrs: { language: "javascript" },
        content: [
          {
            type: "text",
            text: 'const message = "Hello, World!";',
          },
        ],
      };

      const result = parser.parse(adf);
      expect(result).toBe(
        '```javascript\nconst message = "Hello, World!";\n```\n\n',
      );
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
      expect(result).toBe("- First item\n\n- Second item\n\n\n");
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
                content: [{ type: "text", text: "First step" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Second step" }],
              },
            ],
          },
        ],
      };

      const result = parser.parse(adf);
      expect(result).toBe("1. First step\n\n2. Second step\n\n\n");
    });

    test("should format text marks (bold, italic, code)", () => {
      const adf: ADFNode = {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Bold text",
            marks: [{ type: "strong" }],
          },
          {
            type: "text",
            text: " and ",
          },
          {
            type: "text",
            text: "italic text",
            marks: [{ type: "em" }],
          },
          {
            type: "text",
            text: " and ",
          },
          {
            type: "text",
            text: "code text",
            marks: [{ type: "code" }],
          },
        ],
      };

      const result = parser.parse(adf);
      expect(result).toBe(
        "**Bold text** and *italic text* and `code text`\n\n",
      );
    });

    test("should parse headings with levels", () => {
      const adf: ADFNode = {
        type: "heading",
        attrs: { level: 2 },
        content: [
          {
            type: "text",
            text: "Section Heading",
          },
        ],
      };

      const result = parser.parse(adf);
      expect(result).toBe("## Section Heading\n\n");
    });

    test("should handle complex nested ADF structure", () => {
      const complexAdf = mockFactory.createComplexADFDescription();
      const result = parser.parse(complexAdf);

      expect(result).toContain("This is a comprehensive bug report");
      expect(result).toContain("```javascript");
      expect(result).toContain("function buggyFunction");
      expect(result).toContain("1. Navigate to the dashboard");
      expect(result).toContain("Expected: Memory usage should remain stable");
    });

    test("should handle unknown node types gracefully", () => {
      const adf: ADFNode = {
        type: "unknownNodeType",
        content: [
          {
            type: "text",
            text: "Some content",
          },
        ],
      };

      const result = parser.parse(adf);
      expect(result).toBe("Some content");
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
              {
                type: "text",
                text: "Bold text",
                marks: [{ type: "strong" }],
              },
            ],
          },
          {
            type: "codeBlock",
            content: [
              {
                type: "text",
                text: "const x = 1;",
              },
            ],
          },
        ],
      };

      const result = parser.extractPlainText(adf);
      expect(result).toBe("Bold textconst x = 1;");
    });

    test("should handle null and undefined input", () => {
      expect(parser.extractPlainText(null)).toBe("");
      expect(parser.extractPlainText(undefined)).toBe("");
    });

    test("should handle string input (backward compatibility)", () => {
      const result = parser.extractPlainText("Simple string description");
      expect(result).toBe("Simple string description");
    });
  });
});

describe("parseADF()", () => {
  test("should parse ADF document", () => {
    const adf: ADFNode = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Simple paragraph." }],
        },
      ],
    };

    const result = parseADF(adf);
    expect(result).toBe("Simple paragraph.\n\n");
  });

  test("should handle null input", () => {
    const result = parseADF(null);
    expect(result).toBe("");
  });
});

describe("extractTextFromADF()", () => {
  test("should extract plain text from ADF", () => {
    const adf: ADFNode = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Plain text",
              marks: [{ type: "strong" }],
            },
          ],
        },
      ],
    };

    const result = extractTextFromADF(adf);
    expect(result).toBe("Plain text");
  });

  test("should handle null input", () => {
    const result = extractTextFromADF(null);
    expect(result).toBe("");
  });
});
