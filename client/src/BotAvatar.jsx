/** 봇 아바타 — 코니 캐릭터 이미지 (responding: 외부 제어, pulseMs: 마운트 후 일정 시간만 활성) */
import { useState, useEffect } from 'react';

export default function BotAvatar({
  size = 40,
  className = '',
  responding = false,
  pulseMs = 0,
}) {
  const [pulseActive, setPulseActive] = useState(pulseMs > 0);

  useEffect(() => {
    if (pulseMs <= 0) return undefined;
    const id = setTimeout(() => setPulseActive(false), pulseMs);
    return () => clearTimeout(id);
  }, [pulseMs]);

  const s = size;
  const showActive = pulseMs > 0 ? pulseActive : responding;
  const src = showActive ? '/assets/connie-active.png' : '/assets/connie.png';

  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden bg-white shadow-sm ${className}`}
      style={{ width: s, height: s }}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover object-center scale-[1.02]"
        draggable={false}
      />
    </div>
  );
}
