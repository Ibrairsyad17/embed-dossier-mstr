"use client";

import { DashboardEmbed } from "embed-dossier-mstr-react";

export default function Page() {
  return (
    <>
      <h1>Example for Embed Dossier MSTR React</h1>
      <DashboardEmbed
        dossierUrl="https://demo.microstrategy.com/MicroStrategyLibrary/app/B7CA92F04B9FAE8D941C3E9B7E0CD754/27D332AC6D43352E0928B9A1FCAF4AB0"
        config={{
          navigationBar: {
            enabled: true,
          },
        }}
        style={{
          width: "1000px",
          height: "1200px",
        }}
      />
    </>
  );
}
