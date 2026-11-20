import { useEffect, useRef, useState } from 'react';

type Burst = { id: number; x: number; y: number };
const SPARKS = [0, 1, 2, 3, 4, 5, 6, 7];

export function ClickEffects() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timers = new Set<number>();

    function onClick(event: MouseEvent) {
      if (motion.matches || event.detail === 0 || event.button !== 0) return;
      const id = nextId.current++;
      setBursts((current) => [...current.slice(-7), { id, x: event.clientX, y: event.clientY }]);
      const timer = window.setTimeout(() => {
        setBursts((current) => current.filter((burst) => burst.id !== id));
        timers.delete(timer);
      }, 1000);
      timers.add(timer);
    }

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="click-effects" aria-hidden="true">
      {bursts.map((burst) => (
        <span key={burst.id} className="click-burst" style={{ left: burst.x, top: burst.y }}>
          {SPARKS.map((spark) => (
            <i key={spark} />
          ))}
        </span>
      ))}
    </div>
  );
}
