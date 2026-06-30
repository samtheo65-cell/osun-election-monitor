"use client";

import { useEffect, useState } from "react";

import { AdministrativeSelector } from "./administrative-selector";
import { ElectoralSummary } from "./electoral-summary";
import { PollingUnitProfile } from "@/components/polling-unit/polling-unit-profile";

import {
  GeographySelection,
  ElectoralGeography,
  GeographyOption,
} from "@/lib/types";

import { getElectoralGeography } from "@/lib/repositories/electoral";

import {
  getPollingUnitProfile,
  type PollingUnitProfileData,
} from "@/lib/repositories/polling-unit-profile";

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

  const [profile, setProfile] =
    useState<PollingUnitProfileData | null>(null);

  // Electoral Summary
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

  // Polling Unit Profile
  useEffect(() => {
    if (!selection.pollingUnitId) {
      setProfile(null);
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await getPollingUnitProfile(
          selection.pollingUnitId
        );

        setProfile(data);
      } catch (error) {
        console.error(
          "Failed to load polling unit profile",
          error
        );
        setProfile(null);
      }
    };

    loadProfile();
  }, [selection.pollingUnitId]);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <AdministrativeSelector
          states={states}
          selection={selection}
          onSelectionChange={setSelection}
        />

        <ElectoralSummary electoral={electoral} />
      </div>

      <PollingUnitProfile profile={profile} />
    </div>
  );
}