import * as React from "react";
import { Character } from "src/store/Character.ts";
import style from "./SegmentedCharacterAvatar.module.scss";
import { stringToColor } from "src/helpers/stringToColor.ts";

const getClipPath = (index: number, total: number) => {
  if (total <= 1) {
    return "none";
  } else if (total === 2) {
    return index === 0 ? "polygon(0 0, 50% 0, 50% 100%, 0 100%)" : "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)";
  } else {
    // A clip-path polygon is defined by a set of vertices.
    // We will create a pie slice for each segment.
    // The container's border-radius will make the outer edge circular.
    const center = "50% 50%";

    // The angle for each segment in degrees.
    const anglePerSegment = 360 / total;

    // We start from the top (-90 degrees) to make the layout intuitive.
    const startAngle = index * anglePerSegment - 90;
    const endAngle = (index + 1) * anglePerSegment - 90;

    // We calculate points on a circle far away from the center.
    // Using a large radius (e.g., 100%) ensures the lines of the polygon
    // extend beyond the container, creating a clean slice.
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const startX = 50 + Math.cos(startRad) * 100;
    const startY = 50 + Math.sin(startRad) * 100;
    const endX = 50 + Math.cos(endRad) * 100;
    const endY = 50 + Math.sin(endRad) * 100;

    // For slices larger than 180 degrees, we need to add an extra point
    // to ensure the clip-path covers the correct area.
    if (anglePerSegment > 180) {
      const midAngle = startAngle + 180;
      const midRad = (midAngle * Math.PI) / 180;
      const midX = 50 + Math.cos(midRad) * 100;
      const midY = 50 + Math.sin(midRad) * 100;
      return `polygon(${center}, ${startX}% ${startY}%, ${midX}% ${midY}%, ${endX}% ${endY}%)`;
    }

    return `polygon(${center}, ${startX}% ${startY}%, ${endX}% ${endY}%)`;
  }
};


type Props = {
  characters: Character[];
  size?: number;
};

const SegmentedCharacterAvatar: React.FC<Props> = (props) => {
  const { characters, size = 40 } = props;

  const images = React.useMemo(() => {
    const items = characters.slice(0, 10);

    return items.map((c, index) => {
      const style = {
        clipPath: getClipPath(index, items.length),
        "--avatar-color": stringToColor(c.name),
      } as React.CSSProperties;

      if (c.imageId) {
        style.backgroundImage = `url(${URL.createObjectURL(c.image.image)})`;
      }

      return style;
    });
  }, [characters]);

  return (
    <div style={{ "--avatar-size": size } as React.CSSProperties} className={style.container} role="img">
      {images.map((cssStyle, index) => {
        return <div key={index} className={style.image} style={cssStyle} />;
      })}
    </div>
  );
};

export default React.memo(SegmentedCharacterAvatar) as typeof SegmentedCharacterAvatar;
