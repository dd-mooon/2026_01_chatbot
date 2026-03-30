/** 봇 아바타 — 코니 캐릭터 이미지 */
export default function BotAvatar({ size = 40, className = '' }) {
  const s = size;
  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden bg-white shadow-sm ${className}`}
      style={{ width: s, height: s }}
      aria-hidden
    >
      <img
        src="/assets/connie.png"
        alt=""
        className="w-full h-full object-cover object-center scale-[1.02]"
        draggable={false}
      />
    </div>
  );
}
