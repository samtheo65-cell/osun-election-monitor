"use client";

import { useEffect, useState } from "react";

import { AdministrativeSelector } from "./administrative-selector";
import { ElectoralSummary } from "./electoral-summary";

import {
  GeographySelection,
  ElectoralGeography,
  GeographyOption,
} from "@/lib/types";

import { getElectoralGeography } from "@/lib/repositories/electoral";

interface GeographyWorkspaceProps {
  states: GeographyOption[];
}

export function GeographyWorkspace({
  states,
}: GeographyWorkspaceProps) {
  const [selection, setSelection] = useState<GeographySelection>({
    stateId: "",
    lgaId: "",
    wardId: "",
    pollingUnitId: "",
  });

  const [electoral, setElectoral] =
    useState<ElectoralGeography>({
      senatorialDistrict: "",
      federalConstituency: "",
      stateConstituency: "",
    });

  useEffect(() => {
    if (!selection.lgaId || !selection.wardId) {
      setElectoral({
        senatorialDistrict: "",
        federalConstituency: "",
        stateConstituency: "",
      });

      return;
    }

    const loadElectoral = async () => {
      try {
        const data = await getElectoralGeography(
          selection.lgaId,
          selection.wardId
        );

        setElectoral(data);
      } catch (error) {
        console.error(
          "Failed to load electoral geography",
          error
        );
      }
    };

    loadElectoral();
  }, [selection.lgaId, selection.wardId]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <AdministrativeSelector
        states={states}
        selection={selection}
        onSelectionChange={setSelection}
      />

      <ElectoralSummary
        electoral={electoral}
      />
    </div>
  );
}