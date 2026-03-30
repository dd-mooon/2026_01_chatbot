# Exact Match (키워드 매칭)

## 목적

ChromaDB·Ollama를 거치지 않고, **등록된 키워드가 질문에 포함되면** 저장해 둔 답변을 **즉시·동일하게** 반환한다.  
규칙이 명확한 안내(예: “건전지”, “회식”)에 적합하다.

## 동작 규칙

구현: `server/services/knowledge.js`의 `findExactMatch(question)`.

1. `data/exact-match-knowledge.json`을 배열로 로드한다.
2. 사용자 질문을 **소문자로 변환**하고 앞뒤 공백을 제거한다.
3. 각 지식 항목의 `keywords` 배열을 순서대로 보며, **질문 문자열에 키워드(소문자 비교)가 부분 문자열로 포함**되는지 검사한다.
4. **먼저 매칭되는 항목**이 선택된다 (배열 순서가 우선순위).
5. 매칭되면 다음을 반환한다.  
   - `answer`, `refLink`, `attachmentUrl`, `attachmentName`, `matchedKeyword`, `type: 'exact_match'`

매칭이 없으면 `null`이며, 채팅 파이프라인은 ChromaDB 검색으로 넘어간다.

## JSON 항목 스키마 (개념)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | 문자열 | 고유 ID (관리자·API에서 생성) |
| `keywords` | 문자열 배열 | 질문에 하나라도 포함되면 매칭 |
| `answer` | 문자열 | 챗봇이 보여 줄 답 |
| `refLink` | 문자열 | 선택: 관련 URL |
| `attachmentUrl` | 문자열 | 선택: 업로드 파일 URL (`/uploads/...`) |
| `attachmentName` | 문자열 | 선택: 원본 파일명 표시용 |

## 관리 경로

- **파일 직접 편집**: `server/data/exact-match-knowledge.json`
- **API**: `GET/POST/PUT/DELETE /api/knowledge` — 자세한 내용은 [05-knowledge-api.md](05-knowledge-api.md)
- **관리 UI**: `/admin.html` — [09-admin-panel.md](09-admin-panel.md)

## 주의사항

- 키워드가 너무 짧거나 흔하면(예: “안”) 의도치 않은 매칭이 날 수 있다.  
- 긴·구체적인 키워드를 쓰거나, 자주 겹치는 단어는 순서와 범위를 조정한다.  
- 지식 추가 시 API는 동일 내용을 ChromaDB에도 넣어 RAG와 동기화한다 (키워드 매칭에 실패해도 의미 검색으로 이어질 수 있음).
