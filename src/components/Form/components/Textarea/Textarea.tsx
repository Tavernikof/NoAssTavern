import * as React from "react";
import style from "./Textarea.module.scss";
import clsx from "clsx";
import { mergeRefs } from "react-merge-refs";
import autosize from "autosize";

type Props = {
  autoHeight?: boolean,
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, Props>((props, ref) => {
  const { autoHeight, ...textareaProps } = props;
  const textareaRef = React.useRef<HTMLTextAreaElement>();
  const changedRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el || !autoHeight) return;

    const onChangeInput = () => {
      changedRef.current = true;
    };

    el.addEventListener("input", onChangeInput);
    autosize(el);
    return () => {
      el.removeEventListener("input", onChangeInput);
      autosize.destroy(el);
    };
  }, [autoHeight]);


  React.useEffect(() => {
    if (changedRef.current) {
      changedRef.current = false;
      return;
    }
    const el = textareaRef.current;
    if (el && autoHeight) autosize.update(el);
  }, [autoHeight, textareaProps.value]);

  return (
    <textarea
      ref={mergeRefs([ref, textareaRef])}
      {...textareaProps}
      className={clsx(style.textarea, autoHeight && style.autoHeight, textareaProps.className)}
    />
  );
});

export default React.memo(Textarea) as typeof Textarea;
