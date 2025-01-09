"use client";

import { BotConsumptionPage } from "embed-dossier-mstr-react";

export default function Page() {
  const config = {
    customApplicationId: "C2B2023642F6753A2EF159A75E0CFF29",
    customUi: {
      botConsumption: {},
    },
  };
  return (
    <>
      <h1>Example for Embed Dossier MSTR React</h1>
      <BotConsumptionPage
        serverUrlLibrary="https://demo.microstrategy.com/MicroStrategyLibrary"
        projectId="38328E048D427571975C388F7C402AD8"
        objectId="A81721DEC24012C1C40522B8A8EC36DE"
        config={config}
      />
    </>
  );
}
