export const colors = {
  bg: '#eef2f9',
  bgGradient: 'linear-gradient(180deg, #f5f7fb 0%, #eef2f9 100%)',
  surface: '#ffffff',
  surfaceSolid: '#ffffff',
  surfaceMuted: '#f8fafc',
  border: 'rgba(15, 23, 42, 0.08)',
  borderStrong: 'rgba(15, 23, 42, 0.14)',
  text: '#0f172a',
  textMuted: '#475569',
  textSubtle: '#64748b',
  accent: '#0f766e',
  accentSoft: 'rgba(15, 118, 110, 0.12)',
  accentGradient: 'linear-gradient(135deg, #0f766e 0%, #1d4ed8 100%)',
  driver: '#0f766e',
  passenger: '#1d4ed8',
  admin: '#7c3aed',
  success: '#15803d',
  successSoft: '#dcfce7',
  warning: '#b45309',
  warningSoft: '#fef3c7',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
  info: '#1d4ed8',
  infoSoft: '#dbeafe',
};

export const radius = {
  sm: '10px',
  md: '14px',
  lg: '20px',
  xl: '24px',
  pill: '999px',
};

export const shadows = {
  card: '0 10px 30px rgba(15, 23, 42, 0.06)',
  soft: '0 4px 14px rgba(15, 23, 42, 0.05)',
  lift: '0 18px 40px rgba(15, 23, 42, 0.12)',
};

export const spacing = {
  xs: '6px',
  sm: '10px',
  md: '14px',
  lg: '18px',
  xl: '24px',
  xxl: '36px',
};

export const typography = {
  display: {
    fontSize: '1.8rem',
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    fontWeight: 800,
    color: colors.text,
  },
  h2: {
    fontSize: '1.2rem',
    lineHeight: 1.25,
    fontWeight: 800,
    color: colors.text,
    letterSpacing: '-0.015em',
  },
  h3: {
    fontSize: '1rem',
    lineHeight: 1.3,
    fontWeight: 700,
    color: colors.text,
  },
  body: {
    fontSize: '0.92rem',
    lineHeight: 1.55,
    color: colors.textMuted,
  },
  small: {
    fontSize: '0.8rem',
    lineHeight: 1.5,
    color: colors.textSubtle,
  },
  eyebrow: {
    fontSize: '0.68rem',
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
};

export const surfaces = {
  card: {
    backgroundColor: colors.surfaceSolid,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.xl,
    boxShadow: shadows.card,
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
    padding: '14px 22px',
    fontSize: '0.95rem',
    fontWeight: 800,
    cursor: 'pointer',
    background: colors.accentGradient,
    color: '#ffffff',
    boxShadow: '0 12px 26px rgba(15, 118, 110, 0.28)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
    width: '100%',
  },
  accent: {
    border: 'none',
    borderRadius: radius.pill,
    padding: '14px 22px',
    fontSize: '0.95rem',
    fontWeight: 800,
    cursor: 'pointer',
    background: colors.accentGradient,
    color: '#ffffff',
    boxShadow: '0 12px 26px rgba(15, 118, 110, 0.28)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
    width: '100%',
  },
  ghost: {
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: radius.pill,
    padding: '12px 20px',
    fontSize: '0.92rem',
    fontWeight: 700,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: colors.text,
    transition: 'background-color 0.15s ease',
  },
  subtle: {
    border: 'none',
    borderRadius: radius.pill,
    padding: '12px 18px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    backgroundColor: '#eef2f9',
    color: colors.text,
    transition: 'background-color 0.15s ease',
  },
  danger: {
    border: 'none',
    borderRadius: radius.pill,
    padding: '12px 18px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    color: '#ffffff',
    fontSize: '1.05rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(6px)',
  },
};

export const inputs = {
  field: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '15px 16px',
    border: `1.5px solid ${colors.border}`,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    fontSize: '0.98rem',
    color: colors.text,
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
    fontFamily: 'inherit',
  },
  fieldFocus: {
    borderColor: colors.accent,
    backgroundColor: '#ffffff',
    boxShadow: `0 0 0 4px ${colors.accentSoft}`,
  },
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: colors.text,
    marginBottom: '8px',
    letterSpacing: '0.02em',
  },
  helper: {
    fontSize: '0.78rem',
    color: colors.textSubtle,
    marginTop: '6px',
  },
};

export const pills = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    borderRadius: radius.pill,
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  muted: {
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
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
