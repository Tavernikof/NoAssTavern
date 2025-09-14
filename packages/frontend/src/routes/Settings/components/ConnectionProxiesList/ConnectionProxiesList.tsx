import * as React from "react";
import { observer } from "mobx-react-lite";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import style from "./ConnectionProxiesList.module.scss";
import ConnectionProxyItem from "src/routes/Settings/components/ConnectionProxyItem";

type Props = Record<string, never>;

const ConnectionProxiesList: React.FC<Props> = () => {
  return (
    <div className={style.container}>
      {connectionProxiesManager.list.map(connectionProxyId => (
        <ConnectionProxyItem
          key={connectionProxyId}
          connectionProxyId={connectionProxyId}
        />
      ))}
    </div>
  );
};

export default observer(ConnectionProxiesList) as typeof ConnectionProxiesList;
