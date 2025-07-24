import parseJSON from "./parseJSON.ts";

export const decodeBase64 = (str: string) => {
  const value =  decodeURIComponent(atob(str).split("").map(function (c) {
    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(""));
  return parseJSON(value, null);
};
