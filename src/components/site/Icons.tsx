// Prototipdagi chiziqli belgilar (perks va shourum bloklari).

const PATHS: Record<string, JSX.Element> = {
  ruler: (
    <path
      d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4zM7.5 10.5l2-2M10.5 13.5l2-2M13.5 16.5l2-2"
      strokeLinecap="round"
    />
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" />
    </>
  ),
  factory: <path d="M2 20h20M4 20V8l5 3V8l5 3V4h6v16" strokeLinejoin="round" />,
  profile: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M8 3v18M12 3v18M16 3v18" strokeWidth="1.2" />
    </>
  ),
  sound: <path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" strokeLinecap="round" />,
  colors: (
    <>
      <circle cx="8" cy="8" r="4" />
      <circle cx="16" cy="16" r="4" />
    </>
  ),
};

export function Icon({ name, size = 22, color = 'var(--brass)' }: { name: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" aria-hidden="true">
      {PATHS[name] ?? PATHS.shield}
    </svg>
  );
}

export function BurgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="var(--white)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
