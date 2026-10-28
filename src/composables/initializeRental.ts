import { vehicles } from "@/data/vehicles";
import {
  addDays,
  calculateQuote,
  defaultSelection,
  formatMoney,
  restoreSelection,
  todayISO,
} from "@/data/rental";
import type { City, ExtraId, RentalSelection, VehicleId } from "@/types";
const storageKey = "vertice-rental-v1";
const element = <T extends HTMLElement>(selector: string): T => {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`No se encontró el elemento ${selector}`);
  return found;
};
const setText = (selector: string, text: string): void => {
  element(selector).textContent = text;
};
const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
export const initializeRental = (): void => {
  const form = element<HTMLFormElement>("#rental-form");
  const vehicle = element<HTMLSelectElement>("#vehicle");
  const city = element<HTMLSelectElement>("#city");
  const pickup = element<HTMLInputElement>("#pickup");
  const dropoff = element<HTMLInputElement>("#dropoff");
  const extras: Record<ExtraId, HTMLInputElement> = {
    coverage: element("#coverage"),
    gps: element("#gps"),
    childSeat: element("#childSeat"),
  };
  const dialog = element<HTMLDialogElement>("#rental-dialog");
  const errorNode = element("#date-error");
  const storageNode = element("#storage-state");
  let state: RentalSelection = defaultSelection();
  try {
    const stored = restoreSelection(localStorage.getItem(storageKey));
    state = stored.selection;
    if (stored.restored)
      storageNode.textContent = "Tu último recorrido sigue aquí.";
  } catch {
    storageNode.textContent =
      "Puedes explorar; el navegador no permite guardar tu selección.";
  }
  vehicle.value = state.vehicleId;
  city.value = state.city;
  pickup.value = state.pickup;
  dropoff.value = state.dropoff;
  Object.entries(extras).forEach(([id, input]) => {
    input.checked = state.extras[id as ExtraId];
  });
  const readForm = (): RentalSelection => ({
    vehicleId: vehicle.value as VehicleId,
    city: city.value as City,
    pickup: pickup.value,
    dropoff: dropoff.value,
    extras: {
      coverage: extras.coverage.checked,
      gps: extras.gps.checked,
      childSeat: extras.childSeat.checked,
    },
  });
  const update = (save = true): void => {
    state = readForm();
    const quote = calculateQuote(state);
    pickup.min = todayISO();
    dropoff.min = addDays(pickup.value, 1) || addDays(todayISO(), 1);
    dropoff.setCustomValidity(quote.error);
    errorNode.hidden = !quote.error;
    errorNode.textContent = quote.error;
    setText(
      "#rental-duration",
      quote.error
        ? "Completa las fechas de tu ruta"
        : `${quote.days} ${quote.days === 1 ? "día" : "días"} de camino`,
    );
    setText("#rental-total", quote.error ? "—" : formatMoney(quote.total));
    setText("#vehicle-subtotal", formatMoney(quote.vehicleSubtotal));
    setText("#extras-subtotal", formatMoney(quote.extrasSubtotal));
    if (save && !quote.error) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
        storageNode.textContent = "Tu selección se guarda en este navegador.";
      } catch {
        storageNode.textContent =
          "El navegador no permite guardar. Tu simulación sigue funcionando.";
      }
    }
  };
  form.addEventListener("input", () => update());
  form.addEventListener("change", () => update());
  document
    .querySelectorAll<HTMLButtonElement>("[data-vehicle]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        vehicle.value = button.dataset.vehicle ?? "berlina";
        update();
        element("#tu-viaje").scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
        vehicle.focus({ preventScroll: true });
      }),
    );
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
    if (!form.reportValidity()) return;
    const quote = calculateQuote(state);
    if (quote.error) return;
    const selected =
      vehicles.find((entry) => entry.id === state.vehicleId) ?? vehicles[0];
    setText("#dialog-vehicle", selected.name);
    setText("#dialog-city", state.city);
    setText("#dialog-pickup", formatDate(state.pickup));
    setText("#dialog-dropoff", formatDate(state.dropoff));
    setText(
      "#dialog-days",
      `${quote.days} ${quote.days === 1 ? "día" : "días"}`,
    );
    setText("#dialog-total", `${formatMoney(quote.total)} COP`);
    const extraNames = [
      state.extras.coverage ? "Cobertura ampliada" : "",
      state.extras.gps ? "GPS" : "",
      state.extras.childSeat ? "Silla infantil" : "",
    ].filter(Boolean);
    setText("#dialog-extras", extraNames.join(", ") || "Sin extras");
    dialog.showModal();
    document.body.style.overflow = "hidden";
  });
  const close = (): void => {
    dialog.close();
    document.body.style.overflow = "";
  };
  element("#dialog-close").addEventListener("click", close);
  element("#dialog-back").addEventListener("click", close);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  update(false);
};
