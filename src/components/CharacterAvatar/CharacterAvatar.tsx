import * as React from "react";
import style from "./CharacterAvatar.module.scss";
import clsx from "clsx";
import { CSSProperties } from "react";
import { stringToColor } from "src/helpers/stringToColor.ts";

type Props = {
  className?: string;
  name?: string;
  image?: Blob | null;
  size?: number;
};

const CharacterAvatar: React.FC<Props> = (props) => {
  const { className, name, image, size = 80 } = props;

  const src = React.useMemo(() => image ? URL.createObjectURL(image) : null, [image]);
  const sizeStyle = React.useMemo(() => {
    return {
      "--avatar-color": stringToColor(name),
      "--avatar-size": size + "px",
    } as CSSProperties;
  }, [size, name]);

  if (!src) return <div style={sizeStyle} className={clsx(style.avatar, style.placeholder, className)} />;
  return (
    <img
      style={sizeStyle}
      className={clsx(style.avatar, className)}
      src={src}
      alt={name}
    />
  );
};

export default React.memo(CharacterAvatar) as typeof CharacterAvatar;
