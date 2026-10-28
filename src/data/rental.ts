import type {
  City,
  ExtraId,
  RentalQuote,
  RentalSelection,
  StorageResult,
  VehicleId,
} from "@/types";

export const rates: Record<VehicleId, number> = {
  berlina: 240000,
  suv: 340000,
  coupe: 620000,
};
export const extraRates: Record<ExtraId, number> = {
  coverage: 45000,
  gps: 18000,
  childSeat: 22000,
};
export const cities: City[] = ["Pereira", "Medellín", "Bogotá"];
export const formatMoney = (value: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
export const todayISO = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
export const parseDate = (value: string): number | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? time
    : null;
};
export const addDays = (value: string, days: number): string => {
  const parsed = parseDate(value);
  if (parsed === null) return "";
  return new Date(parsed + days * 86400000).toISOString().slice(0, 10);
};
export const validateDates = (
  pickup: string,
  dropoff: string,
  today = todayISO(),
): string => {
  const start = parseDate(pickup);
  const end = parseDate(dropoff);
  if (start === null || end === null)
    return "Elige una fecha de recogida y de devolución válidas.";
  if (pickup < today) return "La recogida debe ser hoy o en una fecha futura.";
  if (end <= start) return "La devolución debe ser posterior a la recogida.";
  if ((end - start) / 86400000 > 30)
    return "Puedes simular alquileres de hasta 30 días.";
  return "";
};
export const defaultSelection = (today = todayISO()): RentalSelection => ({
  vehicleId: "berlina",
  city: "Pereira",
  pickup: addDays(today, 1),
  dropoff: addDays(today, 4),
  extras: { coverage: false, gps: false, childSeat: false },
});
export const calculateQuote = (
  selection: RentalSelection,
  today = todayISO(),
): RentalQuote => {
  const error = validateDates(selection.pickup, selection.dropoff, today);
  const dailyRate = rates[selection.vehicleId];
  if (error)
    return {
      days: 0,
      dailyRate,
      vehicleSubtotal: 0,
      extrasSubtotal: 0,
      total: 0,
      error,
    };
  const days =
    ((parseDate(selection.dropoff) ?? 0) - (parseDate(selection.pickup) ?? 0)) /
    86400000;
  const extraDaily =
    (selection.extras.coverage ? extraRates.coverage : 0) +
    (selection.extras.gps ? extraRates.gps : 0) +
    (selection.extras.childSeat ? extraRates.childSeat : 0);
  return {
    days,
    dailyRate,
    vehicleSubtotal: days * dailyRate,
    extrasSubtotal: days * extraDaily,
    total: days * (dailyRate + extraDaily),
    error: "",
  };
};
export const restoreSelection = (
  raw: string | null,
  today = todayISO(),
): StorageResult => {
  const fallback = { selection: defaultSelection(today), restored: false };
  try {
    const stored = JSON.parse(raw ?? "null") as Partial<RentalSelection> | null;
    if (typeof stored !== "object" || stored === null || Array.isArray(stored))
      return fallback;
    const { vehicleId, city, pickup, dropoff, extras } = stored;
    if (
      (vehicleId !== "berlina" &&
        vehicleId !== "suv" &&
        vehicleId !== "coupe") ||
      (city !== "Pereira" && city !== "Medellín" && city !== "Bogotá") ||
      typeof pickup !== "string" ||
      typeof dropoff !== "string" ||
      validateDates(pickup, dropoff, today)
    )
      return fallback;
    if (
      typeof extras !== "object" ||
      extras === null ||
      Array.isArray(extras) ||
      typeof extras.coverage !== "boolean" ||
      typeof extras.gps !== "boolean" ||
      typeof extras.childSeat !== "boolean"
    )
      return fallback;
    return {
      selection: {
        vehicleId,
        city,
        pickup,
        dropoff,
        extras: {
          coverage: extras.coverage,
          gps: extras.gps,
          childSeat: extras.childSeat,
        },
      },
      restored: true,
    };
  } catch {
    return fallback;
  }
};
