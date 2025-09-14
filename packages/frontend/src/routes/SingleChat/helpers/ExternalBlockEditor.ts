import { ReactEditor, withReact } from "slate-react";
import { HistoryEditor, withHistory } from "slate-history";
import _flowRight from "lodash/flowRight";
import { createEditor, Descendant, Transforms } from "slate";
import { v4 as uuid } from "uuid";
import * as React from "react";
import { makeObservable } from "mobx";
import EventEmitter from "../../../helpers/EventEmitter.ts";
import { isLine, LineBlockName, LineElement } from "src/helpers/editorTypes.ts";
import { RenderElementProps } from "slate-react/dist/components/editable";

export type ChatMessageEditorEvents = {
  "submit": void,
  "cancel": void,
}

export class ExternalBlockEditor extends EventEmitter<ChatMessageEditorEvents> {
  editor: ReactEditor & HistoryEditor;

  initialValue: Descendant[];

  constructor(message: string) {
    super();

    this.editor = this.createEditor();

    this.initialValue = this.parseContent(message);

    requestAnimationFrame(() => {
      ReactEditor.focus(this.editor);
      this.editor.select(this.editor.end([]));
    });

    makeObservable(this);

    this.onKeyDown = this.onKeyDown.bind(this);
    // this.onChange = this.onChange.bind(this);
  }

  getContent(): string {
    return this.editor.children.map(block => isLine(block) ? block.children[0].text : "").join("\n");
  }

  // onChange() {
  //   const isAstChanged = this.editor.operations.some((op) => op.type !== "set_selection");
  //   if (isAstChanged) this.updateDecorators();
  // }

  renderElement(props: RenderElementProps): React.JSX.Element {
    return React.createElement("div", props);
  }

  onKeyDown(event: React.KeyboardEvent) {
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

  private createEditor() {
    const editor: ReactEditor & HistoryEditor = _flowRight(
      withReact,
      withHistory,
      createEditor,
    )();

    // ========================================================================
    // Парсинг контента при вставке
    // ========================================================================

    editor.insertFragmentData = (data) => {
      const text = data.getData("text/plain");

      const chunks = text.split("\n");
      chunks.forEach((step, i) => {
        if (i) {
          Transforms.insertNodes(editor, [{
            type: LineBlockName,
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

  private parseContent(text: string) {
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