import * as React from "react";
import {
  CheckboxControlled,
  CreatableSelectControlled,
  FormInput,
  InputControlled,
  SelectControlled,
  TextareaControlled,
} from "src/components/Form";
import style from "./PresetEditForm.module.scss";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { useWatch } from "react-hook-form";
import { observer } from "mobx-react-lite";
import ExtraInfoRow from "src/components/PromptEditorModal/components/ExtraInfoRow";
import { openConnectionProxyModal } from "src/components/ConnectionProxyModal";
import { backendProviderDict, BackendProviderItem } from "src/enums/BackendProvider";
import { ExternalLink, PackagePlus, RefreshCw } from "lucide-react";
import { useModelsLoader } from "src/components/PromptEditorModal/helpers/useModelsLoader.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton/MessageActionButton.tsx";
import { SelectOption } from "src/helpers/createDictionary.ts";

type PresetFieldConfig = { name: string, label: string, type: "input" | "checkbox" };

const fields: PresetFieldConfig[] = [
  { name: "stream", label: "Stream", type: "checkbox" },
  { name: "temperature", label: "temperature", type: "input" },
  { name: "stopSequences", label: "stopSequences", type: "input" },
  { name: "clientOnlyStop", label: "Client-only stop string", type: "checkbox" },
  { name: "maxOutputTokens", label: "maxOutputTokens", type: "input" },
  { name: "topP", label: "topP", type: "input" },
  { name: "topK", label: "topK", type: "input" },
  { name: "presencePenalty", label: "presencePenalty", type: "input" },
  { name: "frequencyPenalty", label: "frequencyPenalty", type: "input" },
];

type Props = Record<string, never>;

const PresetEditForm: React.FC<Props> = () => {
  const connectionProxy = useWatch({ name: "connectionProxy" }) as { label: string, value: string } | null;
  const backendProviderId = useWatch({ name: "backendProviderId" }) as SelectOption<BackendProviderItem> | null;

  const backendProvider = backendProviderId?.original?.class;
  const models = useModelsLoader(backendProvider, connectionProxy?.value);

  return (
    <>
      <FormInput label="Name:" name="name">
        <InputControlled name="name" />
      </FormInput>

      <hr className={style.separator} />

      <FormInput label="Provider:" name="backendProviderId">
        <SelectControlled name="backendProviderId" options={backendProviderDict.selectOptions} />
      </FormInput>

      <FormInput
        label="Proxy:"
        name="connectionProxy"
        action={(
          <MessageActionButton
            icon={PackagePlus}
            onClick={() => {
              openConnectionProxyModal({ connectionProxy: ConnectionProxy.createEmpty() }).result.then(preset => {
                connectionProxiesManager.add(preset);
              });
            }}
          />
        )}
      >
        <SelectControlled
          name="connectionProxy"
          isClearable
          options={connectionProxiesManager.selectOptions}
        />
        {connectionProxy && (
          <ExtraInfoRow
            label={connectionProxy.label}
            onClick={() => openConnectionProxyModal({ connectionProxy: connectionProxiesManager.proxiesDict[connectionProxy.value] })}
          />
        )}
      </FormInput>

      {backendProvider && (
        <FormInput
          label="Model:"
          name="model"
          action={(
            <MessageActionButton
              icon={RefreshCw}
              onClick={() => models.reload()}
            />
          )}
        >
          <CreatableSelectControlled
            key={`${connectionProxy?.value}-${backendProviderId?.value}`}
            name="model"
            options={models.data}
            isLoading={models.loading}
          />
          {models.error && <div className={style.error}>{models.error}</div>}
        </FormInput>
      )}

      <hr className={style.separator} />

      {fields.map(({ name, label, type }) => (
        <React.Fragment key={name}>
          {type === "checkbox" && <CheckboxControlled name={name} label={label} />}
          {type === "input" && (
            <FormInput label={`${label}:`} name={name}>
              <InputControlled name={name} />
            </FormInput>
          )}
        </React.Fragment>
      ))}
      <FormInput label={`systemPrompt:`} name="systemPrompt">
        <TextareaControlled name="systemPrompt" autoHeight />
      </FormInput>

      {backendProvider?.documentationLink && (
        <>
          <hr className={style.separator} />
          <a href={backendProvider.documentationLink} target="_blank">
            Full documentation{" "}
            <ExternalLink size={16} />
          </a>
        </>
      )}
    </>
  );
};

export default observer(PresetEditForm) as typeof PresetEditForm;
