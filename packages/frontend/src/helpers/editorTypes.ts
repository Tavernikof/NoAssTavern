import { Descendant, Editor, Location, Range, Text } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";
import * as React from "react";

export const ParagraphBlockName = "p";
export const LineBlockName = "codeEditorLine";
export const BlockBlockName = "codeEditorBlock";

export const isParagraph = (block: Record<string, any>): block is ParagraphElement => "type" in block && block.type === ParagraphBlockName;
export const isLine = (block: Record<string, any>): block is LineElement => "type" in block && block.type === LineBlockName;
export const isBlock = (block: Record<string, any>): block is BlockElement => "type" in block && block.type === BlockBlockName;

export const isInsideBlock = (editor: CustomEditor, at?: Location) => !!Editor.above(editor, {
  at,
  match: (n) => isBlock(n as Descendant),
});

export type ParagraphElement = {
  type: typeof ParagraphBlockName;
  id: string;
  children: [Text];
}

export type LineElement = {
  type: typeof LineBlockName;
  id: string;
  children: [Text];
}

export type BlockElement = {
  type: typeof BlockBlockName;
  id: string;
  active: boolean;
  name: string;
  children: LineElement[];
}


export type DecoratedRange = Range & {
  token?: string | null;
  error?: boolean;
}

declare module "slate" {
  interface CustomTypes {
    Element: ParagraphElement | LineElement | BlockElement;
    DecoratedRange: DecoratedRange;
  }
}

export interface CustomEditor extends ReactEditor, HistoryEditor {
  onKeyDown: (event: React.KeyboardEvent) => void;
}
