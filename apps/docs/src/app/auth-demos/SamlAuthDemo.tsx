import { DashboardEmbedWithAuth } from "embed-dossier-mstr-react";

export function SamlAuthDemo({ dossierUrl }: { dossierUrl: string }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <DashboardEmbedWithAuth
        dossierUrl={dossierUrl}
        loginMode="saml"
        className="w-full h-[600px]"
        config={{
          enableResponsive: true,
          enableCustomAuthentication: true,
        }}
        loadingComponent={
          <div className="flex items-center justify-center h-[600px] bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
              <p className="mt-4 text-gray-600">
                Redirecting to SAML provider...
              </p>
            </div>
          </div>
        }
        errorComponent={(error) => (
          <div className="flex items-center justify-center h-[600px] bg-gray-50">
            <div className="text-center text-red-500 p-4 max-w-md">
              <h3 className="text-lg font-semibold mb-2">
                SAML Authentication Error
              </h3>
              <p>{error}</p>
              <p className="text-sm mt-2 text-gray-600">
                Make sure pop-ups are enabled for SAML authentication.
              </p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
