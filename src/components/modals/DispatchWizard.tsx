import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PlaneTakeoff,
  MapPin,
  X,
  Activity,
  Plus,
  Minus,
  Trash2,
  Package,
  Sparkles,
} from "lucide-react";
import type { City, DroneStation, Hospital } from "../../types";
import { haversineKm } from "../../lib/utils";
import { Button } from "../ui/Button";

export interface DispatchPayload {
  stationId: string;
  stationName: string;
  hospitalId: string;
  destinationName: string;
  urgency: "critical" | "high" | "normal";
  items: { id: string; name: string; quantity: number; unit: string }[];
  distanceKm: number;
  durationMin: number;
  batteryCostPct: number;
  droneId: string;
  etaMin: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: "antivenom" | "blood" | "medication" | "vaccine" | "lab-sample";
  defaultUnit: string;
  defaultQty: number;
}

export interface ManifestItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  selected?: boolean;
}

const MEDICAL_CATALOG: CatalogItem[] = [
  // Antivenom & Toxins
  { id: "antivenom-lyo", name: "Lyophilised Polyvalent Antivenom", category: "antivenom", defaultUnit: "vials", defaultQty: 4 },
  { id: "antivenom-viper", name: "Armenian Viper (Vipera Raddei) Antivenom", category: "antivenom", defaultUnit: "vials", defaultQty: 2 },
  { id: "atropine", name: "Atropine Sulfate 1mg (Antidote)", category: "antivenom", defaultUnit: "ampoules", defaultQty: 10 },
  // Blood Products
  { id: "blood-on", name: "Blood Type O- (Universal Donor)", category: "blood", defaultUnit: "units", defaultQty: 2 },
  { id: "blood-op", name: "Blood Type O+", category: "blood", defaultUnit: "units", defaultQty: 4 },
  { id: "blood-ap", name: "Blood Type A+", category: "blood", defaultUnit: "units", defaultQty: 2 },
  { id: "blood-an", name: "Blood Type A-", category: "blood", defaultUnit: "units", defaultQty: 2 },
  { id: "blood-bp", name: "Blood Type B+", category: "blood", defaultUnit: "units", defaultQty: 2 },
  { id: "blood-ffp", name: "Fresh Frozen Plasma (FFP)", category: "blood", defaultUnit: "units", defaultQty: 2 },
  { id: "blood-platelets", name: "Platelet Concentrate", category: "blood", defaultUnit: "units", defaultQty: 2 },
  // Emergency Medications
  { id: "epinephrine", name: "Epinephrine (Adrenaline) 1mg", category: "medication", defaultUnit: "ampoules", defaultQty: 6 },
  { id: "oxytocin", name: "Oxytocin (Postpartum Hemorrhage)", category: "medication", defaultUnit: "ampoules", defaultQty: 6 },
  { id: "txa", name: "Tranexamic Acid (TXA) Hemostatic", category: "medication", defaultUnit: "vials", defaultQty: 4 },
  { id: "iv-fluids", name: "IV Crystalloids (0.9% NaCl)", category: "medication", defaultUnit: "litres", defaultQty: 2 },
  { id: "antibiotics", name: "Broad-spectrum Antibiotics (Ceftriaxone)", category: "medication", defaultUnit: "vials", defaultQty: 10 },
  { id: "insulin", name: "Insulin (Rapid-Acting)", category: "medication", defaultUnit: "vials", defaultQty: 5 },
  { id: "naloxone", name: "Naloxone (Opioid Antagonist)", category: "medication", defaultUnit: "ampoules", defaultQty: 4 },
  // Vaccines
  { id: "vaccine-mmr", name: "MMR Vaccine", category: "vaccine", defaultUnit: "doses", defaultQty: 10 },
  { id: "vaccine-rabies", name: "Rabies Post-Exposure Vaccine", category: "vaccine", defaultUnit: "doses", defaultQty: 5 },
  { id: "vaccine-tetanus", name: "Tetanus Toxoid Vaccine", category: "vaccine", defaultUnit: "doses", defaultQty: 10 },
  // Lab Samples & Diagnostics
  { id: "lab-un3373", name: "UN3373 Biological Sample Transport Kit", category: "lab-sample", defaultUnit: "kits", defaultQty: 2 },
  { id: "lab-vtm", name: "PCR Viral Transport Media (VTM)", category: "lab-sample", defaultUnit: "tubes", defaultQty: 10 },
  { id: "lab-blood-tubes", name: "EDTA Blood Diagnostic Tubes", category: "lab-sample", defaultUnit: "tubes", defaultQty: 20 },
];

