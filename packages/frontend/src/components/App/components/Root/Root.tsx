import * as React from "react";
import { Outlet, ScrollRestoration } from "react-router";
import { ModalContainer } from "src/components/Modals";
import DisconnectedNotification from "../../../BackendNotification";

type Props = Record<string, never>;

const Root: React.FC<Props> = () => {
  return (
    <>
      <ScrollRestoration />
      <DisconnectedNotification />
      <Outlet />
      <ModalContainer />
    </>
  );
};

export default React.memo(Root);
