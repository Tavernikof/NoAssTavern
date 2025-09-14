import * as React from "react";
import { requestStorage, RequestStorageItem } from "src/storages/RequestStorage.ts";
import style from "./RequestModal.module.scss";
import Button from "src/components/Button";
import { backendProviderDict } from "src/enums/BackendProvider.ts";

type Props = {
  requestId: string;
};

const RequestModal: React.FC<Props> = (props) => {
  const { requestId } = props;
  const [request, setRequest] = React.useState<RequestStorageItem>();

  React.useEffect(() => {
    requestStorage.getItem(requestId).then(setRequest);
  }, []);

  if (!request) return null;
  const { id, createdAt, provider, response: { inputTokens, outputTokens, url, request: requestParams } } = request;

  const backendProvider = backendProviderDict.getById(provider);
  const messages = backendProvider.class.getRequestMessages(requestParams);

  return (
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

      <pre className={style.info}>{JSON.stringify(requestParams, null, 2)}</pre>
    </div>
  );
};

export default React.memo(RequestModal) as typeof RequestModal;
