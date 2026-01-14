import * as React from "react";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import _flowRight from "lodash/flowRight";
import { createEditor, Descendant, Editor, Transforms, Point } from "slate";
import { v4 as uuid } from "uuid";
import BlockEditorBlock from "src/components/BlockEditor/components/BlockEditorBlock/BlockEditorBlock.tsx";
import {
  BlockBlockName,
  CustomEditor,
  isBlock,
  isInsideBlock,
  isLine,
  LineBlockName,
  LineElement,
} from "src/helpers/editorTypes.ts";
import { RenderElementProps } from "slate-react/dist/components/editable";
import BlockEditorLine from "src/components/BlockEditor/components/BlockEditorLine/BlockEditorLine.tsx";
import { action, makeObservable, observable } from "mobx";
import { ChatMessageRole } from "src/enums/ChatManagerRole.ts";
import {
  extractLines,
  isBlockEmpty,
  normalizeEditorContent,
} from "src/components/BlockEditor/helpers/normalizeEditorContent.ts";

export class PresetEditor {
  id = uuid();
  editor: CustomEditor;
  initialValue: Descendant[];
  private inited: boolean;
  @observable role: ChatMessageRole;

  constructor(block: PromptBlock) {
    this.editor = this.createEditor();
    this.role = block.role;
    this.initialValue = this.parseContent(block.content);

    makeObservable(this);
  }

  serialize(): PromptBlock {
    return {
      role: this.role,
      content: this.getContent(),
    };
  }

  @action
  setInited() {
    this.inited = true;
  }

  @action
  setRole = (role: ChatMessageRole) => {
    this.role = role;
  };

  protected getContent(): PresetBlockContent[] {
    const blocks: PresetBlockContent[] = [];
    // let currentBlock: PresetBlockContent | null = null;
    let content: string[] | null = [];
    const children = this.inited ? this.editor.children : this.initialValue;
    children.forEach(item => {
      if (isLine(item)) {
        if (!content) content = [];
        content.push(item.children[0].text);
      } else if (isBlock(item)) {
        if (content && content.length) {
          blocks.push({
            active: true,
            name: null,
            content: content.join("\n"),
          });
          content = null;
        }
        const blockContent: string[] = [];
        item.children.forEach((child) => {
          blockContent.push(child.children[0].text);
        });
        blocks.push({
          active: item.active,
          name: item.name,
          content: blockContent.join("\n"),
        });
      }
    });
    if (content && content.length) {
      blocks.push({
        active: true,
        name: null,
        content: content.join("\n"),
      });
    }
    return blocks;
  }

  toggleBlock = () => {
    const { editor } = this;
    const { selection } = editor;
    if (!selection) return;

    const { anchor: { path: [startIndex] }, focus: { path: [endIndex] } } = selection;
    const minIndex = Math.min(startIndex, endIndex);
    const startBlock = editor.children[minIndex];
    if (isBlock(startBlock)) {
      this.editor.unwrapNodes({
        mode: "highest",
        at: [minIndex],
      });
    } else {
      const id = uuid();
      this.editor.wrapNodes({
        type: BlockBlockName,
        id: id,
        active: true,
        name: "",
        children: [],
      }, {});
    }
  };

  renderElement(props: RenderElementProps): React.JSX.Element {
    const { element: { type } } = props;
    if (type === BlockBlockName) {
      return React.createElement(BlockEditorBlock, props);
    }
    return React.createElement(BlockEditorLine, props);
  }

