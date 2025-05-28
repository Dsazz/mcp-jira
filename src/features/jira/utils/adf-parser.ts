/**
 * ADF (Atlassian Document Format) Parser
 * 
 * Converts JIRA's complex ADF object structures to readable markdown text.
 * Handles backward compatibility with string descriptions.
 */

/**
 * ADF Node structure representing Atlassian Document Format nodes
 */
export interface ADFNode {
  type: string;
  content?: ADFNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

/**
 * ADF Document structure (top-level document with version)
 */
export interface ADFDocument extends ADFNode {
  type: 'doc';
  version: number;
  content: ADFNode[];
}

/**
 * Text mark for formatting (bold, italic, code, etc.)
 */
export interface ADFMark {
  type: string;
  attrs?: Record<string, unknown>;
}

/**
 * Converts ADF objects to markdown format preserving structure and formatting
 */
export class ADFToMarkdownParser {
  /**
   * Parse ADF content to markdown
   * @param adf - ADF object or string (for backward compatibility)
   * @returns Formatted markdown string
   */
  parse(adf: ADFNode | string | null | undefined): string {
    // Handle backward compatibility with string descriptions
    if (typeof adf === "string") return adf;
    if (!adf) return "";

    return this.parseNode(adf);
  }

  /**
   * Parse a single ADF node
   */
  private parseNode(node: ADFNode): string {
    switch (node.type) {
      case "doc":
        return this.parseContent(node.content || []);
      case "paragraph":
        return `${this.parseContent(node.content || [])}\n\n`;
      case "text":
        return this.formatText(node.text || "", node.marks || []);
      case "codeBlock":
        return this.parseCodeBlock(node);
      case "bulletList":
        return this.parseBulletList(node);
      case "orderedList":
        return this.parseOrderedList(node);
      case "listItem":
        return this.parseListItem(node);
      case "heading":
        return this.parseHeading(node);
      case "blockquote":
        return this.parseBlockquote(node);
      case "hardBreak":
        return "\n";
      case "rule":
        return "\n---\n\n";
      default:
        // For unknown node types, try to parse content if available
        return this.parseContent(node.content || []);
    }
  }

  /**
   * Parse array of content nodes
   */
  private parseContent(content: ADFNode[]): string {
    return content.map(node => this.parseNode(node)).join("");
  }

  /**
   * Format text with marks (bold, italic, code, etc.)
   */
  private formatText(text: string, marks: ADFMark[]): string {
    if (!marks || marks.length === 0) return text;

    let formattedText = text;

    // Apply marks in order
    for (const mark of marks) {
      switch (mark.type) {
        case "strong":
          formattedText = `**${formattedText}**`;
          break;
        case "em":
          formattedText = `*${formattedText}*`;
          break;
        case "code":
          formattedText = `\`${formattedText}\``;
          break;
        case "strike":
          formattedText = `~~${formattedText}~~`;
          break;
        case "link": {
          const href = mark.attrs?.href;
          if (href && typeof href === "string") {
            formattedText = `[${formattedText}](${href})`;
          }
          break;
        }
        // Add more mark types as needed
        default:
          // Unknown mark type, keep text as-is
          break;
      }
    }

    return formattedText;
  }

  /**
   * Parse code block with language support
   */
  private parseCodeBlock(node: ADFNode): string {
    const language = node.attrs?.language || "";
    const content = this.parseContent(node.content || []);
    
    return `\`\`\`${language}\n${content}\n\`\`\`\n\n`;
  }

  /**
   * Parse bullet list
   */
  private parseBulletList(node: ADFNode): string {
    const items = (node.content || [])
      .map(item => this.parseListItem(item, "- "))
      .join("");
    
    return `${items}\n`;
  }

  /**
   * Parse ordered list
   */
  private parseOrderedList(node: ADFNode): string {
    const items = (node.content || [])
      .map((item, index) => this.parseListItem(item, `${index + 1}. `))
      .join("");
    
    return `${items}\n`;
  }

  /**
   * Parse list item with prefix
   */
  private parseListItem(node: ADFNode, prefix = "- "): string {
    const content = this.parseContent(node.content || []);
    return `${prefix}${content.trim()}\n\n`;
  }

  /**
   * Parse heading with level support
   */
  private parseHeading(node: ADFNode): string {
    const level = node.attrs?.level || 1;
    const hashes = "#".repeat(Math.min(level as number, 6));
    const content = this.parseContent(node.content || []);
    
    return `${hashes} ${content}\n\n`;
  }

  /**
   * Parse blockquote
   */
  private parseBlockquote(node: ADFNode): string {
    const content = this.parseContent(node.content || []);
    const lines = content.split("\n");
    const quotedLines = lines.map(line => `> ${line}`).join("\n");
    
    return `${quotedLines}\n\n`;
  }

  /**
   * Extract plain text only (alternative format for simple use cases)
   */
  extractPlainText(adf: ADFNode | string | null | undefined): string {
    if (typeof adf === "string") return adf;
    if (!adf) return "";

    return this.extractTextFromNode(adf);
  }

  /**
   * Recursively extract text from ADF node
   */
  private extractTextFromNode(node: ADFNode): string {
    if (node.type === "text") {
      return node.text || "";
    }

    if (node.content) {
      return node.content
        .map(childNode => this.extractTextFromNode(childNode))
        .join("");
    }

    return "";
  }
}

/**
 * Default parser instance for convenience
 */
export const adfParser = new ADFToMarkdownParser();

/**
 * Convenience function for parsing ADF to markdown
 * @param adf - ADF object or string
 * @returns Formatted markdown string
 */
export function parseADF(adf: ADFNode | string | null | undefined): string {
  return adfParser.parse(adf);
}

/**
 * Convenience function for extracting plain text from ADF
 * @param adf - ADF object or string  
 * @returns Plain text string
 */
export function extractTextFromADF(adf: ADFNode | string | null | undefined): string {
  return adfParser.extractPlainText(adf);
} 