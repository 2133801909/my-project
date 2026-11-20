import { useEffect, useRef } from 'react';

export function NebulaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !container || !context) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const colors = [
      getComputedStyle(canvas).getPropertyValue('--brand').trim(),
      getComputedStyle(canvas).getPropertyValue('--plum').trim(),
      getComputedStyle(canvas).getPropertyValue('--green').trim(),
    ];
    const count = 1800;
    const particles = new Float32Array(count * 4);
    const displacement = new Float32Array(count * 2);
    for (let i = 0; i < count; i += 1) {
      const offset = i * 4;
      particles[offset] = Math.random();
      particles[offset + 1] = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      particles[offset + 2] = Math.random();
      particles[offset + 3] = Math.random();
    }

    let width = 0;
    let height = 0;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerActive = false;

    function movePointer(event: PointerEvent) {
      if (!container || motion.matches || event.pointerType === 'touch') return;
      const bounds = container.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
      pointerActive = true;
    }

    function releasePointer() {
      pointerActive = false;
    }

    function draw(time: number) {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const elapsed = time * 0.0001;
      const heroHeight = Math.min(430, height);

      for (let color = 0; color < colors.length; color += 1) {
        context.fillStyle = colors[color];
        context.globalAlpha = color === 0 ? 0.55 : 0.4;
        context.beginPath();
        for (let i = color; i < count; i += colors.length) {
          const offset = i * 4;
          const xSeed = particles[offset];
          const spread = particles[offset + 1];
          const depth = particles[offset + 2];
          const phase = particles[offset + 3];
          const x = ((xSeed + elapsed * (0.2 + depth * 0.35)) % 1) * width;
          const band = i < count * 0.7 ? heroHeight : height;
          const y =
            band * (0.42 + 0.18 * Math.sin(xSeed * 6 + elapsed * 2 + phase * 3)) +
            spread * band * 0.43 +
            Math.sin(elapsed * 4 + phase * 6) * 12;
          const radius = 0.65 + depth * 1.15;
          const displacementIndex = i * 2;
          const dx = pointerX - x;
          const dy = pointerY - y;
          const distance = pointerActive ? Math.hypot(dx, dy) : 220;
          const pull = distance < 220 ? (1 - distance / 220) * 0.65 : 0;
          displacement[displacementIndex] += (dx * pull - displacement[displacementIndex]) * 0.08;
          displacement[displacementIndex + 1] +=
            (dy * pull - displacement[displacementIndex + 1]) * 0.08;
          const drawnX = x + displacement[displacementIndex];
          const drawnY = y + displacement[displacementIndex + 1];
          context.moveTo(drawnX + radius, drawnY);
          context.arc(drawnX, drawnY, radius, 0, Math.PI * 2);
        }
        context.fill();
      }
      context.globalAlpha = 1;
    }

    function tick(time: number) {
      draw(time);
      frame = window.requestAnimationFrame(tick);
    }

    function updateAnimation() {
      window.cancelAnimationFrame(frame);
      if (motion.matches || document.hidden) {
        releasePointer();
        displacement.fill(0);
        draw(0);
      } else {
        frame = window.requestAnimationFrame(tick);
      }
    }

    function resize() {
      if (!canvas || !container || !context) return;
      width = container.clientWidth;
      height = container.clientHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      draw(0);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    motion.addEventListener('change', updateAnimation);
    document.addEventListener('visibilitychange', updateAnimation);
    container.addEventListener('pointermove', movePointer);
    container.addEventListener('pointerleave', releasePointer);
    window.addEventListener('scroll', releasePointer, true);
    window.addEventListener('blur', releasePointer);
    resize();
    updateAnimation();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener('change', updateAnimation);
      document.removeEventListener('visibilitychange', updateAnimation);
      container.removeEventListener('pointermove', movePointer);
      container.removeEventListener('pointerleave', releasePointer);
      window.removeEventListener('scroll', releasePointer, true);
      window.removeEventListener('blur', releasePointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="dashboard-nebula" aria-hidden="true" />;
}
