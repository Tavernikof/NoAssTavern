export default ( str: string, def?: any ) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return def;
  }
};
