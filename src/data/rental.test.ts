import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  calculateQuote,
  defaultSelection,
  parseDate,
  restoreSelection,
  validateDates,
} from "./rental.ts";
const today = "2030-03-09";
test("fechas de calendario: rechaza imposibles y acepta bisiestos", () => {
  assert.equal(parseDate("2030-02-30"), null);
  assert.equal(parseDate("2031-02-29"), null);
  assert.notEqual(parseDate("2032-02-29"), null);
  assert.equal(parseDate("ayer"), null);
});
test("fechas futuras y devolución posterior: valida antes de calcular", () => {
  assert.match(validateDates("2030-03-08", "2030-03-10", today), /recogida/);
  assert.match(validateDates("2030-03-10", "2030-03-10", today), /posterior/);
  assert.match(validateDates("2030-03-12", "2030-03-11", today), /posterior/);
  assert.equal(validateDates("2030-03-09", "2030-03-10", today), "");
});
test("duración usa días de calendario sin depender de horario de verano", () => {
  const state = {
    ...defaultSelection(today),
    pickup: "2030-03-09",
    dropoff: "2030-03-12",
  };
  assert.equal(calculateQuote(state, today).days, 3);
  assert.equal(addDays("2030-12-31", 1), "2031-01-01");
});
test("precio incluye vehículo, todos los días y extras seleccionados", () => {
  const state = defaultSelection(today);
  state.vehicleId = "suv";
  state.extras = { coverage: true, gps: true, childSeat: false };
  const quote = calculateQuote(state, today);
  assert.equal(quote.vehicleSubtotal, 1020000);
  assert.equal(quote.extrasSubtotal, 189000);
  assert.equal(quote.total, 1209000);
});
test("alquiler inválido devuelve error y total cero", () => {
  const state = { ...defaultSelection(today), dropoff: "2030-02-01" };
  assert.equal(calculateQuote(state, today).total, 0);
  assert.notEqual(calculateQuote(state, today).error, "");
  assert.match(validateDates("2030-03-10", "2030-04-10", today), /30 días/);
});
test("persistencia rechaza JSON corrupto y esquemas ajenos", () => {
  for (const raw of [
    null,
    "{broken",
    "[]",
    "true",
    "{}",
    '{"vehicleId":"inexistente"}',
  ])
    assert.equal(restoreSelection(raw, today).restored, false);
});
test("persistencia valida ciudades, fechas y booleanos", () => {
  const state = defaultSelection(today);
  assert.equal(
    restoreSelection(JSON.stringify({ ...state, city: "Madrid" }), today)
      .restored,
    false,
  );
  assert.equal(
    restoreSelection(JSON.stringify({ ...state, pickup: "2020-01-01" }), today)
      .restored,
    false,
  );
  assert.equal(
    restoreSelection(
      JSON.stringify({ ...state, extras: { coverage: "false" } }),
      today,
    ).restored,
    false,
  );
  assert.deepEqual(restoreSelection(JSON.stringify(state), today), {
    selection: state,
    restored: true,
  });
});
test("precios almacenados no pueden alterar las tarifas canónicas", () => {
  const selection = defaultSelection(today);
  const restored = restoreSelection(
    JSON.stringify({ ...selection, dailyRate: 1, total: 1 }),
    today,
  );
  assert.equal(restored.restored, true);
  assert.equal(calculateQuote(restored.selection, today).dailyRate, 240000);
  assert.equal(calculateQuote(restored.selection, today).total, 720000);
});
test("el límite acepta 30 días exactos y rechaza 31", () => {
  assert.equal(validateDates("2030-03-10", "2030-04-09", today), "");
  assert.notEqual(validateDates("2030-03-10", "2030-04-10", today), "");
});
