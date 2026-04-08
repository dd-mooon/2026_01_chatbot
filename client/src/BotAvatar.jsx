/** 봇 아바타 — 코니 캐릭터 이미지 (responding: 답변·로딩 중 표정) */
export default function BotAvatar({ size = 40, className = '', responding = false }) {
  const s = size;
  const src = responding ? '/assets/connie-active.png' : '/assets/connie.png';
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
