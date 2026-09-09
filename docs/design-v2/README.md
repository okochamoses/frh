# Chidhama Design System Package

This package is intended to be the implementation source of truth for an LLM-assisted frontend.

## Files

- `DESIGN.md` — visual and interaction rules
- `tokens.json` — machine-readable design tokens
- `COMPONENTS.md` — reusable component specifications
- `IMAGERY.md` — photography and art-direction guidance
- `tailwind.config.ts` — Tailwind theme mapping
- `tokens.css` — CSS custom properties

## Recommended LLM workflow

Give the coding agent this instruction:

> Read `DESIGN.md`, `tokens.json`, `COMPONENTS.md`, and `IMAGERY.md` before modifying the UI. Reuse the supplied tokens and component patterns. Do not introduce new colors, spacing, typography, radii, or shadows without first checking whether an existing token can satisfy the requirement.

## Source of truth

1. Design intent: `DESIGN.md`
2. Numeric tokens: `tokens.json`
3. Components: `COMPONENTS.md`
4. Imagery: `IMAGERY.md`
5. Framework mapping: `tailwind.config.ts` / `tokens.css`

## Figma

Figma should mirror these tokens as Variables and Styles. The rendered design-system PNG should be kept as a visual reference, not as the implementation source of truth.
