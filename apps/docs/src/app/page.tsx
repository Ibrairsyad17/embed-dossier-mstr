"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">
        MicroStrategy Dashboard Authentication Demos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/standard"
          className="p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">
            Standard Authentication
          </h2>
          <p className="text-gray-600">
            Username and password authentication demo
          </p>
        </Link>

        <Link
          href="/saml"
          className="p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">SAML Authentication</h2>
          <p className="text-gray-600">SAML-based authentication demo</p>
        </Link>

        <Link
          href="/guest"
          className="p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Guest Authentication</h2>
          <p className="text-gray-600">Guest access authentication demo</p>
        </Link>

        <Link
          href="/oidc"
          className="p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">OIDC Authentication</h2>
          <p className="text-gray-600">OpenID Connect authentication demo</p>
        </Link>
      </div>
    </div>
  );
}