  handleKeyDown = (event: React.KeyboardEvent) => {
    const { editor } = this;
    const { selection } = editor;
    if (!selection) return;

    const [start, end] = Editor.edges(editor, selection);
    const blockNodeEntry = Editor.above(editor, { at: start, match: (n) => isBlock(n as Descendant) });
    const lineNodeEntry = Editor.above(editor, { at: start, match: (n) => isLine(n as Descendant) });
    const isNotRange = Point.equals(start, end);
    const isStartOfBlock = blockNodeEntry ? Point.equals(start, Editor.start(editor, blockNodeEntry[1])) : false;
    const isEndOfBlock = blockNodeEntry ? Point.equals(end, Editor.end(editor, blockNodeEntry[1])) : false;
    const isEndOfLine = lineNodeEntry ? Point.equals(end, Editor.end(editor, lineNodeEntry[1])) : false;

    // Если стираем внутри блока и перед ним пустая строка - стираем ее
    if (event.key === "Backspace" && blockNodeEntry && isNotRange && isStartOfBlock) {
      const previousLine = blockNodeEntry[1][0] - 1;
      if (previousLine >= 0) {
        const previousNodeEntry = Editor.node(editor, [previousLine]);
        if (previousNodeEntry && isBlockEmpty(previousNodeEntry[0])) {
          if (isLine(previousNodeEntry[0])) {
            Transforms.removeNodes(editor, { at: previousNodeEntry[1] });
          }
        }
      }
      event.preventDefault();
      return;
    }

    // Если жмем Delete внутри пустой строки и за ней идет блок, удаляем строку
    if (event.key === "Delete" && isNotRange && isEndOfLine && (!blockNodeEntry || isEndOfBlock)) {
      const nextNodeEntry = Editor.next(editor, { at: start, match: (_, path) => path.length === 1 });
      if (nextNodeEntry && isBlock(nextNodeEntry[0])) {
        const isEmptyLine = lineNodeEntry ? isBlockEmpty(lineNodeEntry[0]) : false;
        if (isEmptyLine && !blockNodeEntry) {
          Transforms.removeNodes(editor, { at: start });
        }
        event.preventDefault();
        return;
      }
    }

    if (blockNodeEntry && event.metaKey && event.key === "Enter") {
      event.preventDefault();
      const blockPath = blockNodeEntry[1];

      if (event.shiftKey) {
        // Add empty line before block
        Transforms.insertNodes(editor, {
          type: LineBlockName,
          id: uuid(),
          children: [{ text: "" }],
        }, { at: blockPath });
        Transforms.select(editor, blockPath);
      } else {
        // Add empty line after block
        const nextPath = [...blockPath];
        nextPath[0] += 1;
        Transforms.insertNodes(editor, {
          type: LineBlockName,
          id: uuid(),
          children: [{ text: "" }],
        }, { at: nextPath });
        Transforms.select(editor, nextPath);
      }
    }
  };

  handleChange = () => {
    const isAstChanged = this.editor.operations.some((op) => op.type !== "set_selection");
    if (isAstChanged) this.initialValue = this.editor.children;
  };

  private createEditor() {
    const editor: CustomEditor = _flowRight(
      withReact,
      withHistory,
      createEditor,
    )();

    // ========================================================================
    // Custom copy behavior to exclude UI elements
    // ========================================================================
    editor.setFragmentData = (data) => {
      const fragment = editor.getFragment();
      const cleanFragment = fragment.map(node => {
        if (isBlock(node)) {
          return {
            ...node,
            children: node.children.filter(child => isLine(child)),
          };
        }
        return node;
      });

      // Set the cleaned fragment data
      const slateFragment = btoa(encodeURIComponent(JSON.stringify(cleanFragment)));
      data.setData("application/x-slate-fragment", slateFragment);

      // Also set plain text version
      const text = cleanFragment.map(node => {
        if (isBlock(node)) {
          return node.children.map(child => isLine(child) ? child.children[0].text : "").join("\n");
        }
        return isLine(node) ? node.children[0].text : "";
      }).join("\n");
      data.setData("text/plain", text);
    };

    // ========================================================================
    // Обновление ID при разбитии блока на 2 части
    // ========================================================================

    const { insertBreak } = editor;
    editor.insertBreak = editor.insertSoftBreak = () => {
      insertBreak();
      Transforms.setNodes(editor, { id: uuid() });
    };

    // ========================================================================
    // Парсинг контента при вставке
    // ========================================================================

    editor.insertFragmentData = (data) => {
      const slateFragment = data.getData("application/x-slate-fragment");
      if (slateFragment) {
        try {
          const content = JSON.parse(decodeURIComponent(atob(slateFragment)));
          if (!Array.isArray(content)) throw "wrong content";
          let normalizedContent = normalizeEditorContent(content);
          if (isInsideBlock(editor)) normalizedContent = extractLines(normalizedContent);
          Transforms.insertNodes(editor, normalizedContent);
          return true;
        } catch (e) {
          /* empty */
        }
      }

      const text = data.getData("text/plain");
      const chunks = text.trimEnd().split("\n");
      chunks.forEach((step, i) => {
        if (i) {
          Transforms.insertNodes(editor, {
            type: LineBlockName,
            id: uuid(),
            children: [{ text: "" }],
          });
        }
        Transforms.insertText(editor, step);
      });

      return true;
    };

    return editor;
  }

  private parseContent(content: PresetBlockContent[]) {
    const value: Descendant[] = [];

    content.forEach(block => {
      if (block.name === null) {
        value.push(...this.parseContentText(block.content));
      } else {
        const id = uuid();
        value.push({
          type: BlockBlockName,
          id,
          active: block.active,
          name: block.name,
          children: this.parseContentText(block.content),
        });
      }
    });
    return value;
  }

  private parseContentText(text: string) {
    const parts = text
      .split("\n")
      .map(t => t.trim());
    if (!parts.length) parts.push("");
    return parts.map(text => ({
      type: LineBlockName,
      id: uuid(),
      children: [{ text }],
    }) as LineElement);
  }
}