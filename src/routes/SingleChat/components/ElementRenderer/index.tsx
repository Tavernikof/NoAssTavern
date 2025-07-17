import { RenderElementProps } from "slate-react";
import ElementRenderer from "./ElementRenderer.tsx";

export const renderElement = (props: RenderElementProps) => <ElementRenderer {...props} />;