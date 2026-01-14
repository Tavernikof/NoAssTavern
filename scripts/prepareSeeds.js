window.serializeStore = (store) => {
  let str = JSON.stringify(store.fullList.map(item => ({
    ...item.serialize(),
    id: "__REPLACE_ID__",
  })));
  str = str.replace(/"id":"__REPLACE_ID__"/g, `"id":uuid()`);
  str = str.replace(/"createdAt":".*?"/g, `"createdAt":new Date()`);
  str = str.replace(/"role":"user"/g, `"role":ChatMessageRole.USER`);
  str = str.replace(/"role":"assistant"/g, `"role":ChatMessageRole.ASSISTANT`);
  str = str.replace(/"role":"system"/g, `"role":ChatMessageRole.SYSTEM`);
  str = str.replace(/"backendProviderId":"claude"/g, `"backendProviderId":BackendProvider.CLAUDE`);
  str = str.replace(/"backendProviderId":"gemini"/g, `"backendProviderId":BackendProvider.GEMINI`);
  str = str.replace(/"backendProviderId":"openai"/g, `"backendProviderId":BackendProvider.OPENAI`);
  return str;
};
