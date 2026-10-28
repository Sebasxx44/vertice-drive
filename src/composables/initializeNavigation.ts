import type { Category } from "@/types";
export const initializeNavigation = (): void => {
  const menu = document.querySelector<HTMLButtonElement>("#menu-button");
  const nav = document.querySelector<HTMLElement>("#main-nav");
  const closeMenu = () => {
    menu?.setAttribute("aria-expanded", "false");
    menu?.setAttribute("aria-label", "Abrir navegación");
    nav?.classList.remove("is-open");
  };
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute(
      "aria-label",
      open ? "Cerrar navegación" : "Abrir navegación",
    );
    nav?.classList.toggle("is-open", open);
  });
  nav
    ?.querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menu?.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
      menu.focus();
    }
  });
  const filter = (category: Category): void => {
    let visible = 0;
    document.querySelectorAll<HTMLElement>(".vehicle-card").forEach((card) => {
      card.hidden = category !== "todos" && card.dataset.category !== category;
      if (!card.hidden) visible++;
    });
    document
      .querySelectorAll<HTMLButtonElement>("[data-filter]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.filter === category),
        ),
      );
    const count = document.querySelector("#fleet-count");
    if (count)
      count.textContent = `${visible} ${visible === 1 ? "vehículo para explorar" : "vehículos para explorar"}`;
  };
  document
    .querySelectorAll<HTMLButtonElement>("[data-filter]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        filter(button.dataset.filter as Category),
      ),
    );
  document
    .querySelectorAll<HTMLAnchorElement>("[data-hero-filter]")
    .forEach((link) =>
      link.addEventListener("click", () =>
        filter(link.dataset.heroFilter as Category),
      ),
    );
};
