# 🎨 Patrones de Diseño Moderno (UI/UX) para XScouting

Este documento establece los principios de diseño y los patrones de interfaz de usuario (UI/UX) que deben aplicarse consistentemente en toda la plataforma XScouting, buscando un estilo "SaaS Premium" (Software-as-a-Service) moderno, limpio y centrado en los datos.

## 🌟 Estilo Visual y Estética

El "look and feel" que hace que la aplicación se sienta moderna y profesional.

| Patrón | Descripción | Implementación Recomendada |
| :--- | :--- | :--- |
| **Modo Oscuro como Base** | La interfaz principal (áreas protegidas) debe utilizar un esquema de **Modo Oscuro** (fondos `#18181B` o similar). Esto reduce la fatiga visual al analizar datos. | Aplica el Dark Mode de Tailwind CSS como base en el `layout.tsx` protegido. |
| **Paleta de Acento Funcional** | Restricción del color primario (de marca) únicamente a elementos interactivos, *Call to Actions* (CTAs), y gráficos. El resto de la UI debe ser neutro (grises, blanco). | Utiliza el color de acento de tu marca para `bg-primary`, `text-primary`, botones y *hover* states. |
| **Glassmorphism / Desenfoque Sutil** | Utilizar `backdrop-filter: blur()` en fondos de elementos clave como barras de navegación o modales. Agrega profundidad y sofisticación. | Aplicable a la barra lateral fija y a los Modales/Drawers para separarlos visualmente del fondo. |
| **Tipografía Limpia y Jerárquica** | Uso de una fuente **sans-serif moderna** (Ej. Inter, Manrope) para la legibilidad. Usa una **Tipografía Monospacio** para datos duros y estadísticas. | Utiliza diferentes grosores (`font-light`, `font-bold`) y tamaños para establecer una clara jerarquía de encabezados (`h1`, `h2`, `h3`). |

---

## I. Arquitectura de Página y Layouts (Páginas Completas)

Estos principios definen el esqueleto de la aplicación (aplicables a `/dashboard`, `/players`, `/teams`, etc.).

| Patrón | Descripción | Aplicación en XScouting |
| :--- | :--- | :--- |
| **Navegación Vertical Fija** | La barra de navegación principal (Sidebar) permanece fija a la izquierda. Permite acceso constante a las secciones principales (`Players`, `Tactics`, `Transfer Market`). | Implementar en el `(protected)/layout.tsx` con un ancho fijo (ej. 256px). |
| **Layout Asimétrico / Tres Columnas** | La página se divide en: Navegación (izquierda), Contenido principal (centro) y un panel contextual (derecha, opcional/plegable). | **`/dashboard`**: Nav + Widgets principales + Tareas/Notificaciones (derecha). |
| **Encabezado Contextual Persistente** | En páginas de detalle con mucho *scroll* (`/players/[id]`), la información esencial del elemento (nombre, foto, posición) se mantiene visible en un *header* fijo. | Perfiles de Jugador y Equipo. Mantiene el contexto visible mientras el usuario explora datos. |
| **"Above the Fold" de Acción Rápida** | La parte superior de la página contiene los filtros clave, la barra de búsqueda global y el botón de acción principal (`+ Crear`). | Aplicable a la parte superior de `/players` o `/tactics` para un acceso inmediato a la funcionalidad principal. |

---

## II. Componentes Modulares e Interacción (Tarjetas y Widgets)

Estos patrones definen la forma en que el usuario interactúa con la información en el panel y las listas.

| Patrón | Descripción | Aplicación en XScouting |
| :--- | :--- | :--- |
| **Tarjetas Modulares (Cards)** | El contenido se agrupa en contenedores discretos con bordes sutiles y un título claro. Deben ser fáciles de escanear y adaptables a la rejilla. | Componentes principales en el `/dashboard` y vistas de previsualización en `/players` (lista). |
| **Visualización de Datos (Dataviz) Primaria** | Los gráficos (radar, barras, líneas) deben ser interactivos, limpios y el foco del widget. Se utiliza el color de acento para destacar la información. | Widgets de rendimiento en el Dashboard; el resumen de atributos en el perfil de jugador. |
| **"Sparklines" en Tablas Densas** | Gráficos de líneas miniatura incrustados directamente en las filas de las tablas. Muestran tendencias de datos rápidamente sin necesidad de hacer clic. | En la tabla de jugadores de `/players` para mostrar la tendencia de rendimiento en los últimos 5 partidos. |
| **Indicadores de Estado (Badges y Tags)** | Etiquetas de texto y color pequeñas y concisas para comunicar estados de manera instantánea (Ej. **"En Venta"**, **"Lesionado"**, **"Potencial A+"**). | Listas de jugadores y resultados de partidos. |
| **Navegación por Pestañas (Tabs) Contextual** | Uso de pestañas horizontales para dividir grandes cantidades de información en una sola página, evitando el *scroll* infinito. | En `/players/[id]`: Pestañas para **Estadísticas**, **Atributos**, **Historial de Partidos**, **Notas de Scouting**. |

---

## III. Interacción del Usuario (Pop-ups y Modales)

Cómo se maneja la navegación secundaria, la confirmación y los flujos de trabajo.

| Patrón | Descripción | Aplicación en XScouting |
| :--- | :--- | :--- |
| **Paneles Deslizantes Laterales (Drawers)** | Paneles que se deslizan desde el lateral (izquierdo o derecho) para flujos de trabajo secundarios (formularios, ajustes). Permiten ver el fondo de la página. | **Filtros Avanzados** en `/players`; el formulario de **Creación Rápida de Tácticas**. |
| **Modales de Acción Crítica** | Pop-ups modales que bloquean el fondo y se usan solo para acciones irreversibles o que requieren atención inmediata. | Confirmación de transacciones en `/transfer-market` o **Eliminar Táctica**. |
| **Toasts de Retroalimentación Rápida** | Pequeños mensajes de éxito o error que aparecen en la esquina (ej. superior derecha) y desaparecen automáticamente. Son no intrusivos. | Después de cualquier acción de Guardar, Editar o Subir un archivo de avatar. |
| **Feedback en Tiempo Real del Formulario** | La validación de entrada ocurre a medida que el usuario escribe, mostrando errores o éxito antes de la presentación. | Formularios de `/register`, `/login` y el **Creador de Tácticas**. |