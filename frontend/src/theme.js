export const colors = {
  bg: '#eef2f9',
  bgGradient:
    'linear-gradient(160deg, #eef2ff 0%, #f5f7fb 45%, #ecfeff 100%)',
  surface: 'rgba(255, 255, 255, 0.78)',
  surfaceSolid: '#ffffff',
  surfaceMuted: '#f8fafc',
  border: 'rgba(148, 163, 184, 0.24)',
  borderStrong: 'rgba(148, 163, 184, 0.4)',
  text: '#0f172a',
  textMuted: '#475569',
  textSubtle: '#64748b',
  accent: '#0f766e',
  accentSoft: 'rgba(15, 118, 110, 0.12)',
  driver: '#0f766e',
  passenger: '#1d4ed8',
  admin: '#7c3aed',
  success: '#166534',
  successSoft: '#dcfce7',
  warning: '#92400e',
  warningSoft: '#fef3c7',
  danger: '#b91c1c',
  dangerSoft: '#fee2e2',
  info: '#1d4ed8',
  infoSoft: '#dbeafe',
};

export const radius = {
  sm: '10px',
  md: '14px',
  lg: '20px',
  xl: '28px',
  pill: '999px',
};

export const shadows = {
  card: '0 20px 45px rgba(15, 23, 42, 0.08)',
  soft: '0 8px 24px rgba(15, 23, 42, 0.06)',
  lift: '0 30px 60px rgba(15, 23, 42, 0.14)',
};

export const spacing = {
  xs: '6px',
  sm: '10px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const typography = {
  display: {
    fontSize: 'clamp(2.2rem, 4.8vw, 3.6rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.035em',
    fontWeight: 700,
    color: colors.text,
  },
  h2: {
    fontSize: '1.6rem',
    lineHeight: 1.2,
    fontWeight: 700,
    color: colors.text,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: '1.15rem',
    lineHeight: 1.3,
    fontWeight: 700,
    color: colors.text,
  },
  body: {
    fontSize: '0.98rem',
    lineHeight: 1.65,
    color: colors.textMuted,
  },
  small: {
    fontSize: '0.85rem',
    lineHeight: 1.5,
    color: colors.textSubtle,
  },
  eyebrow: {
    fontSize: '0.74rem',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
};

export const surfaces = {
  shell: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    background: colors.bgGradient,
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  glow: (position) => ({
    position: 'absolute',
    width: '480px',
    height: '480px',
    borderRadius: '50%',
    filter: 'blur(42px)',
    pointerEvents: 'none',
    ...position,
  }),
  card: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.xl,
    boxShadow: shadows.card,
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  },
  innerCard: {
    backgroundColor: colors.surfaceSolid,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    boxShadow: shadows.soft,
  },
};

export const buttons = {
  primary: {
    border: 'none',
    borderRadius: radius.pill,
    padding: '13px 22px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    backgroundColor: colors.text,
    color: '#ffffff',
    boxShadow: '0 10px 22px rgba(15, 23, 42, 0.18)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  accent: {
    border: 'none',
    borderRadius: radius.pill,
    padding: '13px 22px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    backgroundColor: colors.accent,
    color: '#ffffff',
    boxShadow: '0 10px 22px rgba(15, 118, 110, 0.28)',
  },
  ghost: {
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: radius.pill,
    padding: '12px 20px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: colors.text,
  },
  subtle: {
    border: 'none',
    borderRadius: radius.pill,
    padding: '12px 20px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    backgroundColor: '#e2e8f0',
    color: colors.text,
  },
  danger: {
    border: 'none',
    borderRadius: radius.pill,
    padding: '13px 22px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    backgroundColor: '#0f172a',
    color: '#ffffff',
  },
};

export const inputs = {
  field: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 16px',
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSolid,
    fontSize: '0.98rem',
    color: colors.text,
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    fontFamily: 'inherit',
  },
  fieldFocus: {
    borderColor: colors.accent,
    boxShadow: `0 0 0 4px ${colors.accentSoft}`,
  },
  label: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: colors.text,
    marginBottom: '8px',
    letterSpacing: '0.01em',
  },
  helper: {
    fontSize: '0.82rem',
    color: colors.textSubtle,
    marginTop: '6px',
  },
};

export const pills = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: radius.pill,
    fontSize: '0.8rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  muted: {
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    color: colors.text,
  },
  accent: {
    backgroundColor: colors.accentSoft,
    color: colors.accent,
  },
  success: {
    backgroundColor: colors.successSoft,
    color: colors.success,
  },
  warning: {
    backgroundColor: colors.warningSoft,
    color: colors.warning,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
  },
  info: {
    backgroundColor: colors.infoSoft,
    color: colors.info,
  },
};
