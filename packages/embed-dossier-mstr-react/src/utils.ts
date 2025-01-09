const getInfoFromUrl = (url: string) => {
  const urlParts = url.split("/").filter((part) => part !== "");
  const serverUrl = urlParts[0] + "//" + urlParts[1];
  const serverUrlLibrary = urlParts[0] + "//" + urlParts[1] + "/" + urlParts[2];
  const libraryName = urlParts[2];
  const projectId = urlParts[3];
  const dossierId = urlParts[4];
  return { serverUrl, serverUrlLibrary, libraryName, projectId, dossierId };
};

export { getInfoFromUrl };
