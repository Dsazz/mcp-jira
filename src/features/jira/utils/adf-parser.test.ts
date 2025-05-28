/**
 * ADF Parser Tests
 * 
 * Comprehensive tests for Atlassian Document Format parser
 */
import { describe, it, expect } from "bun:test";
import { ADFToMarkdownParser, parseADF, extractTextFromADF } from "./adf-parser";
import type { ADFNode } from "./adf-parser";

describe("ADF Parser", () => {
  const parser = new ADFToMarkdownParser();

  describe("parseADF convenience function", () => {
    it("should handle string input (backward compatibility)", () => {
      expect(parseADF("Plain text")).toBe("Plain text");
    });

    it("should handle null/undefined input", () => {
      expect(parseADF(null)).toBe("");
      expect(parseADF(undefined)).toBe("");
    });
  });

  describe("extractTextFromADF convenience function", () => {
    it("should extract plain text from complex ADF", () => {
      const adf: ADFNode = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Hello " },
              { type: "text", text: "world", marks: [{ type: "strong" }] }
            ]
          }
        ]
      };

      expect(extractTextFromADF(adf)).toBe("Hello world");
    });
  });

  describe("Document structure parsing", () => {
    it("should parse basic document with paragraph", () => {
      const adf: ADFNode = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Hello world" }
            ]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("Hello world\n\n");
    });

    it("should parse multiple paragraphs", () => {
      const adf: ADFNode = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "First paragraph" }]
          },
          {
            type: "paragraph", 
            content: [{ type: "text", text: "Second paragraph" }]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("First paragraph\n\nSecond paragraph\n\n");
    });
  });

  describe("Text formatting", () => {
    it("should format bold text", () => {
      const adf: ADFNode = {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "bold text",
            marks: [{ type: "strong" }]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("**bold text**\n\n");
    });

    it("should format italic text", () => {
      const adf: ADFNode = {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "italic text",
            marks: [{ type: "em" }]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("*italic text*\n\n");
    });

    it("should format code text", () => {
      const adf: ADFNode = {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "code text",
            marks: [{ type: "code" }]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("`code text`\n\n");
    });

    it("should format strikethrough text", () => {
      const adf: ADFNode = {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "strike text",
            marks: [{ type: "strike" }]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("~~strike text~~\n\n");
    });

    it("should format links", () => {
      const adf: ADFNode = {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "link text",
            marks: [{ type: "link", attrs: { href: "https://example.com" } }]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("[link text](https://example.com)\n\n");
    });

    it("should handle multiple marks on same text", () => {
      const adf: ADFNode = {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "formatted text",
            marks: [
              { type: "strong" },
              { type: "em" }
            ]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("***formatted text***\n\n");
    });
  });

  describe("Code blocks", () => {
    it("should format code block without language", () => {
      const adf: ADFNode = {
        type: "codeBlock",
        content: [
          { type: "text", text: "console.log('hello');" }
        ]
      };

      expect(parser.parse(adf)).toBe("```\nconsole.log('hello');\n```\n\n");
    });

    it("should format code block with language", () => {
      const adf: ADFNode = {
        type: "codeBlock",
        attrs: { language: "javascript" },
        content: [
          { type: "text", text: "console.log('hello');" }
        ]
      };

      expect(parser.parse(adf)).toBe("```javascript\nconsole.log('hello');\n```\n\n");
    });
  });

  describe("Lists", () => {
    it("should format bullet list", () => {
      const adf: ADFNode = {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "First item" }]
              }
            ]
          },
          {
            type: "listItem", 
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Second item" }]
              }
            ]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("- First item\n\n- Second item\n\n\n");
    });

    it("should format ordered list", () => {
      const adf: ADFNode = {
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph", 
                content: [{ type: "text", text: "First item" }]
              }
            ]
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Second item" }]
              }
            ]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("1. First item\n\n2. Second item\n\n\n");
    });
  });

  describe("Headings", () => {
    it("should format heading level 1", () => {
      const adf: ADFNode = {
        type: "heading",
        attrs: { level: 1 },
        content: [
          { type: "text", text: "Heading 1" }
        ]
      };

      expect(parser.parse(adf)).toBe("# Heading 1\n\n");
    });

    it("should format heading level 3", () => {
      const adf: ADFNode = {
        type: "heading",
        attrs: { level: 3 },
        content: [
          { type: "text", text: "Heading 3" }
        ]
      };

      expect(parser.parse(adf)).toBe("### Heading 3\n\n");
    });

    it("should cap heading level at 6", () => {
      const adf: ADFNode = {
        type: "heading",
        attrs: { level: 10 },
        content: [
          { type: "text", text: "Deep heading" }
        ]
      };

      expect(parser.parse(adf)).toBe("###### Deep heading\n\n");
    });
  });

  describe("Blockquotes", () => {
    it("should format blockquote", () => {
      const adf: ADFNode = {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "This is a quote" }]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("> This is a quote\n> \n> \n\n");
    });
  });

  describe("Special elements", () => {
    it("should handle hard break", () => {
      const adf: ADFNode = {
        type: "paragraph",
        content: [
          { type: "text", text: "Line 1" },
          { type: "hardBreak" },
          { type: "text", text: "Line 2" }
        ]
      };

      expect(parser.parse(adf)).toBe("Line 1\nLine 2\n\n");
    });

    it("should handle horizontal rule", () => {
      const adf: ADFNode = {
        type: "rule"
      };

      expect(parser.parse(adf)).toBe("\n---\n\n");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty content", () => {
      const adf: ADFNode = {
        type: "doc",
        content: []
      };

      expect(parser.parse(adf)).toBe("");
    });

    it("should handle unknown node types gracefully", () => {
      const adf: ADFNode = {
        type: "unknownType",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Should still parse content" }]
          }
        ]
      };

      expect(parser.parse(adf)).toBe("Should still parse content\n\n");
    });

    it("should handle text without marks", () => {
      const adf: ADFNode = {
        type: "text",
        text: "Plain text"
      };

      expect(parser.parse(adf)).toBe("Plain text");
    });

    it("should handle unknown mark types", () => {
      const adf: ADFNode = {
        type: "text",
        text: "text with unknown mark",
        marks: [{ type: "unknownMark" }]
      };

      expect(parser.parse(adf)).toBe("text with unknown mark");
    });
  });

  describe("Complex real-world examples", () => {
    it("should parse typical JIRA issue description", () => {
      const adf: ADFNode = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Problem Description" }]
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "The " },
              { type: "text", text: "search API", marks: [{ type: "code" }] },
              { type: "text", text: " is returning " },
              { type: "text", text: "500 errors", marks: [{ type: "strong" }] },
              { type: "text", text: " when querying large datasets." }
            ]
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Steps to Reproduce" }]
          },
          {
            type: "orderedList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Send request to search endpoint" }]
                  }
                ]
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Include large dataset filter" }]
                  }
                ]
              }
            ]
          }
        ]
      };

      const expected = "## Problem Description\n\nThe `search API` is returning **500 errors** when querying large datasets.\n\n### Steps to Reproduce\n\n1. Send request to search endpoint\n\n2. Include large dataset filter\n\n\n";
      expect(parser.parse(adf)).toBe(expected);
    });
  });
}); 