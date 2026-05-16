import * as React from "react";
import Button from "src/components/Button";
import { Search, Trash } from "lucide-react";
import { observer } from "mobx-react-lite";
import { storageCleanupController } from "src/store/StorageCleanupController.ts";
import formatBytes from "src/components/MediaGallery/helpers/formatBytes.ts";
import style from "./StorageCleanup.module.scss";

type Props = Record<string, never>;

const StorageCleanup: React.FC<Props> = () => {
  const { status, summary, bytesFreed, error } = storageCleanupController;

  const scanning = status === "scanning";
  const deleting = status === "deleting";
  const totalCount = summary ? summary.filesCount + summary.imagesCount : 0;
  const totalSize = summary ? summary.filesSize + summary.imagesSize : 0;

  return (
    <div className={style.container}>
      <span>
        Find files and images older than 24h that aren&apos;t attached to any character, chat or flow.
      </span>

      <div className={style.actions}>
        <Button
          iconBefore={Search}
          onClick={() => storageCleanupController.scan()}
          disabled={scanning || deleting}
        >
          {scanning ? "Scanning..." : "Scan"}
        </Button>

        {status === "scanned" && totalCount > 0 && (
          <Button
            iconBefore={Trash}
            onClick={() => storageCleanupController.delete()}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : `Delete (${formatBytes(totalSize)})`}
          </Button>
        )}
      </div>

      {status === "scanned" && (
        <span className={style.summary}>
          {totalCount > 0
            ? `Found ${summary!.filesCount} files (${formatBytes(summary!.filesSize)}) and ${summary!.imagesCount} images (${formatBytes(summary!.imagesSize)}).`
            : "Nothing to clean up."}
        </span>
      )}

      {status === "done" && (
        <span className={style.summary}>
          Done. Freed {formatBytes(bytesFreed || 0)}.
        </span>
      )}

      {status === "error" && error && (
        <span className={style.error}>Error: {error}</span>
      )}
    </div>
  );
};

export default observer(StorageCleanup) as typeof StorageCleanup;
