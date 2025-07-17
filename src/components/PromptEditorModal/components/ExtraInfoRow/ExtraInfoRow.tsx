import * as React from "react";
import { Pen } from "lucide-react";
import { observer } from "mobx-react-lite";
import style from "./ExtraInfoRow.module.scss";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton";

type Props = {
  label: React.ReactNode,
  onClick: () => void,
};

const ExtraInfoRow: React.FC<Props> = (props) => {
  const { label, onClick } = props;

  return (
    <div className={style.container}>
      <div className={style.label}>{label}</div>
      <MessageActionButton
        icon={Pen}
        onClick={onClick}
      />
    </div>
  );
};

export default observer(ExtraInfoRow) as typeof ExtraInfoRow;
