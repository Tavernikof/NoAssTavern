import * as React from "react";
import Button from "src/components/Button";
import { globalSettings } from "src/store/GlobalSettings.ts";
import { Volume2, Trash } from "lucide-react";
import ImportButton from "src/components/ImportButton/ImportButton.tsx";
import style from "./NotificationSettings.module.scss";
import { observer } from "mobx-react-lite";

type Props = Record<string, never>;

const NotificationSettings: React.FC<Props> = () => {
  const { notificationFile } = globalSettings;
  return (
    <div className={style.container}>
      {notificationFile
        ? (<Button
            onClick={() => globalSettings.updateNotificationSound(null)}
            iconBefore={Trash}
          >
            Remove custom sound
          </Button>
        ) : (
          <ImportButton
            onUpload={(file) => globalSettings.updateNotificationSound(file)}
            text="Upload custom sound"
          />
        )}

      <Button
        onClick={() => globalSettings.playNotificationAudio()}
        iconBefore={Volume2}
      >
        Test
      </Button>
    </div>
  );
};

export default observer(NotificationSettings) as typeof NotificationSettings;
