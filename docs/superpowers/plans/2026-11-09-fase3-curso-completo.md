# Fase 3 · Curso completo — Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use `- [ ]`.

**Goal:** las cuatro secciones del curso en el shell, con portada propia y páginas estáticas.
**Spec:** `docs/superpowers/specs/2026-11-09-fase3-curso-completo-design.md`

## Global Constraints
Los de la fase 2. Textos propios; el original solo como fuente citada. Cada tarea: `npm test` + humo + commit + push.

## Review Focus
1. Un experimento listado en dos secciones no debe montarse dos veces ni duplicar títulos (registry: `sections[]`, test de unicidad de slugs).
2. Rutas estáticas con Markdown ausente degradan a mensaje de error, no a página en blanco (humo: `#/bibliografia` tiene texto).
3. El hero canvas se para al navegar (sin rAF huérfano): `destroy` de la portada.
4. Cálculos exactos pesados (matriz de transferencia 2^Nx) limitados a Nx ≤ 10 con aviso.
5. Monte Carlo de Ising en 128² a 60 fps: pasos por fotograma adaptativos.

### Task A: secciones, portada, páginas estáticas
- [ ] `lib/registry.js`: `SECTIONS = [{id,titleKey,descKey}]`; entradas con `sections: {sfe: 1, fises: 2}` (número por sección). `experimentsOf(id)`. Test de unicidad y de numeración.
- [ ] `lib/shell.js`: `parseRoute` → `{kind:'home'|'page'|'section'|'experiment', id}`; sidebar agrupada por sección (details abiertos para la sección actual); páginas estáticas con `mountDoc`; índice de sección con tarjetas.
- [ ] `lib/hero.js`: canvas Ising 2D animado (Metrópolis a T≈T_c, paleta del tema), `startHero(canvas)→stop()`; cinco entradas superpuestas como en el mapa original.
- [ ] `docs/{es,en}/curso/*.md` (presentación, bibliografía, enlaces, créditos).
- [ ] Humo: rutas `#/`, `#/presentacion`, `#/bibliografia`, `#/enlaces`, `#/creditos`, `#/s/sfe` … `#/s/dc`.

### Task B: Física Estadística (9 nuevos) — un commit por experimento
- [ ] tlc · baker · osciladores · cvising · diatom · debye · macro (alias) · bosefermi · ising, con model/applet/docs/tests según la tabla de la spec.

### Task C: Física del Estado Sólido (12) — spec detallada tras leer los textos; un commit por experimento.
### Task D: Dispositivos Cuánticos (10) — ídem.
### Task E: README, evaluación, auditoría, capturas, despliegue, memoria.
