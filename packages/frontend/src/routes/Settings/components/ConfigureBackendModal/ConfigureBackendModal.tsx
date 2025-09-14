import * as React from "react";
import { useModalContext } from "src/components/Modals";
import style from "./ConfigureBackendModal.module.scss";
import Form, { FormInput, InputControlled } from "src/components/Form";
import Button from "src/components/Button";
import { backendManager } from "src/store/BackendManager.ts";
import { AxiosError } from "axios";
import { Upload, Download } from "lucide-react";
import { getAxiosError } from "src/helpers/getAxiosError.ts";
import ErrorMessage from "src/components/ErrorMessage/ErrorMessage.tsx";
import { backupManager } from "src/store/BackupManager.ts";

const BACKEND_URL = env.BACKEND_URL;

type Props = Record<string, never>;

const ConfigureBackendModal: React.FC<Props> = () => {
  const { resolve } = useModalContext();

  const [backendUrl, setBackendUrl] = React.useState("");
  const [backendInfo, setBackendInfo] = React.useState<{ valid: boolean, error?: string } | null>(null);
  const [importError, setImportError] = React.useState<string>();
  React.useEffect(() => {
    updateBackendUrl(BACKEND_URL);
  }, []);

  const updateBackendUrl = (backendUrl: string) => {
    setBackendUrl(backendUrl);
    setBackendInfo(null);
    backendManager.getBaseInfo(backendUrl).then(
      () => {
        setBackendInfo({ valid: true });
      },
      async (error: AxiosError) => {
        setBackendInfo({ valid: false, error: await getAxiosError(error) });
      },
    );
  };

  const enableBackend = (withImport?: boolean) => {
    setImportError("");
    backupManager.enableBackendStorage(backendUrl, withImport).then(
      () => {
        resolve();
      },
      (e) => {
        setImportError(e.toString() ?? "Unknown error");
      },
    );
  };

  return (
    <>
      <Form
        initialValue={{ baseUrl: BACKEND_URL }}
        onSubmit={(data) => {
          updateBackendUrl(data.baseUrl);
          // setBaseUrl(data.baseUrl);
        }}
      >
        <FormInput label="Backend url:">
          <div className={style.row}>
            <InputControlled name="baseUrl" />
            <Button>Check url</Button>
          </div>
        </FormInput>
      </Form>
      {backendInfo && (
        <div className={style.info}>
          {backendInfo.valid
            ? (
              <div>
                <div className={style.success}>Connection established</div>
                <div className={style.actions}>
                  <Button iconBefore={Upload} onClick={() => enableBackend(true)}>
                    Move local data and synchronize with backend
                  </Button>
                  <Button iconBefore={Download} onClick={() => enableBackend()}>
                    Erase local data and synchronize with backend
                  </Button>
                </div>
                {importError && <ErrorMessage>Import error: {importError}</ErrorMessage>}
              </div>
            )
            : <ErrorMessage>Connection error: {backendInfo.error}</ErrorMessage>
          }

        </div>
      )}
      <div>

      </div>
    </>
  );
};

export default React.memo(ConfigureBackendModal) as typeof ConfigureBackendModal;
