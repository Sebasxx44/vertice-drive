export type VehicleId = "berlina" | "suv" | "coupe";
export type Category = "todos" | "urbano" | "suv" | "deportivo";
export type City = "Pereira" | "Medellín" | "Bogotá";
export type ExtraId = "coverage" | "gps" | "childSeat";
export interface Vehicle {
  id: VehicleId;
  category: Exclude<Category, "todos">;
  name: string;
  subtitle: string;
  image: string;
  alt: string;
  seats: number;
  luggage: number;
  label: string;
}
export interface RentalSelection {
  vehicleId: VehicleId;
  city: City;
  pickup: string;
  dropoff: string;
  extras: Record<ExtraId, boolean>;
}
export interface RentalQuote {
  days: number;
  dailyRate: number;
  vehicleSubtotal: number;
  extrasSubtotal: number;
  total: number;
  error: string;
}
export interface StorageResult {
  selection: RentalSelection;
  restored: boolean;
}
