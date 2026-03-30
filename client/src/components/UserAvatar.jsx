/** 사용자 기본 프로필 아바타 — 원형 영역에 이미지 100% 채움 */
export default function UserAvatar({ size = 36, className = '' }) {
  const s = size;
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-[var(--catalyst-point)] shadow-sm ${className}`}
      style={{ width: s, height: s }}
      aria-hidden
    >
      <img
        src="/assets/user-default.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />
    </div>
  );
}
