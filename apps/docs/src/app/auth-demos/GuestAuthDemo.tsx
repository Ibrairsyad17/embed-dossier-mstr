import { DashboardEmbedWithAuth } from "embed-dossier-mstr-react";

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

export function GuestAuthDemo({ dossierUrl }: { dossierUrl: string }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <DashboardEmbedWithAuth
        dossierUrl={dossierUrl}
        loginMode="guest"
        className="w-full h-[600px]"
        config={dashboardConfig}
        loadingComponent={
          <div className="flex items-center justify-center h-[600px] bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
              <p className="mt-4 text-gray-600">Authenticating as Guest...</p>
            </div>
          </div>
        }
        errorComponent={(error) => (
          <div className="flex items-center justify-center h-[600px] bg-gray-50">
            <div className="text-center text-red-500 p-4 max-w-md">
              <h3 className="text-lg font-semibold mb-2">Guest Access Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
