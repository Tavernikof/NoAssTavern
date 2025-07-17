import * as React from "react";
import { RouteItem } from "src/routes.tsx";
import { getCachedComponent, getCachedLayout } from "src/components/App/helpers/router.tsx";

type Props = {
  route: RouteItem
};

const RouteWrapper: React.FC<Props> = (props) => {
  const { route } = props;

  const Component = getCachedComponent(route);
  const Layout = getCachedLayout(route);

  if (!Layout) {
    return null;
  }

  return (
    <React.Suspense fallback={<div />}>
      <Layout>
        <React.Suspense fallback={<div />}>
          <Component />
        </React.Suspense>
      </Layout>
    </React.Suspense>
  );
};

export default React.memo(RouteWrapper);
