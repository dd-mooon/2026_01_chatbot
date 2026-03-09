/**
 * 챗봇 캐릭터 아바타 - 코니(Connie)
 * CNX Catalyst 브랜드 컬러(#25e2cc) 적용 - 지식/AI를 상징하는 부엉이
 * sparkle: 대답할 때 보더 펄스 (커졌다 작아졌다)
 */
export default function ChatBotAvatar({ size = 40, className = '', sparkle = false }) {
  return (
    <div
      className={`flex-shrink-0 rounded-full flex items-center justify-center shadow-lg ring-2 ring-[#25e2cc]/40 ${sparkle ? 'avatar-pulse' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(180deg, #fefefe 0%, #e8fffc 100%)',
      }}
      title="코니"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[80%] h-[80%]"
      >
        {/* 부엉이 얼굴 */}
        <ellipse cx="24" cy="26" rx="14" ry="12" fill="white" stroke="#25e2cc" strokeWidth="1.5" />
        {/* 귀 깃 */}
        <path d="M14 14 L18 22" stroke="#25e2cc" strokeWidth="2" strokeLinecap="round" />
        <path d="M34 14 L30 22" stroke="#25e2cc" strokeWidth="2" strokeLinecap="round" />
        {/* 눈 - 큰 원형 */}
        <circle cx="18" cy="24" r="5" fill="#25e2cc" />
        <circle cx="30" cy="24" r="5" fill="#25e2cc" />
        <circle cx="19" cy="23" r="1.5" fill="white" />
        <circle cx="31" cy="23" r="1.5" fill="white" />
        {/* 부리 */}
        <path d="M22 30 L24 34 L26 30" fill="#25e2cc" />
      </svg>
    </div>
  )
}
