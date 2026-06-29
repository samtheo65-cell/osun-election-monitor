"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLgasByState } from "@/lib/repositories/lgas";
import { getWardsByLga } from "@/lib/repositories/wards";
import { getPollingUnitsByWard } from "@/lib/repositories/polling-units";
import type { GeographySelection, GeographyOption } from "@/lib/types";

interface AdministrativeSelectorProps {
  states: GeographyOption[];
  selection: GeographySelection;
  onSelectionChange: (selection: GeographySelection) => void;
}

export function AdministrativeSelector({
  states,
  selection,
  onSelectionChange,
}: AdministrativeSelectorProps) {
  const [lgas, setLgas] = useState<GeographyOption[]>([]);
  const [wards, setWards] = useState<GeographyOption[]>([]);
  const [pollingUnits, setPollingUnits] = useState<GeographyOption[]>([]);

  const [loadingLgas, setLoadingLgas] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingPollingUnits, setLoadingPollingUnits] = useState(false);

  // ─── 1. LOAD LGAs ─────────────────────────────────────
  useEffect(() => {
    if (!selection.stateId) {
      setLgas([]);
      return;
    }

    const fetchLgas = async () => {
      setLoadingLgas(true);
      try {
        const data = await getLgasByState(selection.stateId);
        setLgas(data);
      } catch (error) {
        console.error("Failed to fetch LGAs:", error);
        setLgas([]);
      } finally {
        setLoadingLgas(false);
      }
    };

    fetchLgas();
  }, [selection.stateId]);

  // ─── 2. LOAD WARDS ────────────────────────────────────
  useEffect(() => {
    if (!selection.lgaId) {
      setWards([]);
      return;
    }

    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const data = await getWardsByLga(selection.lgaId);
        setWards(data);
      } catch (error) {
        console.error("Failed to fetch Wards:", error);
        setWards([]);
      } finally {
        setLoadingWards(false);
      }
    };

    fetchWards();
  }, [selection.lgaId]);

  // ─── 3. LOAD POLLING UNITS ────────────────────────────
  useEffect(() => {
    if (!selection.wardId) {
      setPollingUnits([]);
      return;
    }

    const fetchPollingUnits = async () => {
      setLoadingPollingUnits(true);
      try {
        const data = await getPollingUnitsByWard(selection.wardId);
        setPollingUnits(data);
      } catch (error) {
        console.error("Failed to fetch Polling Units:", error);
        setPollingUnits([]);
      } finally {
        setLoadingPollingUnits(false);
      }
    };

    fetchPollingUnits();
  }, [selection.wardId]);

  // ─── HANDLERS ─────────────────────────────────────────

  const handleStateChange = (stateId: string) => {
    onSelectionChange({ stateId, lgaId: "", wardId: "", pollingUnitId: "" });
  };

  const handleLgaChange = (lgaId: string) => {
    onSelectionChange({ ...selection, lgaId, wardId: "", pollingUnitId: "" });
  };

  const handleWardChange = (wardId: string) => {
    onSelectionChange({ ...selection, wardId, pollingUnitId: "" });
  };

  const handlePollingUnitChange = (pollingUnitId: string) => {
    onSelectionChange({ ...selection, pollingUnitId });
  };

  // ─── UI ───────────────────────────────────────────────

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">Administrative Geography</h3>

      {/* STATE */}
      <div className="max-w-md space-y-2">
        <label htmlFor="state" className="text-sm font-medium">State</label>
        <Select value={selection.stateId} onValueChange={handleStateChange}>
          <SelectTrigger id="state">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.id} value={state.id}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* LGA */}
      <div className="max-w-md space-y-2">
        <label htmlFor="lga" className="text-sm font-medium">Local Government Area</label>
        <Select
          value={selection.lgaId}
          onValueChange={handleLgaChange}
          disabled={lgas.length === 0 || loadingLgas}
        >
          <SelectTrigger id="lga">
            <SelectValue
              placeholder={
                loadingLgas
                  ? "Loading LGAs..."
                  : selection.stateId
                  ? "Select LGA"
                  : "Select State first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {lgas.map((lga) => (
              <SelectItem key={lga.id} value={lga.id}>
                {lga.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* WARD */}
      <div className="max-w-md space-y-2">
        <label htmlFor="ward" className="text-sm font-medium">Ward</label>
        <Select
          value={selection.wardId}
          onValueChange={handleWardChange}
          disabled={wards.length === 0 || loadingWards}
        >
          <SelectTrigger id="ward">
            <SelectValue
              placeholder={
                loadingWards
                  ? "Loading Wards..."
                  : selection.lgaId
                  ? "Select Ward"
                  : "Select LGA first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {wards.map((ward) => (
              <SelectItem key={ward.id} value={ward.id}>
                {ward.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* POLLING UNIT */}
      <div className="max-w-md space-y-2">
        <label htmlFor="polling-unit" className="text-sm font-medium">Polling Unit</label>
        <Select
          value={selection.pollingUnitId}
          onValueChange={handlePollingUnitChange}
          disabled={pollingUnits.length === 0 || loadingPollingUnits}
        >
          <SelectTrigger id="polling-unit">
            <SelectValue
              placeholder={
                loadingPollingUnits
                  ? "Loading Polling Units..."
                  : selection.wardId
                  ? "Select Polling Unit"
                  : "Select Ward first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {pollingUnits.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}