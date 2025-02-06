const getInfoFromUrl = (url: string) => {
  const urlParts = url.split("/").filter((part) => part !== "");
  const serverUrl = urlParts[0] + "//" + urlParts[1];
  const serverUrlLibrary = urlParts[0] + "//" + urlParts[1] + "/" + urlParts[2];
  const libraryName = urlParts[2];
  const projectId = urlParts[3];
  const dossierId = urlParts[4];
  return { serverUrl, serverUrlLibrary, libraryName, projectId, dossierId };
};

/**
 * Authentication Functions for MicroStrategy Dossier Embedding according to the MicroStrategy Embedding SDK
 */

const getAuthToken = async ({
  serverUrlLibrary,
}: {
  serverUrlLibrary: string;
}) => {
  const options = {
    method: "GET",
    credentials: "include" as RequestCredentials,
    mode: "cors" as RequestMode,
    headers: { "content-type": "application/json" },
  };
  let mstrToken = "";

  try {
    const response = await fetch(`${serverUrlLibrary}/api/auth/token`, options);
    if (response.ok) {
      const data = await response.json();
      mstrToken = data.token;
      return mstrToken;
    }
    return response.json().then((json) => console.log(json));
  } catch (error) {
    console.error(error);
  }
};

const createAuthToken = async ({
  serverUrlLibrary,
  username,
  password,
  loginMode,
}: {
  serverUrlLibrary: string;
  username: string;
  password: string;
  loginMode: "guest" | "standard" | "saml" | "oidc" | "ldap";
}) => {
  const standardBody = {
    loginMode: 1,
    username,
    password,
  };

  const guestBody = {
    loginMode: 8,
  };

  const ldapBody = {
    loginMode: 16,
    username,
    password,
  };

  const options = {
    method: "POST",
    credentials: "include" as RequestCredentials,
    mode: "cors" as RequestMode,
    headers: { "content-type": "application/json" },
    body:
      loginMode === "standard"
        ? JSON.stringify(standardBody)
        : loginMode === "guest"
          ? JSON.stringify(guestBody)
          : JSON.stringify(ldapBody),
  };

  try {
    const response = await fetch(`${serverUrlLibrary}/api/auth/login`, options);
    if (response.ok) {
      return response.headers.get("x-mstr-authtoken");
    } else {
      return await response.json().then((json) => console.log(json));
    }
  } catch (error) {
    console.error(error);
  }
};

const login = async ({
  serverUrlLibrary,
  username,
  password,
  loginMode,
}: {
  serverUrlLibrary: string;
  username: string;
  password: string;
  loginMode: "guest" | "standard" | "saml" | "oidc" | "ldap";
}) => {
  const authToken = await getAuthToken({ serverUrlLibrary }).catch((error) => {
    console.error(error);
  });

  if (authToken) {
    console.log("An existing login session has been found, logging in...");
    return authToken;
  }

  return await createAuthToken({
    serverUrlLibrary,
    username,
    password,
    loginMode,
  });
};

const getServerUrl = (url: string) => {
  return url.split("/app/")[0];
};

export { getInfoFromUrl, getAuthToken, createAuthToken, getServerUrl };
