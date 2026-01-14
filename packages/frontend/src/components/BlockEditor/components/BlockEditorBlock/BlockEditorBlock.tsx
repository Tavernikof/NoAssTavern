import * as React from "react";
import style from "./BlockEditorBlock.module.scss";
import { RenderElementProps } from "slate-react";
import { useBlockEditorContext } from "src/components/BlockEditor/helpers/BlockEditorContext.ts";
import { observer } from "mobx-react-lite";
import Checkbox from "src/components/Form/components/Checkbox";
import Input from "src/components/Form/components/Input";
import Button from "src/components/Button";
import { Trash } from "lucide-react";
import { BlockElement, isBlock } from "src/helpers/editorTypes.ts";
import { Transforms } from "slate";

type Props = RenderElementProps;

const BlockEditorBlock: React.FC<Props> = (props) => {
  const { element } = props;
  const blockEditorContext = useBlockEditorContext();
  const { editor } = blockEditorContext;
  const { id, active, name } = element as BlockElement;
  const [localName, setLocalName] = React.useState(name);

  React.useEffect(() => {
    setLocalName(name);
  }, [name])

  const toggleActive = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    Transforms.setNodes(
      editor,
      { active: e.currentTarget.checked },
      { at: [], match: (node) => isBlock(node) && node.id === id },
    );
  }, [editor, id]);

  const updateName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.currentTarget.value);
    Transforms.setNodes(
      editor,
      { name: e.currentTarget.value },
      { at: [], match: (node) => isBlock(node) && node.id === id },
    );
  }, [editor, id]);

  const onRemove = React.useCallback(() => {
    Transforms.removeNodes(editor, {
      at: [],
      match: (node) => isBlock(node) && node.id === id,
    });
  }, [editor, id]);

  return (
    <div{...props.attributes} className={style.container}>
      <div className={style.head} contentEditable={false}>
        <Checkbox checked={active} onChange={toggleActive} label="Active" />
        <Input value={localName} onChange={updateName} placeholder="Block name" />
        <Button type="button" onClick={onRemove} iconBefore={Trash} />
      </div>
      {props.children}
    </div>
  );
};

export default observer(BlockEditorBlock) as typeof BlockEditorBlock;
