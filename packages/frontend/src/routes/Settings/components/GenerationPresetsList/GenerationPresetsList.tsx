import * as React from "react";
import { observer } from "mobx-react-lite";
import { generationPresetsManager } from "src/store/GenerationPresetsManager.ts";
import style from "./GenerationPresetsList.module.scss";
import GenerationPresetItem from "src/routes/Settings/components/GenerationPresetItem";

type Props = Record<string, never>;

const GenerationPresetsList: React.FC<Props> = () => {
  return (
    <div className={style.container}>
      {generationPresetsManager.list.map(generationPresetId => (
        <GenerationPresetItem
          key={generationPresetId}
          generationPresetId={generationPresetId}
        />
      ))}
    </div>
  );
};

export default observer(GenerationPresetsList) as typeof GenerationPresetsList;
