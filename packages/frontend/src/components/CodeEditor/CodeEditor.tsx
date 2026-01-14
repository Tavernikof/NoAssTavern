import * as React from "react";
import { debounce } from "lodash";
import style from "./CodeEditor.module.scss";
import type { editor } from "monaco-editor";
import { useLatest } from "react-use";

const DEFAULT_LANGUAGE = "typescript";
const DEFAULT_DEBOUNCE_MS = 300;

export type CodeEditorApi = {
  getValue: () => string;
  setValue: (value: string) => void;
}

export type Props = {
  onChange?: (value: string) => void;
}

const CodeEditor = React.forwardRef<CodeEditorApi, Props>((props, ref) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);
  const lastValueRef = React.useRef<string | null>("");
  const onChangeRef = useLatest(props.onChange);

  React.useEffect(() => {
    let disposed = false;
    let disposable: ReturnType<editor.IStandaloneCodeEditor["onDidChangeModelContent"]> | null = null;

    const onChangeDebounced = debounce(() => {
      const onChange = onChangeRef.current;
      if (!onChange) return;
      const value = editorRef.current?.getValue();
      if (typeof value === "string") onChange(value);
    }, DEFAULT_DEBOUNCE_MS);

    import("./helpers/monaco-setup.ts").then(({ monaco }) => {
      if (disposed) return;
      if (!containerRef.current) return;

      const instance = monaco.editor.create(containerRef.current, {
        value: lastValueRef.current || "",
        language: DEFAULT_LANGUAGE,
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: "on",
        tabSize: 2,
      });

      editorRef.current = instance;

      disposable = instance.onDidChangeModelContent(onChangeDebounced);
    });

    return () => {
      disposed = true;
      disposable?.dispose();
      editorRef.current?.dispose();
      onChangeDebounced.cancel();
    };
  }, []);

  React.useImperativeHandle(ref, () => ({
    getValue: () => {
      const editor = editorRef.current;
      if (editor) return editor.getValue();
      return lastValueRef.current || "";
    },
    setValue: (value: string) => {
      lastValueRef.current = value;
      const editor = editorRef.current;
      if (!editor) return;

      const position = editor.getPosition();
      const selections = editor.getSelections();

      editor.setValue(value);

      if (position) {
        editor.setPosition(position);
      }
      if (selections && selections.length > 0) {
        editor.setSelections(selections);
      }
    },
  }), []);

  return (
    <div
      ref={containerRef}
      className={style.editorContainer}
      onKeyDown={(e) => e.stopPropagation()} // fix conflict with ReactFlow
    />
  );
});

export default React.memo(CodeEditor) as typeof CodeEditor;
