import * as React from "react";
import { Outlet } from "react-router";
import { ModalContainer } from "src/components/Modals";

type Props = Record<string, never>;

const Root: React.FC<Props> = () => {
  return (
    <>
      <Outlet />
      <ModalContainer />
    </>
  );
};

export default React.memo(Root);
