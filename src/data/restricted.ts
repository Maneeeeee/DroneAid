import type { RestrictedZone } from "../types";

// Simplified restricted / no-fly zones: airports and a mountainous
// military corridor. Used to render dashed exclusion circles.
export const restrictedZones: RestrictedZone[] = [
  {
    id: "rz-zvartnots",
    name: "Zvartnots CTR",
    centerLat: 40.1473,
    centerLng: 44.3959,
    radiusKm: 6,
    reason: "Aerodrome controlled zone",
  },
  {
    id: "rz-shirak",
    name: "Shirak CTR",
    centerLat: 40.7506,
    centerLng: 43.8593,
    radiusKm: 5,
    reason: "Aerodrome controlled zone",
  },
  {
    id: "rz-yeraz",
    name: "Yeraz Military Reserve",
    centerLat: 40.35,
    centerLng: 45.1,
    radiusKm: 8,
    reason: "Active military reservation",
  },
  // Tavush Region Border Restricted Zones
  {
    id: "rz-tavush-north",
    name: "Tavush North Border Sector (Noyemberyan/Voskepar)",
    centerLat: 41.12,
    centerLng: 45.08,
    radiusKm: 14,
    reason: "Border security exclusion corridor",
  },
  {
    id: "rz-tavush-east",
    name: "Tavush East Border Sector (Berd/Chinari)",
    centerLat: 40.88,
    centerLng: 45.42,
    radiusKm: 13,
    reason: "Eastern frontier border buffer zone",
  },
  {
    id: "rz-tavush-ijevan",
    name: "Tavush Central Border Sector (Azatamut)",
    centerLat: 41.01,
    centerLng: 45.24,
    radiusKm: 11,
    reason: "Border security corridor",
  },
  // Syunik Region Border Restricted Zones
  {
    id: "rz-syunik-goris-tegh",
    name: "Syunik East Sector (Goris / Tegh)",
    centerLat: 39.54,
    centerLng: 46.46,
    radiusKm: 11,
    reason: "Eastern border buffer & security corridor",
  },
  {
    id: "rz-syunik-kapan",
    name: "Syunik Southeast Sector (Kapan / Shikahogh)",
    centerLat: 39.18,
    centerLng: 46.52,
    radiusKm: 13,
    reason: "Syunik border exclusion zone",
  },
  {
    id: "rz-syunik-meghri",
    name: "Syunik South Sector (Meghri / Arax Buffer)",
    centerLat: 38.90,
    centerLng: 46.24,
    radiusKm: 10,
    reason: "International border security corridor",
  },
  {
    id: "rz-syunik-ishkhanasar",
    name: "Syunik North Sector (Ishkhanasar / Sisian East)",
    centerLat: 39.60,
    centerLng: 46.12,
    radiusKm: 9,
    reason: "Highland border restriction zone",
  },
];
