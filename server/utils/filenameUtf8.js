/**
 * multipart `filename`이 Latin-1로 잘못 디코드된 경우 UTF-8로 복원.
 * 이미 올바른 UTF-8(한글 등)이면 원본 유지.
 */
export function normalizeMultipartOriginalName(name) {
  if (name == null || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  let recovered;
  try {
    recovered = Buffer.from(trimmed, 'latin1').toString('utf8');
  } catch {
    return trimmed;
  }

  if (recovered === trimmed) return trimmed;

  const cjkCount = (s) =>
    (s.match(/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\u4E00-\u9FFF\u3040-\u30FF]/g) || []).length;
  const replacementCount = (s) => (s.match(/\uFFFD/g) || []).length;

  if (cjkCount(recovered) > cjkCount(trimmed)) return recovered;
  if (replacementCount(trimmed) > replacementCount(recovered)) return recovered;
  return trimmed;
}
