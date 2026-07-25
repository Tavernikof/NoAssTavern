import * as React from "react";
import style from "./GenerationPresetItem.module.scss";
import { generationPresetsManager } from "src/store/GenerationPresetsManager.ts";
import { openGenerationPresetNameModal } from "src/components/GenerationPresetNameModal";
import { backendProviderDict } from "src/enums/BackendProvider.ts";
import { observer } from "mobx-react-lite";
import Button from "src/components/Button";
import { Trash } from "lucide-react";
import Tooltip from "../../../../components/Tooltip";

type Props = {
  generationPresetId: string
};

const GenerationPresetItem: React.FC<Props> = (props) => {
  const { generationPresetId } = props;
  const { dict, remove } = generationPresetsManager;
  const generationPreset = dict[generationPresetId];

  const providerLabel = backendProviderDict.getById(generationPreset.backendProviderId)?.label ?? generationPreset.backendProviderId;

  return (
    <div className={style.container}>
      <button
        className={style.buttonOverlay}
        onClick={() => {
          openGenerationPresetNameModal({ initialName: generationPreset.name }).result.then(name => {
            generationPreset.update({ name: name as string });
          });
        }}
      />
      <div className={style.main}>
        <div className={style.name}>{generationPreset.name || "-"}</div>
        <div className={style.details}>
          {providerLabel}
          {generationPreset.model ? ` / ${generationPreset.model}` : ""}
        </div>
      </div>
      <div className={style.aside}>
        <Tooltip
          content={() => (
            <div className={style.tooltip}>
              <div>Delete generation preset?</div>
              <Button size="small" onClick={() => remove(generationPreset)}>Delete</Button>
            </div>
          )}
        >
          {({ elementRef, getReferenceProps }) => (
            <Button ref={elementRef} iconBefore={Trash} {...getReferenceProps()} />
          )}
        </Tooltip>
      </div>
    </div>
  );
};

export default observer(GenerationPresetItem) as typeof GenerationPresetItem;
