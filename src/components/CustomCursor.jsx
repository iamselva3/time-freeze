import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const posRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    setIsVisible(true);

    const onMouseMove = (e) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;

      // Check for data-cursor attribute
      let target = e.target;
      let text = '';
      while (target && target !== document.body) {
        if (target.dataset?.cursor) {
          text = target.dataset.cursor;
          break;
        }
        if (target.tagName === 'A' || target.tagName === 'BUTTON') {
          text = text || '';
          break;
        }
        target = target.parentElement;
      }
      setCursorText(text);
      setIsHovered(Boolean(text) || target?.tagName === 'A' || target?.tagName === 'BUTTON');
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let frameId;
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const render = () => {
      posRef.current.x = lerp(posRef.current.x, posRef.current.targetX, 0.18);
      posRef.current.y = lerp(posRef.current.y, posRef.current.targetY, 0.18);

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${posRef.current.targetX}px, ${posRef.current.targetY}px, 0) translate(-50%, -50%)`;
      }

      frameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Outer Magnetic Ring */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 rounded-full flex items-center justify-center transition-[width,height,background-color,border-color] duration-300 ease-out ${
          cursorText
            ? 'w-20 h-20 bg-charcoal-900/80 border border-gold-400/80 backdrop-blur-sm'
            : isHovered
            ? 'w-14 h-14 bg-oxblood-900/30 border border-gold-300/60'
            : isClicking
            ? 'w-6 h-6 border border-gold-200'
            : 'w-9 h-9 border border-gold-400/40'
        }`}
        style={{
          boxShadow: isHovered ? '0 0 20px rgba(232, 197, 122, 0.25)' : 'none',
        }}
      >
        {cursorText && (
          <span className="text-[9px] font-sans font-semibold tracking-widest uppercase text-gold-300">
            {cursorText}
          </span>
        )}
      </div>

      {/* Inner Pinpoint Dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-gold-200 transition-opacity duration-200 ${
          cursorText ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          boxShadow: '0 0 8px #FCE095',
        }}
      />
    </div>
  );
}
