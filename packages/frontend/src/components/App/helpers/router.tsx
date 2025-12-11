import * as React from "react";
import { createHashRouter, RouteObject } from "react-router";
import { RouteItem, routes } from "src/routes.tsx";
import arrayToIdIndex from "src/helpers/arrayToIdIndex.ts";
import RootErrorBoundary from "src/components/App/components/RootErrorBoundary";
import RouteWrapper from "src/components/App/components/RouteWrapper";
import Root from "src/components/App/components/Root";

export const finalRoutes: RouteObject[] = routes.map(route => ({
  id: route.name,
  path: route.path,
  element: <RouteWrapper route={route} />,
  errorElement: <RootErrorBoundary />,
}));

export const router = createHashRouter([{
  path: "/",
  element: <Root />,
  errorElement: <RootErrorBoundary />,
  children: finalRoutes,
}], {
  basename: "/",
  future: { v7_startTransition: true },
});

export const routesDict = arrayToIdIndex(routes, "name");
export type RouteName = keyof typeof routesDict;

const componentsCache = new Map<RouteItem["component"], React.LazyExoticComponent<React.FC>>();
const layoutsCache = new Map<RouteItem["layout"], React.LazyExoticComponent<React.FC<React.PropsWithChildren>>>();

export const getCachedComponent = (route: RouteItem) => {
  if (!componentsCache.get(route.component)) {
    componentsCache.set(route.component, React.lazy(route.component));
  }
  return componentsCache.get(route.component);
};

export const getCachedLayout = (route: RouteItem) => {
  if (!layoutsCache.get(route.layout)) {
    layoutsCache.set(route.layout, React.lazy(route.layout));
  }
  return layoutsCache.get(route.layout);
};
