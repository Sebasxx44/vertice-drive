# VÉRTICE

Landing de alquiler de vehículos, creada desde cero en español. Marca conceptual independiente para el portfolio de Sebastián Sánchez. No representa una empresa de alquiler ni disponibilidad real; no realiza reservas, pagos ni envíos de datos personales.

Astro genera HTML estático. La flota filtrable y el simulador usan TypeScript nativo, sin React, Three.js ni librerías de formularios. El simulador valida fechas de calendario, orden, días pasados y máximo de 30 días; calcula tarifas canónicas en COP y guarda únicamente una selección validada en localStorage. Los precios y características son ilustrativos. Las marcas de los vehículos fotografiados no están vinculadas al proyecto.

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

Salida: `dist`. Preparado para Vercel. Componentes `TA`, `ActionHeaderTA`, alias `@/`, funciones flecha y lógica separada por responsabilidad. Diálogo nativo con teclado, formulario etiquetado, responsive y movimiento reducido.

## Recursos y licencias

Fotografías reales descargadas de Unsplash, inspeccionadas y convertidas localmente a AVIF responsive y WebP. [Licencia Unsplash](https://unsplash.com/license). No se utilizan imágenes generadas por IA ni el archivo de referencia como recurso.

- Hero: [Foto K., Porsche plateado ante arquitectura](https://unsplash.com/photos/a-silver-sports-car-parked-in-front-of-a-building-VTJ6Xu_jax4), [archivo original](https://images.unsplash.com/photo-1729682420977-bf8bccc4e117).
- Berlina: [fotografía original](https://images.unsplash.com/photo-1503376780353-7e6692767b70).
- SUV: [fotografía original](https://images.unsplash.com/photo-1519641471654-76ce0107ad1b).
- Deportivo: [fotografía original](https://images.unsplash.com/photo-1492144534655-ae79c964c9d7).
- Paisaje: [fotografía original](https://images.unsplash.com/photo-1500534623283-312aade485b7).

Tipografías [Outfit](https://github.com/Outfitio/Outfit-Fonts) y [Newsreader](https://github.com/productiontype/Newsreader): SIL Open Font License. Solo dos archivos WOFF2 latinos, servidos localmente; licencias incluidas en `public/licenses`. Iconos SVG propios. Hero precargado, imágenes secundarias con carga diferida. Sin solicitudes a CDNs en tiempo de navegación.
