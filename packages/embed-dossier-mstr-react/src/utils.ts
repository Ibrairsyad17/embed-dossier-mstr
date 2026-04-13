/**
 * URL Parsing Utilities for MicroStrategy Embedding
 *
 * @module utils
 */

/**
 * Extracts server URL, library name, project ID, and dossier ID from a MicroStrategy dossier URL.
 *
 * @param url - Full MicroStrategy dossier URL
 *   Format: `https://{host}/{libraryName}/app/{projectId}/{dossierId}`
 * @returns Parsed URL components
 * @throws {Error} If the URL format is invalid
 *
 * @example
 * ```ts
 * const info = getInfoFromUrl(
 *   "https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA92F0/27D332AC"
 * );
 * // info.serverUrl === "https://demo.microstrategy.com"
 * // info.serverUrlLibrary === "https://demo.microstrategy.com/MicroStrategyLibrary"
 * // info.libraryName === "MicroStrategyLibrary"
 * // info.projectId === "B7CA92F0"
 * // info.dossierId === "27D332AC"
 * ```
 */
const getInfoFromUrl = (url: string) => {
  if (!url || typeof url !== "string") {
    throw new Error("A valid MicroStrategy dossier URL is required");
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      `Invalid URL format: "${url}". Expected format: https://{host}/{libraryName}/app/{projectId}/{dossierId}`
    );
  }

  // Remove leading slash and split path segments
  const pathSegments = parsed.pathname.split("/").filter(Boolean);

  // Expected: [libraryName, "app", projectId, dossierId]
  if (pathSegments.length < 4 || pathSegments[1] !== "app") {
    throw new Error(
      `Invalid MicroStrategy URL path: "${parsed.pathname}". Expected format: /{libraryName}/app/{projectId}/{dossierId}`
    );
  }

  const serverUrl = parsed.origin;
  const libraryName = pathSegments[0];
  const serverUrlLibrary = `${serverUrl}/${libraryName}`;
  const projectId = pathSegments[2];
  const dossierId = pathSegments[3];

  return { serverUrl, serverUrlLibrary, libraryName, projectId, dossierId };
};

/**
 * Extracts the MicroStrategy Library server URL from a full dossier URL.
 *
 * @param url - Full dossier URL containing `/app/` path segment
 * @returns The server URL up to and including the library name
 *
 * @example
 * ```ts
 * getServerUrl("https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA/27D3");
 * // => "https://demo.microstrategy.com/MicroStrategyLibrary"
 * ```
 */
const getServerUrl = (url: string) => {
  const appIndex = url.indexOf("/app/");
  if (appIndex === -1) {
    throw new Error(
      `URL does not contain "/app/" segment: "${url}". Expected format: https://{host}/{libraryName}/app/{projectId}/{dossierId}`
    );
  }
  return url.substring(0, appIndex);
};

/**
 * Retrieves an existing authentication token from the MicroStrategy Library server.
 *
 * Uses the session-based token endpoint. Requires an active session (cookies).
 *
 * @param serverUrlLibrary - Base URL of the MicroStrategy Library
 * @returns The authentication token string, or undefined if not authenticated
 *
 * @example
 * ```ts
 * const token = await getAuthToken({
 *   serverUrlLibrary: "https://demo.microstrategy.com/MicroStrategyLibrary"
 * });
 * ```
 */
const getAuthToken = async ({
  serverUrlLibrary,
}: {
  serverUrlLibrary: string;
}) => {
  const options: RequestInit = {
    method: "GET",
    credentials: "include",
    mode: "cors",
    headers: { "content-type": "application/json" },
  };

  try {
    const response = await fetch(`${serverUrlLibrary}/api/auth/token`, options);
    if (response.ok) {
      const data = await response.json();
      return data.token as string;
    }
    return undefined;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return undefined;
  }
};

export { getInfoFromUrl, getAuthToken, getServerUrl };
