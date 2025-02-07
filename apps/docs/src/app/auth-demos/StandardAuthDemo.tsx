import { DashboardEmbedWithAuth } from "embed-dossier-mstr-react";
import { useState } from "react";

const dashboardConfig = {
  enableResponsive: true,
  enableCustomAuthentication: true,
  navigationBar: {
    enabled: true,
    gotoLibrary: false,
    title: true,
    toc: true,
  },
  filterFeature: {
    enabled: true,
    edit: true,
    summary: true,
  },
};

export function StandardAuthDemo({ dossierUrl }: { dossierUrl: string }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Enter Credentials</h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              placeholder="Enter your username"
              className="block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              placeholder="Enter your password"
              className="block w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <DashboardEmbedWithAuth
          dossierUrl={dossierUrl}
          loginMode="standard"
          username={credentials.username}
          password={credentials.password}
          className="w-full h-[600px]"
          config={dashboardConfig}
          loadingComponent={
            <div className="flex items-center justify-center h-[600px] bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
                <p className="mt-4 text-gray-600">Authenticating...</p>
              </div>
            </div>
          }
          errorComponent={(error) => (
            <div className="flex items-center justify-center h-[600px] bg-gray-50">
              <div className="text-center text-red-500 p-4 max-w-md">
                <h3 className="text-lg font-semibold mb-2">
                  Authentication Error
                </h3>
                <p>{error}</p>
                <p className="text-sm mt-2 text-gray-600">
                  Please check your credentials and try again.
                </p>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