const URGENCY_VARIANT = {
  critical: {
    selected: "border-critical-500/50 bg-critical-500/[0.12] text-critical-600",
    idle: "border-paper-300 bg-paper-50 text-ink-700 hover:border-paper-400",
    label: "Critical",
  },
  high: {
    selected: "border-warn-500/50 bg-warn-500/[0.12] text-warn-600",
    idle: "border-paper-300 bg-paper-50 text-ink-700 hover:border-paper-400",
    label: "High",
  },
  normal: {
    selected: "border-primary-500/50 bg-primary-500/[0.12] text-primary-700",
    idle: "border-paper-300 bg-paper-50 text-ink-700 hover:border-paper-400",
    label: "Normal",
  },
} as const;

const CRITICAL_PRESET: ManifestItem[] = [
  { id: "antivenom-lyo", name: "Lyophilised Polyvalent Antivenom", quantity: 4, unit: "vials", selected: true },
  { id: "epinephrine", name: "Epinephrine (Adrenaline) 1mg", quantity: 6, unit: "ampoules", selected: true },
  { id: "iv-fluids", name: "IV Crystalloids (0.9% NaCl)", quantity: 2, unit: "litres", selected: true },
];

const HIGH_PRESET: ManifestItem[] = [
  { id: "blood-op", name: "Blood Type O+", quantity: 2, unit: "units", selected: true },
  { id: "oxytocin", name: "Oxytocin (Postpartum Hemorrhage)", quantity: 6, unit: "ampoules", selected: true },
];

const NORMAL_PRESET: ManifestItem[] = [
  { id: "vaccine-mmr", name: "MMR Vaccine", quantity: 10, unit: "doses", selected: true },
  { id: "antibiotics", name: "Broad-spectrum Antibiotics (Ceftriaxone)", quantity: 10, unit: "vials", selected: true },
];

const COMMON_UNITS = [
  "vials",
  "units",
  "ampoules",
  "litres",
  "doses",
  "kits",
  "tubes",
  "packs",
  "kg",
  "boxes",
];

interface DispatchWizardProps {
  stations: DroneStation[];
  hospitals: Hospital[];
  cityById: (id: string) => City;
  initialHospitalId?: string;
  onClose: () => void;
  onDispatched: (payload: DispatchPayload) => void;
}

