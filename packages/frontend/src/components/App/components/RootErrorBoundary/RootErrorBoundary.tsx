import * as React from "react";
import { useRouteError } from "react-router";

const RootErrorBoundary: React.FC = () => {
  const error = useRouteError();
  console.error(error);
  if (!error) return null;
  return <div>{error.data ?? "Error"}</div>;
};

export default React.memo(RootErrorBoundary);
