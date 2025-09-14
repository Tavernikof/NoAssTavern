import * as React from "react";
import { useModalContext } from "src/components/Modals";
import Form, { FormFields, FormInput, InputControlled } from "src/components/Form";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import style from "./ConnectionProxyModal.module.scss";
import Button from "src/components/Button/Button.tsx";

type ConnectionProxyModalForm = {
  name: string,
  baseUrl: string,
  key: string,
  modelsEndpoint: string,
}

type Props = {
  connectionProxy: ConnectionProxy;
};

const ConnectionProxyModal: React.FC<Props> = (props) => {
  const { connectionProxy } = props;
  const { resolve } = useModalContext();

  return (
    <>
      <Form<ConnectionProxyModalForm>
        initialValue={React.useMemo(() => ({
          name: connectionProxy.name,
          baseUrl: connectionProxy.baseUrl,
          key: connectionProxy.key,
          modelsEndpoint: connectionProxy.modelsEndpoint,
        }), [])}
        onSubmit={React.useCallback((data) => {
          connectionProxy.update(data);
          resolve(connectionProxy);
        }, [])}
      >
        <FormFields>
          <FormInput label="Name:">
            <InputControlled name="name" />
          </FormInput>
          <FormInput label="Base url:">
            <InputControlled name="baseUrl" />
          </FormInput>
          <FormInput label="Key:">
            <InputControlled name="key" />
          </FormInput>
          <FormInput label="Custom endpoint to get list of models:">
            <InputControlled name="modelsEndpoint" />
            <div className={style.note}>
              Some proxies do not have a standard path to get a list of models. If something does not work, try /v1/models
            </div>
          </FormInput>
          <div className={style.footer}>
            <Button>Save</Button>
          </div>
        </FormFields>
      </Form>
    </>
  );
};

export default React.memo(ConnectionProxyModal) as typeof ConnectionProxyModal;
