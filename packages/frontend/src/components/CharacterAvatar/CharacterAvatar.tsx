import * as React from "react";
import style from "./CharacterAvatar.module.scss";
import clsx from "clsx";
import { CSSProperties } from "react";
import { stringToColor } from "src/helpers/stringToColor.ts";
import { observer } from "mobx-react-lite";
import { filesManager } from "src/store/FilesManager.ts";

type Props = {
  className?: string;
  name?: string;
  imageId?: string | null;
  size?: number;
};

const CharacterAvatar: React.FC<Props> = (props) => {
  const { className, name, imageId, size = 80 } = props;

  const src = imageId ? filesManager.cache[imageId] : null;
  const sizeStyle = React.useMemo(() => {
    return {
      "--avatar-color": stringToColor(name),
      "--avatar-size": size + "px",
    } as CSSProperties;
  }, [size, name]);

  React.useEffect(() => {
    if (imageId) filesManager.getItem(imageId);
  }, [imageId]);

  if (!src) return (
    <div
      style={sizeStyle}
      className={clsx(style.avatar, style.placeholder, className)}
      data-id={imageId}
    />
  );

  return (
    <img
      style={sizeStyle}
      className={clsx(style.avatar, className)}
      src={src}
      alt={name}
      data-id={imageId}
    />
  );
};

export default observer(CharacterAvatar) as typeof CharacterAvatar;
