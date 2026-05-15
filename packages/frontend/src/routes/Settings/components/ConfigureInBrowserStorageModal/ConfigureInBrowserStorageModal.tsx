import * as React from "react";
// import style from "./ConfigureInBrowserStorageModal.module.scss";
import Button from "src/components/Button";
import { GlobeLock } from "lucide-react";
import { backupManager } from "src/store/BackupManager.ts";
import ErrorMessage from "src/components/ErrorMessage";
import { getAxiosError } from "src/helpers/getAxiosError.ts";
import { useModalContext } from "src/components/Modals";

type Props = Record<string, never>;

const ConfigureInBrowserStorageModal: React.FC<Props> = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { onBeforeClose } = useModalContext();

  React.useEffect(() => {
    onBeforeClose?.(() => loading ? Promise.reject() : Promise.resolve());
  }, [loading, onBeforeClose]);

  return (
    <>
      <Button
        iconBefore={GlobeLock}
        onClick={() => {
          setError(null);
          setLoading(true);
          backupManager.enableInBrowserStorage().catch(async e => {
            setError(typeof e === "string" ? e : await getAxiosError(e));
          });
        }}
        disabled={loading}
      >
        Download data from backend and switch to in browser storage
      </Button>
      <div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </div>
    </>
  );
};

export default React.memo(ConfigureInBrowserStorageModal) as typeof ConfigureInBrowserStorageModal;
