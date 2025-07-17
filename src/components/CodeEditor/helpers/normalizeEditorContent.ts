import { Descendant, Node, Text } from "slate";
import { BlockBlockName, BlockElement, isBlock, isLine, LineBlockName, LineElement } from "src/helpers/editorTypes.ts";
import { v4 as uuid } from "uuid";

export const normalizeEditorContent = (content: Descendant[]): (BlockElement | LineElement)[] => {
  return content.reduce<(BlockElement | LineElement)[]>((blocks, block) => {
    if (isBlock(block)) {
      blocks.push(normalizeBlockElement(block));
    }
    if (isLine(block)) {
      blocks.push(createLineElement(block.children));
    }
    return blocks;
  }, []);
};

export const extractLines = (content: (BlockElement | LineElement)[]) => {
  return content.reduce<LineElement[]>((blocks, block) => {
    if (isLine(block)) blocks.push(block);
    if (isBlock(block)) {
      block.children.forEach(line => blocks.push(line));
    }
    return blocks;
  }, []);
};

export const isBlockEmpty = (line: Node) => {
  return normalizeText(line) === "";
};

const normalizeBlockElement = (block: BlockElement): BlockElement => {
  const children = Array.isArray(block.children)
    ? block.children.reduce<LineElement[]>((children, child) => {
      if (isLine(child)) {
        children.push(createLineElement(child.children));
      }
      return children;
    }, [])
    : [];
  if (!children.length) children.push(createLineElement({ text: "" }));

  return {
    type: BlockBlockName,
    id: uuid(),
    active: Boolean(block.active),
    name: typeof block.name === "string" ? block.name : "",
    children,
  };
};

const createLineElement = (content: Text | Text[]): LineElement => {
  return {
    type: LineBlockName,
    id: uuid(),
    children: [{ text: normalizeText(content) }],
  };
};

type ElementWithText = { children?: (Text | ElementWithText)[] }
const normalizeText = (content: Text | Text[] | ElementWithText): string => {
  if ("text" in content) {
    return content.text;
  }
  if (Array.isArray(content)) {
    return content
      .map(line => normalizeText(line))
      .join(" ");
  }
  if (Array.isArray(content?.children)) return content.children
    .map(line => normalizeText(line))
    .join(" ");
  return "";
};