"use client";

import { SamlAuthDemo } from "./auth-demos/SamlAuthDemo";

const DEMO_DOSSIER_URL =
  "https://demo.microstrategy.com/MicroStrategyLibrary/app/38328E048D427571975C388F7C402AD8/FF81504CEA4C3C51198F2CB1A9062FEE/W396501--K396454";

export default function Page() {
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">SAML Authentication Demo</h1>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          Note: Make sure pop-ups are enabled in your browser for SAML
          authentication to work properly. You will be redirected to your SAML
          identity provider to complete the authentication.
        </p>
      </div>
      <SamlAuthDemo dossierUrl={DEMO_DOSSIER_URL} />
    </div>
  );
}
