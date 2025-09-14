import * as React from "react";
import style from "./CharacterAvatar.module.scss";
import clsx from "clsx";
import { CSSProperties } from "react";
import { stringToColor } from "src/helpers/stringToColor.ts";
import { observer } from "mobx-react-lite";
import { imagesManager } from "src/store/ImagesManager.ts";

type Props = {
  className?: string;
  name?: string;
  imageId?: string | null;
  size?: number;
};

const CharacterAvatar: React.FC<Props> = (props) => {
  const { className, name, imageId, size = 80 } = props;

  const src = imageId ? imagesManager.cache[imageId] : null;
  const sizeStyle = React.useMemo(() => {
    return {
      "--avatar-color": stringToColor(name),
      "--avatar-size": size + "px",
    } as CSSProperties;
  }, [size, name]);

  React.useEffect(() => {
    if (imageId) imagesManager.getItem(imageId);
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