export function DispatchWizard({
  stations,
  hospitals,
  cityById,
  initialHospitalId,
  onClose,
  onDispatched,
}: DispatchWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stationId, setStationId] = useState<string>(stations[0]?.id ?? "");
  const [hospitalId, setHospitalId] = useState<string>(
    initialHospitalId && hospitals.some((h) => h.id === initialHospitalId)
      ? initialHospitalId
      : (hospitals[0]?.id ?? "")
  );
  const [urgency, setUrgency] = useState<"critical" | "high" | "normal">("critical");
  const [items, setItems] = useState<ManifestItem[]>(CRITICAL_PRESET);

  // Category filter for quick-add catalog
  const [catalogCategory, setCatalogCategory] = useState<string>("all");
  // Custom item form state
  const [customName, setCustomName] = useState("");
  const [customQty, setCustomQty] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState("units");

  const station = stations.find((s) => s.id === stationId);
  const hospital = hospitals.find((h) => h.id === hospitalId);
  const stationCity = station ? cityById(station.cityId) : undefined;
  const hospitalCity = hospital ? cityById(hospital.cityId) : undefined;

  const distanceKm = useMemo(() => {
    if (!station || !hospital) return 0;
    return Math.round(
      haversineKm(
        { lat: station.lat, lng: station.lng },
        { lat: hospitalCity!.lat, lng: hospitalCity!.lng }
      ) * 10
    ) / 10;
  }, [station, hospital, hospitalCity]);

  const CRUISE_KPH = 95;
  const durationMin = Math.max(8, Math.round((distanceKm / CRUISE_KPH) * 60));
  // Battery cost: ~0.18% per minute in flight, plus 4% reserve buffer
  const batteryCostPct = Math.min(100, Math.round(durationMin * 0.18 + 4));

  const droneId = useMemo(() => {
    const num = Math.floor(10 + Math.random() * 90);
    return `AR-0${num}`;
  }, []);

  const presetForUrgency = (u: "critical" | "high" | "normal") => {
    setUrgency(u);
    if (u === "critical") setItems(CRITICAL_PRESET.map((it) => ({ ...it })));
    else if (u === "high") setItems(HIGH_PRESET.map((it) => ({ ...it })));
    else setItems(NORMAL_PRESET.map((it) => ({ ...it })));
  };

  // Toggle checkbox on item
  const handleToggleItem = (idx: number, isChecked: boolean) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, selected: isChecked } : it))
    );
  };

  // Toggle all items
  const handleToggleAll = (isChecked: boolean) => {
    setItems((prev) => prev.map((it) => ({ ...it, selected: isChecked })));
  };

  // Add catalog item to manifest
  const handleAddCatalogItem = (catItem: CatalogItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (it) => it.id === catItem.id || it.name.toLowerCase() === catItem.name.toLowerCase()
      );
      if (existing) {
        return prev.map((it) =>
          it === existing
            ? { ...it, quantity: it.quantity + catItem.defaultQty, selected: true }
            : it
        );
      }
      return [
        ...prev,
        {
          id: catItem.id,
          name: catItem.name,
          quantity: catItem.defaultQty,
          unit: catItem.defaultUnit,
          selected: true,
        },
      ];
    });
  };

  // Add custom user-defined staff or item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const cleanName = customName.trim();
    const qty = Math.max(1, customQty || 1);
    const unit = customUnit || "units";
    const itemId = `custom-${Date.now()}`;

    setItems((prev) => {
      const existing = prev.find((it) => it.name.toLowerCase() === cleanName.toLowerCase());
      if (existing) {
        return prev.map((it) =>
          it === existing ? { ...it, quantity: it.quantity + qty, selected: true } : it
        );
      }
      return [...prev, { id: itemId, name: cleanName, quantity: qty, unit, selected: true }];
    });

    setCustomName("");
    setCustomQty(1);
  };

  // Modify quantity of item in manifest
  const handleUpdateQty = (idx: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(idx);
      return;
    }
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, quantity: newQty } : it))
    );
  };

  // Remove item from manifest
  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const filteredCatalog = useMemo(() => {
    if (catalogCategory === "all") return MEDICAL_CATALOG;
    return MEDICAL_CATALOG.filter((it) => it.category === catalogCategory);
  }, [catalogCategory]);

  // Only checked items with quantity > 0 are delivered
  const selectedItems = useMemo(() => {
    return items.filter((it) => it.selected !== false && it.quantity > 0);
  }, [items]);

  const totalPayloadUnits = useMemo(() => {
    return selectedItems.reduce((sum, it) => sum + it.quantity, 0);
  }, [selectedItems]);

  const canAdvance = () => {
    if (step === 1) return !!station;
    if (step === 2) return !!hospital && !!urgency && selectedItems.length > 0;
    return selectedItems.length > 0;
  };

  const handleLaunch = () => {
    if (!station || !hospital || selectedItems.length === 0) return;
    onDispatched({
      stationId: station.id,
      stationName: station.name,
      hospitalId: hospital.id,
      destinationName: hospital.name,
      urgency,
      items: selectedItems.map((it) => ({
        id: it.id,
        name: it.name,
        quantity: it.quantity,
        unit: it.unit,
      })),
      distanceKm,
      durationMin,
      batteryCostPct,
      droneId,
      etaMin: durationMin,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dispatch-wizard-title"
        className="panel-strong relative flex max-h-[92vh] w-full max-w-[680px] flex-col overflow-hidden animate-slideUp shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent — critical red, drone amber, medical teal gradient */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-critical-500 via-warn-500 to-primary-500" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-paper-300 p-5">
          <div className="flex items-start gap-3.5">
            <div className="rounded-lg border border-critical-500/25 bg-critical-500/[0.08] p-2.5">
              <AlertTriangle size={18} className="text-critical-600" />
            </div>
            <div>
              <h2
                id="dispatch-wizard-title"
                className="text-[15px] font-semibold leading-tight text-ink-900"
              >
                New emergency dispatch
              </h2>
              <div className="mt-1 text-[12px] text-ink-600">
                Select exactly which items to deliver with checkboxes, and customize amounts freely.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-600 outline-none transition-colors hover:bg-paper-150 hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-primary-500/40"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <ol className="flex items-center gap-1.5 border-b border-paper-300 bg-paper-100 px-5 py-2.5">
          {[1, 2, 3].map((n) => {
            const active = step === n;
            const done = step > n;
            return (
              <li key={n} className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold mono ${
                    done
                      ? "bg-ok-500/20 text-ok-600"
                      : active
                      ? "bg-primary-500/15 text-primary-700"
                      : "bg-paper-200 text-ink-600"
                  }`}
                >
                  {done ? <CheckCircle2 size={12} /> : n}
                </span>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${
                    active
                      ? "text-ink-900"
                      : done
                      ? "text-ok-600"
                      : "text-ink-600"
                  }`}
                >
                  {n === 1 ? "Origin" : n === 2 ? "Destination" : "Payload & Cargo"}
                </span>
                {n < 3 && <span className="mx-1 h-px w-6 bg-paper-300" />}
              </li>
            );
          })}
        </ol>

        {/* Step body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="label-eyebrow mb-2">Step 1 · Select origin base</h3>
                <p className="text-[13px] text-ink-700">
                  Pick a launch station with available drones and charged batteries.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {stations.map((s) => {
                  const c = cityById(s.cityId);
                  const selected = s.id === stationId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStationId(s.id)}
                      className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500/40 ${
                        selected
                          ? "border-primary-500/50 bg-primary-500/[0.08]"
                          : "border-paper-300 bg-paper-50 hover:border-primary-300 hover:bg-paper-100"
                      }`}
                    >
                      <span className="text-[13px] font-medium text-ink-900">
                        {s.name}
                      </span>
                      <span className="text-[11px] text-ink-600">
                        {c.name}, {c.province} marz
                      </span>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] mono text-warn-700">
                        <PlaneTakeoff size={10} /> {s.dronesHome} drones
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] mono text-ok-600">
                        <Activity size={10} /> {s.batteriesHome} batteries
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="label-eyebrow mb-2">Step 2 · Destination & urgency</h3>
                <p className="text-[13px] text-ink-700">
                  Select the receiving medical facility, dispatch priority, and check the items to deliver.
                </p>
              </div>

              <div>
                <label className="label-eyebrow block">Urgency</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(["critical", "high", "normal"] as const).map((u) => {
                    const v = URGENCY_VARIANT[u];
                    const selected = urgency === u;
                    return (
                      <button
                        key={u}
                        onClick={() => presetForUrgency(u)}
                        className={`rounded-lg border px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500/40 ${
                          selected ? v.selected : v.idle
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Items selection checkboxes directly in Step 2 */}
              <div className="rounded-lg border border-paper-300 bg-paper-50 p-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-paper-200">
                  <span className="label-eyebrow text-ink-800">
                    Choose items to deliver ({selectedItems.length} of {items.length} selected)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAll(true)}
                      className="text-[11px] font-medium text-primary-700 hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-ink-400">·</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAll(false)}
                      className="text-[11px] text-ink-600 hover:underline"
                    >
                      Deselect all
                    </button>
                  </div>
                </div>

                <div className="mt-2 space-y-1.5">
                  {items.map((it, idx) => {
                    const isChecked = it.selected !== false;
                    return (
                      <label
                        key={`${it.id}-${idx}`}
                        className={`flex items-center justify-between gap-2.5 rounded-md border p-2.5 text-[13px] cursor-pointer transition-colors ${
                          isChecked
                            ? "border-primary-500/50 bg-primary-500/[0.06]"
                            : "border-paper-300 bg-paper-100/50 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleToggleItem(idx, e.target.checked)}
                            className="h-4 w-4 rounded border-paper-300 text-primary-600 focus:ring-primary-500/20 cursor-pointer accent-primary-600"
                          />
                          <span
                            className={`font-medium truncate ${
                              isChecked ? "text-ink-900" : "text-ink-500 line-through"
                            }`}
                          >
                            {it.name}
                          </span>
                        </div>
                        <span className="mono text-[12px] font-semibold text-primary-700 shrink-0">
                          {it.quantity} {it.unit}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label-eyebrow block">Receiving facility</label>
                <div className="mt-1.5 grid max-h-[220px] grid-cols-1 gap-1.5 overflow-y-auto pr-1">
                  {hospitals.map((h) => {
                    const c = cityById(h.cityId);
                    const selected = h.id === hospitalId;
                    return (
                      <button
                        key={h.id}
                        onClick={() => setHospitalId(h.id)}
                        className={`flex items-center justify-between rounded-lg border px-3.5 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500/40 ${
                          selected
                            ? "border-primary-500/50 bg-primary-500/[0.08]"
                            : "border-paper-300 bg-paper-50 hover:border-primary-300 hover:bg-paper-100"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-ink-900">
                            {h.name}
                          </span>
                          <span className="text-[11px] text-ink-600">
                            {c.name}, {c.province}
                          </span>
                        </div>
                        <div className="mono text-[11px] text-ink-600">
                          {h.operationalHours}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && station && hospital && (
            <div className="space-y-4">
              <div>
                <h3 className="label-eyebrow mb-1">Step 3 · Cargo Manifest & Flight Envelope</h3>
                <p className="text-[13px] text-ink-700">
                  Toggle items with checkboxes, adjust exact quantities, or add new custom supplies.
                </p>
              </div>

              {/* Flight envelope metrics */}
              <div className="rounded-lg border border-paper-300 bg-paper-50 p-3.5">
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex flex-col">
                    <span className="label-eyebrow">Origin</span>
                    <span className="mt-0.5 font-medium text-ink-900">
                      {stationCity?.name} ({station.name})
                    </span>
                  </div>
                  <MapPin size={14} className="text-primary-600 mx-2" />
                  <div className="flex flex-col text-right">
                    <span className="label-eyebrow">Destination</span>
                    <span className="mt-0.5 font-medium text-ink-900">
                      {hospitalCity?.name} ({hospital.name})
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg border border-paper-300 bg-paper-100 p-2">
                    <div className="label-eyebrow text-[10px]">Distance</div>
                    <div className="mono mt-0.5 text-[13px] font-semibold text-ink-900">
                      {distanceKm} <span className="text-[10px] text-ink-600">km</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-paper-300 bg-paper-100 p-2">
                    <div className="label-eyebrow text-[10px]">Cruise</div>
                    <div className="mono mt-0.5 text-[13px] font-semibold text-ink-900">
                      {CRUISE_KPH} <span className="text-[10px] text-ink-600">km/h</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-paper-300 bg-paper-100 p-2">
                    <div className="label-eyebrow text-[10px]">ETA</div>
                    <div className="mono mt-0.5 text-[13px] font-semibold text-primary-700">
                      {durationMin} <span className="text-[10px] text-ink-600">min</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-paper-300 bg-paper-100 p-2">
                    <div className="label-eyebrow text-[10px]">Assigned</div>
                    <div className="mono mt-0.5 text-[13px] font-semibold text-warn-700">
                      {droneId}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Cargo Manifest Section with Checkboxes */}
              <div className="rounded-lg border border-paper-300 bg-paper-50 p-4">
                <div className="flex items-center justify-between pb-2 border-b border-paper-200">
                  <div className="flex items-center gap-2">
                    <Package size={15} className="text-primary-600" />
                    <span className="font-semibold text-[13px] text-ink-900">
                      Active Cargo Manifest ({selectedItems.length} of {items.length} items checked · {totalPayloadUnits} units)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAll(true)}
                      className="text-[11px] font-medium text-primary-700 hover:underline"
                    >
                      Check all
                    </button>
                    <span className="text-ink-400">·</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAll(false)}
                      className="text-[11px] text-ink-600 hover:underline"
                    >
                      Uncheck all
                    </button>
                    {items.length > 0 && (
                      <>
                        <span className="text-ink-400">·</span>
                        <button
                          type="button"
                          onClick={() => setItems([])}
                          className="text-[11px] text-critical-600 hover:underline"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* List of items in manifest with checkboxes */}
                {items.length === 0 ? (
                  <div className="py-5 text-center text-[12px] text-ink-600">
                    Manifest is empty. Pick items from the catalog or add custom supplies below.
                  </div>
                ) : (
                  <div className="mt-3 space-y-2 max-h-[190px] overflow-y-auto pr-1">
                    {items.map((it, idx) => {
                      const isChecked = it.selected !== false;
                      return (
                        <div
                          key={`${it.id}-${idx}`}
                          className={`flex items-center justify-between gap-2 rounded-lg border p-2 text-[13px] transition-colors ${
                            isChecked
                              ? "border-paper-300 bg-paper-100/80"
                              : "border-paper-200 bg-paper-100/40 opacity-55"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleToggleItem(idx, e.target.checked)}
                              className="h-4 w-4 rounded border-paper-300 text-primary-600 focus:ring-primary-500/20 cursor-pointer accent-primary-600 shrink-0"
                              aria-label={`Select ${it.name}`}
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span
                                className={`font-medium truncate ${
                                  isChecked ? "text-ink-900" : "text-ink-500 line-through"
                                }`}
                              >
                                {it.name}
                              </span>
                              <span className="text-[11px] text-ink-600">
                                {it.unit}
                              </span>
                            </div>
                          </div>

                          {/* Quantity Increment/Decrement Controls */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, it.quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded border border-paper-300 bg-paper-50 text-ink-700 hover:bg-paper-200"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={it.quantity}
                              onChange={(e) =>
                                handleUpdateQty(idx, parseInt(e.target.value, 10) || 1)
                              }
                              className="mono w-14 rounded border border-paper-300 bg-paper-50 px-1.5 py-0.5 text-center text-[12px] font-semibold text-primary-700 focus:border-primary-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, it.quantity + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded border border-paper-300 bg-paper-50 text-ink-700 hover:bg-paper-200"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                            <span className="mono text-[11px] text-ink-600 min-w-[32px]">
                              {it.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="ml-1 flex h-6 w-6 items-center justify-center rounded text-critical-500 hover:bg-critical-500/10 hover:text-critical-600"
                              aria-label="Remove item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Add from Medical Catalog */}
              <div className="rounded-lg border border-paper-300 bg-paper-50 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-warn-600" />
                    <span className="font-semibold text-[13px] text-ink-900">
                      Quick Add Medical Supplies
                    </span>
                  </div>
                  {/* Category filter tabs */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { key: "all", label: "All" },
                      { key: "antivenom", label: "Antivenom" },
                      { key: "blood", label: "Blood" },
                      { key: "medication", label: "Meds" },
                      { key: "vaccine", label: "Vaccines" },
                      { key: "lab-sample", label: "Lab" },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setCatalogCategory(cat.key)}
                        className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                          catalogCategory === cat.key
                            ? "bg-primary-500 text-white"
                            : "bg-paper-200 text-ink-700 hover:bg-paper-300"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {filteredCatalog.map((catItem) => (
                    <button
                      key={catItem.id}
                      type="button"
                      onClick={() => handleAddCatalogItem(catItem)}
                      className="flex items-center justify-between gap-2 rounded border border-paper-300 bg-paper-100/60 px-2.5 py-1.5 text-left text-[12px] hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
                    >
                      <span className="text-ink-900 truncate font-medium">
                        {catItem.name}
                      </span>
                      <span className="mono shrink-0 rounded bg-paper-200 px-1.5 py-0.5 text-[10px] text-primary-700">
                        +{catItem.defaultQty} {catItem.defaultUnit}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Item / Staff Adder */}
              <form
                onSubmit={handleAddCustomItem}
                className="rounded-lg border border-paper-300 bg-paper-50 p-4"
              >
                <div className="label-eyebrow mb-2">
                  Add Any Custom Item / Staff / Equipment
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Item name (e.g. Plasma Extender, Surgical Kit, Defib Pads)..."
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full rounded-md border border-paper-300 bg-paper-100 px-3 py-1.5 text-[12px] text-ink-900 placeholder:text-ink-500 focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={customQty}
                      onChange={(e) => setCustomQty(parseInt(e.target.value, 10) || 1)}
                      className="mono w-full rounded-md border border-paper-300 bg-paper-100 px-2.5 py-1.5 text-[12px] text-center text-ink-900 focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className="w-full rounded-md border border-paper-300 bg-paper-100 px-2 py-1.5 text-[12px] text-ink-900 focus:border-primary-400 focus:outline-none"
                    >
                      {COMMON_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={!customName.trim()}
                      className="flex w-full items-center justify-center gap-1 rounded-md bg-primary-500 px-3 py-1.5 text-[12px] font-medium text-white shadow-soft transition-colors hover:bg-primary-600 disabled:opacity-50"
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-paper-300 p-4">
          <Button
            variant="secondary"
            onClick={() => (step === 1 ? onClose() : setStep((step - 1) as 1 | 2))}
          >
            <ChevronLeft size={12} />
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          <div className="text-[11px] text-ink-600 mono">
            Step {step} of 3
          </div>

          {step < 3 ? (
            <Button
              variant="primary"
              disabled={!canAdvance()}
              onClick={() => setStep((step + 1) as 2 | 3)}
            >
              Next
              <ChevronRight size={12} />
            </Button>
          ) : (
            <Button
              variant="destructive"
              disabled={!canAdvance()}
              onClick={handleLaunch}
            >
              <PlaneTakeoff size={12} /> Launch dispatch ({selectedItems.length} item{selectedItems.length === 1 ? "" : "s"})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
