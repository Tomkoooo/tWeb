import type { ThemeTokens } from "@wse/core/services/theme"

/**
 * Ported from the original Krausz Barkácsmester storefront (main@1fae4a56,
 * src/app/globals.css): industrial black/orange palette, high-contrast dark UI.
 *
 * `primary` is orange (#FF5500), not black: the shared homepage/CTA
 * components style their main action button with `bg-primary` /
 * `text-primary-foreground`, and in the original design that button
 * (e.g. "IRÁNY A BOLT") was always the orange one. `accent` mirrors the
 * same orange since the original used a single emphasis color everywhere
 * (buttons, highlighted text, icons) — there was no separate second hue.
 * Foreground is black rather than the original's white for WCAG contrast
 * (validate-template enforces ≥4.5:1; white-on-#FF5500 is ~3.2:1).
 */
export const krauszClassicTheme: ThemeTokens = {
  primary: "#FF5500",
  primaryForeground: "#000000",
  secondary: "#222222",
  secondaryForeground: "#FFFFFF",
  accent: "#FF5500",
  accentForeground: "#000000",
  background: "#0A0A0A",
  foreground: "#FFFFFF",
  surface: "#151515",
  surfaceForeground: "#FFFFFF",
  border: "#333333",
  muted: "#222222",
  mutedForeground: "#999999",
  success: "#16A34A",
  successForeground: "#FFFFFF",
  warning: "#FFD700",
  warningForeground: "#000000",
  error: "#DC2626",
  errorForeground: "#FFFFFF",
}
