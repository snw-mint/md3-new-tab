import { hexFromArgb, argbFromHex, Scheme, Hct } from '@material/material-color-utilities';

export const PREDEFINED_SOURCES: Record<string, string> = {
  default: '#0B57D0',
  expressive: '#65558F',
  leaf: '#518242',
  gold: '#797A1E',
  sun: '#D87739',
  candy: '#B90063',
  love: '#C0001B',
};

type Tier = [chroma: number, tone: number];
type Profile = { dark: Tier[]; light: Tier[]; lightPage?: string };

const SURFACE_PROFILES: Record<string, Profile> = {
  m3: {
    dark: [[6, 6], [6, 12], [6, 17], [6, 22]],
    light: [[6, 98], [6, 94], [6, 92], [6, 90]],
  },
  chrome: {
    dark: [[16, 25], [16, 12], [16, 14], [16, 15]],
    light: [[6, 98], [6, 94], [8, 92], [16, 90]],
    lightPage: '#ffffff',
  },
};

export function getHueFromHex(hex: string): number {
  return Hct.fromInt(argbFromHex(hex)).hue;
}

export function getHexFromHue(hue: number): string {
  return hexFromArgb(Hct.from(hue, 100, 50).toInt());
}

export function applyDynamicPalette(paletteId: string, customColorHex: string, signature?: string): void {
  let sourceHex = PREDEFINED_SOURCES[paletteId];

  if (paletteId === 'wallpaper') {
    sourceHex = customColorHex;
  } else if (!sourceHex && paletteId === 'custom') {
    sourceHex = customColorHex;
  } else if (!sourceHex) {
    sourceHex = PREDEFINED_SOURCES['default'];
    paletteId = 'default';
  }

  const argb = argbFromHex(sourceHex);
  const isDefault = paletteId === 'default';
  const lightScheme = Scheme.light(argb);
  const darkScheme = Scheme.dark(argb);

  const hctSource = Hct.fromInt(argb);
  const baseHue = hctSource.hue;

  const root = document.documentElement;

  root.style.setProperty('--sys-primary-light', hexFromArgb(lightScheme.primary));
  root.style.setProperty('--sys-on-primary-light', hexFromArgb(lightScheme.onPrimary));
  root.style.setProperty('--sys-primary-container-light', hexFromArgb(lightScheme.primaryContainer));
  root.style.setProperty('--sys-on-primary-container-light', hexFromArgb(lightScheme.onPrimaryContainer));
  root.style.setProperty('--sys-secondary-container-light', hexFromArgb(lightScheme.secondaryContainer));
  root.style.setProperty('--sys-on-secondary-container-light', hexFromArgb(lightScheme.onSecondaryContainer));
  root.style.setProperty('--sys-tertiary-light', hexFromArgb(lightScheme.tertiary));
  root.style.setProperty('--sys-on-tertiary-light', hexFromArgb(lightScheme.onTertiary));
  root.style.setProperty('--sys-tertiary-container-light', hexFromArgb(lightScheme.tertiaryContainer));
  root.style.setProperty('--sys-on-tertiary-container-light', hexFromArgb(lightScheme.onTertiaryContainer));
  root.style.setProperty('--sys-error-light', hexFromArgb(lightScheme.error));
  root.style.setProperty('--sys-on-error-light', hexFromArgb(lightScheme.onError));
  root.style.setProperty('--sys-surface-variant-light', hexFromArgb(lightScheme.surfaceVariant));
  root.style.setProperty('--sys-on-surface-variant-light', hexFromArgb(lightScheme.onSurfaceVariant));

  const profile = SURFACE_PROFILES[localStorage.getItem('ent_surface_tint') ?? 'm3'] ?? SURFACE_PROFILES.m3;
  const n = ([c, t]: Tier) => hexFromArgb(Hct.from(baseHue, c, t).toInt());
  const L = profile.light;
  const D = profile.dark;

  root.style.setProperty('--sys-background-light', isDefault ? '#ffffff' : (profile.lightPage ?? n(L[0])));
  root.style.setProperty('--sys-surface-light', isDefault ? '#ffffff' : n(L[0]));
  root.style.setProperty('--sys-surface-container-light', isDefault ? '#ffffff' : n(L[1]));
  root.style.setProperty('--sys-surface-container-high-light', isDefault ? '#ffffff' : n(L[2]));
  root.style.setProperty('--sys-surface-container-highest-light', isDefault ? '#ffffff' : n(L[3]));

  root.style.setProperty('--sys-primary-dark', hexFromArgb(darkScheme.primary));
  root.style.setProperty('--sys-on-primary-dark', hexFromArgb(darkScheme.onPrimary));
  root.style.setProperty('--sys-primary-container-dark', hexFromArgb(darkScheme.primaryContainer));
  root.style.setProperty('--sys-on-primary-container-dark', hexFromArgb(darkScheme.onPrimaryContainer));
  root.style.setProperty('--sys-secondary-container-dark', hexFromArgb(darkScheme.secondaryContainer));
  root.style.setProperty('--sys-on-secondary-container-dark', hexFromArgb(darkScheme.onSecondaryContainer));
  root.style.setProperty('--sys-tertiary-dark', hexFromArgb(darkScheme.tertiary));
  root.style.setProperty('--sys-on-tertiary-dark', hexFromArgb(darkScheme.onTertiary));
  root.style.setProperty('--sys-tertiary-container-dark', hexFromArgb(darkScheme.tertiaryContainer));
  root.style.setProperty('--sys-on-tertiary-container-dark', hexFromArgb(darkScheme.onTertiaryContainer));
  root.style.setProperty('--sys-error-dark', hexFromArgb(darkScheme.error));
  root.style.setProperty('--sys-on-error-dark', hexFromArgb(darkScheme.onError));

  root.style.setProperty(
    '--sys-surface-variant-dark',
    isDefault ? '#444444' : hexFromArgb(darkScheme.surfaceVariant),
  );
  root.style.setProperty('--sys-on-surface-variant-dark', hexFromArgb(darkScheme.onSurfaceVariant));
  root.style.setProperty('--sys-background-dark', isDefault ? '#282828' : n(D[0]));
  root.style.setProperty('--sys-surface-dark', isDefault ? '#282828' : n(D[0]));
  root.style.setProperty('--sys-surface-container-dark', isDefault ? '#323232' : n(D[1]));
  root.style.setProperty('--sys-surface-container-high-dark', isDefault ? '#373737' : n(D[2]));
  root.style.setProperty('--sys-surface-container-highest-dark', isDefault ? '#3c3c3c' : n(D[3]));

  root.setAttribute('data-palette', paletteId);

  const cssVarNames = [
    '--sys-primary-light',
    '--sys-on-primary-light',
    '--sys-primary-container-light',
    '--sys-on-primary-container-light',
    '--sys-secondary-container-light',
    '--sys-on-secondary-container-light',
    '--sys-tertiary-light',
    '--sys-on-tertiary-light',
    '--sys-tertiary-container-light',
    '--sys-on-tertiary-container-light',
    '--sys-surface-variant-light',
    '--sys-on-surface-variant-light',
    '--sys-background-light',
    '--sys-surface-light',
    '--sys-surface-container-light',
    '--sys-surface-container-high-light',
    '--sys-surface-container-highest-light',
    '--sys-primary-dark',
    '--sys-on-primary-dark',
    '--sys-primary-container-dark',
    '--sys-on-primary-container-dark',
    '--sys-secondary-container-dark',
    '--sys-on-secondary-container-dark',
    '--sys-tertiary-dark',
    '--sys-on-tertiary-dark',
    '--sys-tertiary-container-dark',
    '--sys-on-tertiary-container-dark',
    '--sys-surface-variant-dark',
    '--sys-on-surface-variant-dark',
    '--sys-background-dark',
    '--sys-surface-dark',
    '--sys-surface-container-dark',
    '--sys-surface-container-high-dark',
    '--sys-surface-container-highest-dark',
  ];
  const cache: Record<string, string> = {};
  const computed = getComputedStyle(root);
  cssVarNames.forEach((name) => {
    const val = root.style.getPropertyValue(name) || computed.getPropertyValue(name).trim();
    if (val) cache[name] = val;
  });
  localStorage.setItem('ent_cached_palette_vars', JSON.stringify(cache));
  if (signature) {
    localStorage.setItem('ent_cached_palette_sig', signature);
  }
}
