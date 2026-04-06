/**
 * 빈 화면 — 환영 카피 (프로필은 헤더에만 표시)
 */
export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-2 pt-6 pb-10 max-w-md mx-auto min-w-0 w-full">
      <p className="text-[22px] sm:text-[24px] font-bold text-[#0f172a] leading-snug tracking-tight">
        반가워요!
      </p>
      <p className="mt-2 text-[20px] sm:text-[22px] font-semibold text-[#006666] leading-snug">
        코니가 도와드릴게요.
      </p>
      <p className="mt-5 text-[14px] text-[#64748b] leading-relaxed">
        Concentrix Catalyst 사내 지식 베이스를 바탕으로
        <br className="hidden sm:block" />
        스마트한 업무 가이드를 제공합니다. 무엇이 궁금하신가요?
      </p>
    </div>
  );
}
