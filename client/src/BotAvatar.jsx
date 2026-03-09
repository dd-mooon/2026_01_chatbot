/** 봇 캐릭터 아바타 (코니) */
export default function BotAvatar({ size = 40, className = '' }) {
  const s = size
  return (
    <div
      className={`shrink-0 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md ${className}`}
      style={{ width: s, height: s }}
      aria-hidden
    >
      <svg
        width={s * 0.6}
        height={s * 0.6}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 머리 */}
        <circle cx="24" cy="22" r="14" fill="white" opacity="0.95" />
        {/* 눈 */}
        <ellipse cx="18" cy="20" rx="3" ry="4" fill="#0f766e" />
        <ellipse cx="30" cy="20" rx="3" ry="4" fill="#0f766e" />
        {/* 눈 하이라이트 */}
        <circle cx="19" cy="19" r="1" fill="white" />
        <circle cx="31" cy="19" r="1" fill="white" />
        {/* 입 (미소) */}
        <path
          d="M18 28 Q24 32 30 28"
          stroke="#0f766e"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* 안테나 */}
        <line x1="24" y1="8" x2="24" y2="2" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="2" r="2" fill="white" />
      </svg>
    </div>
  )
}
