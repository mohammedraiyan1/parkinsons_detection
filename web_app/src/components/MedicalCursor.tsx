import React, { useEffect, useRef, useState } from 'react';

export default function MedicalCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHovered(!!(t.closest('button') || t.closest('a') || t.closest('.card') || t.closest('.test-card') || t.closest('.nav-item')));
    };

    const animate = () => {
      if (dotRef.current) { dotRef.current.style.left = pos.current.x + 'px'; dotRef.current.style.top = pos.current.y + 'px'; }
      if (ringRef.current) { ringRef.current.style.left = pos.current.x + 'px'; ringRef.current.style.top = pos.current.y + 'px'; }
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', over); };
  }, []);

  return (
    <>
      <div ref={dotRef} className={`cursor-dot ${hovered ? 'hovered' : ''}`} />
      <div ref={ringRef} className={`cursor-ring ${hovered ? 'hovered' : ''}`} />
    </>
  );
}
