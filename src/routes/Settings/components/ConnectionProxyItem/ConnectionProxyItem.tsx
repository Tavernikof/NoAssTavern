import * as React from "react";
import style from "./ConnectionProxyItem.module.scss";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { openConnectionProxyModal } from "src/components/ConnectionProxyModal";
import { observer } from "mobx-react-lite";
import Button from "src/components/Button";
import { Trash } from "lucide-react";
import Tooltip from "../../../../components/Tooltip";

type Props = {
  connectionProxyId: string
};

const ConnectionProxyItem: React.FC<Props> = (props) => {
  const { connectionProxyId } = props;
  const { proxiesDict, remove } = connectionProxiesManager;
  const connectionProxy = proxiesDict[connectionProxyId];

  return (
    <div className={style.container}>
      <button className={style.buttonOverlay} onClick={() => openConnectionProxyModal({ connectionProxy })} />
      <div className={style.main}>
        {connectionProxy.name
          ? (
            <>
              <div className={style.name}>{connectionProxy.name}</div>
              <div className={style.baseUrl}>{connectionProxy.baseUrl || "-"}</div>
            </>
          ) : (
            <div className={style.name}>{connectionProxy.baseUrl || "-"}</div>
          )
        }
      </div>
      <div className={style.aside}>
        <Tooltip
          content={() => (
            <div className={style.tooltip}>
              <div>Delete connection proxy?</div>
              <Button size="small" onClick={() => remove(connectionProxy)}>Delete</Button>
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

export default observer(ConnectionProxyItem) as typeof ConnectionProxyItem;
