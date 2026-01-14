import { ReactEditor, withReact } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";
import _flowRight from "lodash/flowRight";
import { createEditor, Descendant, Editor, Element, Node, Point, Range, Text, Transforms } from "slate";
import { v4 as uuid } from "uuid";
import * as React from "react";
import { parseSpecialTokens } from "src/routes/SingleChat/helpers/parseText.ts";
import { action, makeObservable, observable } from "mobx";
import EventEmitter from "../../../helpers/EventEmitter.ts";
import { DecoratedRange, isParagraph, ParagraphBlockName } from "src/helpers/editorTypes.ts";
import { ChatController } from "src/routes/SingleChat/helpers/ChatController.ts";

export type ChatMessageEditorEvents = {
  "submit": void,
  "cancel": void,
}

export class ChatMessageEditor extends EventEmitter<ChatMessageEditorEvents> {
  chatController: ChatController;

  editor: ReactEditor & HistoryEditor;

  initialValue: Descendant[];

  decoratorsDict: Record<string, { ranges: DecoratedRange[], error: boolean }> = {};

  private wrappingCharacters: Record<string, string> = {
    "*": "*",
    "\"": "\"",
    "'": "'",
    "`": "`",
  };

  constructor(chatController: ChatController, message: string) {
    super();
    this.chatController = chatController;

    this.editor = this.createEditor();

    this.initialValue = this.parseMessage(message);

    requestAnimationFrame(() => {
      this.updateDecorators();
      this.focusEditor();
    });

    makeObservable(this, {
      decoratorsDict: observable.ref,
      updateDecorators: action,
    });

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  getContent(): string {
    return this.editor.children.map(block => isParagraph(block) ? block.children[0].text : "").join("\n");
  }

  setContent(message: string) {
    this.editor.withoutNormalizing(() => {
      while (this.editor.children.length) {
        this.editor.removeNodes({ at: [0] });
      }
      this.editor.insertNodes(this.parseMessage(message));
    });
  }

  focusEditor() {
    if (!this.editor.children.length) return;
    ReactEditor.focus(this.editor);
    this.editor.select(this.editor.end([]));
  }

  onChange() {
    const isAstChanged = this.editor.operations.some((op) => op.type !== "set_selection");
    if (isAstChanged) this.updateDecorators();
  }

  onKeyDown(event: React.KeyboardEvent) {
    const { editor } = this;

    // ========================================================================
    // Оборачивание выделенного текста в введенный символ
    // ========================================================================
    const selection = editor.selection;
    if (selection && !Range.isCollapsed(selection)) {
      const { key } = event;
      const wrapper = this.wrappingCharacters[key];

      if (wrapper) {
        event.preventDefault();

        const [start] = Editor.edges(editor, selection);
        const selectedText = Editor.string(editor, selection);

        Transforms.delete(editor, { at: selection });
        Transforms.insertText(editor, `${wrapper}${selectedText}${wrapper}`, { at: start });
        // Move the cursor to be inside the wrapped text, at the position just after the opening wrapper
        // Transforms.select(editor, Editor.move(editor, { distance: wrapper.length, unit: 'character', reverse: true, at: end }));
        return true;
      }
    }

    // ========================================================================
    // Быстрая отправка сообщения на ctrl+enter
    // ========================================================================
    if (event.key === "Enter" && event.metaKey) {
      this.emit("submit");
      return true;
    }

    if (event.key === "Escape") {
      this.emit("cancel");
      return true;
    }
  }

  private parseMessage(message: string) {
    const value: Descendant[] = message
      .split("\n")
      .filter(m => m.trim())
      .map(text => ({
        type: ParagraphBlockName,
        id: uuid(),
        children: [{ text }],
      }));
    if (!value.length) value.push({
      type: ParagraphBlockName,
      id: uuid(),
      children: [{ text: "" }],
    });

    return value;
  }

  private checkIfCursorAtEndOfNode() {
    const { editor } = this;
    const location = editor.selection;
    const normalizedLocation = Range.isRange(location)
      ? location.focus
      : location;

    if (!Point.isPoint(normalizedLocation)) return false;

    const [node, path] = Editor.node(editor, normalizedLocation);
    if (!node) return false;

    if (Text.isText(node)) {
      const endPoint = Editor.end(editor, path);
      return Point.equals(normalizedLocation, endPoint);
    }

    if (Node.isNode(node)) {
      const endPoint = Editor.end(editor, path);
      return Point.equals(normalizedLocation, endPoint);
    }

    return false;
  };

  private getPrefix() {
    const { editor } = this;
    if (this.checkIfCursorAtEndOfNode()) return undefined;
    const [currentNode] = Editor.node(editor, editor.selection!.focus.path, { depth: 2 });
    const content = Node.string(currentNode);
    const prefix = content.match(/^`(.*?)` /g)?.[0];
    return prefix ? prefix : undefined;
  };

  private createEditor() {
    const editor: ReactEditor & HistoryEditor = _flowRight(
      withReact,
      withHistory,
      createEditor,
    )();

    // ========================================================================
    // Добавление префикса в начало блока
    // ========================================================================

    const { insertBreak } = editor;

    editor.insertBreak = editor.insertSoftBreak = () => {
      insertBreak();

      const newPrefix = this.getPrefix();
      Transforms.setNodes(editor, { id: uuid() });
      if (!newPrefix) this.chatController.getUserPrefix().then(prefix => Transforms.insertText(editor, prefix));
    };

    // ========================================================================
    // Парсинг контента при вставке
    // ========================================================================

    editor.insertFragmentData = (data) => {
      const text = data.getData("text/plain");

      const chunks = text.split("\n");
      chunks.forEach((step, i) => {
        if (i) {
          Transforms.insertNodes(editor, [{
            type: ParagraphBlockName,
            id: uuid(),
            children: [{ text: "" }],
          }]);
        }
        Transforms.insertText(editor, step);
      });

      return true;
    };

    return editor;
  }

  updateDecorators() {
    this.decoratorsDict = {};
    this.editor.children.forEach((block, i) => {
      if (!Element.isElement(block)) return;
      const node = block.children[0];
      if (!Text.isText(node)) return;
      const { text } = node;
      const { tokens, error } = parseSpecialTokens(text);

      const ranges: DecoratedRange[] = [];

      for (let index = 0; index < tokens.length; index++) {
        const { start, end, token } = tokens[index];

        const path = [i, 0];
        const range: DecoratedRange = {
          anchor: { path, offset: start },
          focus: { path, offset: end },
          token: token ? token[0] : null,
          error,
        };

        ranges.push(range);
      }

      this.decoratorsDict[block.id] = { ranges, error };
    });
  }
}