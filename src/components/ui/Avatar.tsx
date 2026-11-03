const tones = ['blue', 'green', 'plum', 'orange'] as const;

export function Avatar({
  name,
  size = 'md',
  decorative = false,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  decorative?: boolean;
}) {
  const letter = Array.from(name.trim())[0] ?? '同';
  const tone = tones[(letter.codePointAt(0) ?? 0) % tones.length];
  return (
    <span
      className={`avatar avatar--${size} avatar--${tone}`}
      aria-hidden={decorative ? 'true' : undefined}
    >
      {letter}
    </span>
  );
}
