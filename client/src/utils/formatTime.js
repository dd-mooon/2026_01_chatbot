/** 말풍선 아래 메타 줄용 (예: 오전 10:24) */
export function formatMetaTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
}
