"use client";

import { useState, useEffect } from "react";
import { getLgasByState } from "@/lib/repositories/lgas";
import { getWardsByLga } from "@/lib/repositories/wards";
import { getPollingUnitsByWard } from "@/lib/repositories/polling-units";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface State {
  id: string;
  name: string;
  code: string;
}

  interface AdministrativeSelectorProps {
  states: State[];
  selectedState: string;
  onStateChange: (value: string) => void;
}

export function AdministrativeSelector({
  states,
  selectedState,
  onStateChange,
}: AdministrativeSelectorProps) {

   const [lgas, setLgas] = useState<{ name: string }[]>([]);
  const [loadingLgas, setLoadingLgas] = useState(false);
  
const [selectedLga, setSelectedLga] = useState("");
const [wards, setWards] = useState<{ name: string }[]>([]);
const [loadingWards, setLoadingWards] = useState(false);

const [selectedWard, setSelectedWard] = useState("");
const [pollingUnits, setPollingUnits] = useState<{ name: string }[]>([]);
const [loadingPollingUnits, setLoadingPollingUnits] = useState(false);

useEffect(() => {
  if (!selectedState) {
    setLgas([]);
    return;
  }

  const fetchLgas = async () => {
    setLoadingLgas(true);

    try {
      const lgas = await getLgasByState(selectedState);
      setLgas(lgas);
    } catch (err) {
      console.error("Failed to fetch LGAs:", err);
      setLgas([]);
    } finally {
      setLoadingLgas(false);
    }
  };

  fetchLgas();
}, [selectedState]);

useEffect(() => {
  if (!selectedLga) {
    setWards([]);
    return;
  }

  const fetchWards = async () => {
    setLoadingWards(true);

    try {
      const wards = await getWardsByLga(selectedLga);
      setWards(wards);
    } catch (err) {
      console.error("Failed to fetch Wards:", err);
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  fetchWards();
}, [selectedLga]);

useEffect(() => {
  if (!selectedWard) {
    setPollingUnits([]);
    return;
  }

  const fetchPollingUnits = async () => {
    setLoadingPollingUnits(true);

    try {
      const pollingUnits = await getPollingUnitsByWard(selectedWard);
      setPollingUnits(pollingUnits);
    } catch (err) {
      console.error("Failed to fetch Polling Units:", err);
      setPollingUnits([]);
    } finally {
      setLoadingPollingUnits(false);
    }
  };

  fetchPollingUnits();
}, [selectedWard]);

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold">Administrative Geography</h3>

      {/* State Selector */}
      <div className="max-w-md space-y-2">
        <label className="text-sm font-medium">State</label>
        <Select value={selectedState} onValueChange={onStateChange}
>
          <SelectTrigger>
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.name} value={state.name}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* LGA Selector */}
      <div className="max-w-md space-y-2">
        <label className="text-sm font-medium">Local Government Area</label>
        <Select
  value={selectedLga}
  onValueChange={setSelectedLga}
  disabled={lgas.length === 0 || loadingLgas}
>
          <SelectTrigger>
            <SelectValue
              placeholder={
                loadingLgas
                  ? "Loading LGAs..."
                  : selectedState
                  ? "Select LGA"
                  : "Select State first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {lgas.map((lga) => (
              <SelectItem key={lga.name} value={lga.name}>
                {lga.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
            </div>

      {/* Ward Selector */}
      <div className="max-w-md space-y-2">
        <label
          htmlFor="ward"
          className="text-sm font-medium"
        >
          Ward
        </label>

        <Select
     value={selectedWard}
  onValueChange={setSelectedWard}
  disabled={wards.length === 0 || loadingWards} >
          <SelectTrigger id="ward">
            <SelectValue
              placeholder={
                loadingWards
                  ? "Loading Wards..."
                  : selectedLga
                    ? "Select Ward"
                    : "Select LGA first"
              }
            />
          </SelectTrigger>

          <SelectContent>
            {wards.map((ward) => (
              <SelectItem
                key={ward.name}
                value={ward.name}
              >
                {ward.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
            </div>

      {/* Polling Unit Selector */}
      <div className="max-w-md space-y-2">
        <label
          htmlFor="polling-unit"
          className="text-sm font-medium"
        >
          Polling Unit
        </label>

        <Select
          disabled={
            pollingUnits.length === 0 || loadingPollingUnits
          }
        >
          <SelectTrigger id="polling-unit">
            <SelectValue
              placeholder={
                loadingPollingUnits
                  ? "Loading Polling Units..."
                  : selectedWard
                    ? "Select Polling Unit"
                    : "Select Ward first"
              }
            />
          </SelectTrigger>

          <SelectContent>
            {pollingUnits.map((pollingUnit) => (
              <SelectItem
                key={pollingUnit.name}
                value={pollingUnit.name}
              >
                {pollingUnit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    </section>
  );
}