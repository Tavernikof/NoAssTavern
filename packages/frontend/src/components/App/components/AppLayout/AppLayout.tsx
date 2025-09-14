import * as React from "react";
import style from "./AppLayout.module.scss";
import Container from "src/components/Container";
import Sidebar from "../Sidebar";

type Props = React.PropsWithChildren<{}>;

const AppLayout: React.FC<Props> = (props) => {
  const { children } = props;

  return (
    <div className={style.container}>
      <Sidebar />
      <Container>
        {children}
      </Container>
    </div>
  );
};

export default React.memo(AppLayout) as typeof AppLayout;
