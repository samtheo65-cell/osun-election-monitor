export interface GeographyOption {
  id: string;
  name: string;
}

export interface GeographySelection {
  stateId: string;
  lgaId: string;
  wardId: string;
  pollingUnitId: string;
}

export interface ElectoralGeography {
  senatorialDistrict: string;
  federalConstituency: string;
  stateConstituency: string;
}