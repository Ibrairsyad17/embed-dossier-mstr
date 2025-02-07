import { useCreateDashboardWithAuth } from "embed-dossier-mstr-react";
import { useEffect, useState } from "react";
import { getInfoFromUrl } from "embed-dossier-mstr-react";

export function SamlAuthDemo({ dossierUrl }: { dossierUrl: string }) {
  const [isReady, setIsReady] = useState(false);
  const { serverUrlLibrary } = getInfoFromUrl(dossierUrl);

  const { containerRef, isAuthenticating, error, isAuthenticated } =
    useCreateDashboardWithAuth({
      serverUrlLibrary,
      config: {
        url: dossierUrl,
        enableResponsive: true,
        enableCustomAuthentication: true,
        containerHeight: "600px",
        containerWidth: "100%",
        navigationBar: {
          enabled: true,
          gotoLibrary: false,
          title: true,
          toc: true,
        },
      },
      loginMode: "saml",
    });

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady || isAuthenticating) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">
            {isAuthenticating
              ? "Redirecting to SAML provider..."
              : "Initializing..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div ref={containerRef} className="w-full h-[600px]" />
    </div>
  );
}
