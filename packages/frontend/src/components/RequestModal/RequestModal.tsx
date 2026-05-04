import * as React from "react";
import { requestStorage, RequestStorageItem } from "src/storages/RequestStorage.ts";
import style from "./RequestModal.module.scss";
import Button from "src/components/Button";
import { backendProviderDict } from "src/enums/BackendProvider.ts";
import Tabs, { TabItem } from "src/components/Tabs";
import PromptForm from "src/components/PromptEditorModal/components/PromptForm/PromptForm.tsx";
import PromptCodeBlocksCounter
  from "src/components/PromptEditorModal/components/PromptCodeBlocksCounter/PromptCodeBlocksCounter.tsx";
import PromptCodeBlocks from "src/components/PromptEditorModal/components/PromptCodeBlocks/PromptCodeBlocks.tsx";

type Props = {
  requestId: string;
};

const RequestModal: React.FC<Props> = (props) => {
  const { requestId } = props;
  const [request, setRequest] = React.useState<RequestStorageItem>();
  const [error, setError] = React.useState<boolean>(false);

  React.useEffect(() => {
    requestStorage.getItem(requestId).then(setRequest, () => setError(true));
  }, []);

  const items = React.useMemo<TabItem[]>(() => {
    if (!request) return [];
    const { id, createdAt, provider, response: { inputTokens, outputTokens, url, request: requestParams } } = request;
    const backendProvider = backendProviderDict.getById(provider);
    const messages = backendProvider.class.getRequestMessages(requestParams);

    return ([
      {
        key: "content",
        title: "Content",
        content: () => (
          <div className={style.container}>
            <Button onClick={() => console.log(request)}>Dump in console</Button>
            <div><b>Id:</b> {id}</div>
            <div><b>Time:</b> {createdAt.toLocaleString()}</div>
            <div><b>Provider:</b> {provider}</div>
            <div><b>Tokens count:</b>{inputTokens} / {outputTokens}</div>
            <div>{url}</div>

            {messages.map((message, i) => (
              <div key={i} className={style.block}>
                <div className={style.head}>{message.role}</div>
                <div className={style.content}>{message.content}</div>
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "raw",
        title: "Raw request",
        content: () => <pre className={style.info}>{JSON.stringify(requestParams, null, 2)}</pre>,
      },
    ]);
  }, [request]);

  if (error) return <div>Can not find request info</div>;
  if (!request) return null;

  return (
    <Tabs
      items={items}
    />
  );
};

export default React.memo(RequestModal) as typeof RequestModal;
