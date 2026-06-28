"use client";

import { useState } from "react";

import { AdministrativeSelector } from "./administrative-selector";
import { ElectoralSummary } from "./electoral-summary";
import { GeographySelection } from "@/lib/types";

interface State {
  id: string;
  name: string;
  code: string;
}

interface GeographyWorkspaceProps {
  states: State[];
}

export function GeographyWorkspace({
  states,
}: GeographyWorkspaceProps) {
  const [selection, setSelection] = useState<GeographySelection>({
    state: "",
    lga: "",
    ward: "",
    pollingUnit: "",
  });

  return (
  <div className="space-y-8">
    <AdministrativeSelector
      states={states}
      selectedState={selection.state}
      onStateChange={(value) =>
        setSelection((previous) => ({
          ...previous,
          state: value,
        }))
      }
    />

    <ElectoralSummary />
  </div>
);
}