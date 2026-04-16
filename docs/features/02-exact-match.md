# Exact Match (키워드 매칭)

## 목적

ChromaDB·LLM **미경유**. **등록 키워드가 질문에 포함** 시 저장 답변 **즉시·동일 반환**.  
규칙 명확 안내(예: “건전지”, “회식”)에 **적합**.

## 동작 규칙

구현: `server/services/knowledge.js`의 `findExactMatch(question)`.

1. `data/exact-match-knowledge.json` 배열 **로드**
2. 사용자 질문 **소문자 변환**·앞뒤 공백 **제거**
3. 각 지식 항목 `keywords` 순회·질문 문자열에 키워드(소문자 비교) **부분 문자열 포함** 여부 **검사**
4. **선취 매칭** (배열 순서 **우선순위**)
5. 매칭 시 **반환** 값:  
   - `answer`, `refLink`, `attachmentUrl`, `attachmentName`, `matchedKeyword`, `type: 'exact_match'`

매칭 없음 → `null`·채팅 파이프라인 ChromaDB 검색 단계로 **이행**

## JSON 항목 스키마 (개념)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | 문자열 | 고유 ID (관리자·API 생성) |
| `keywords` | 문자열 배열 | 질문에 하나라도 포함 시 매칭 |
| `answer` | 문자열 | 챗봇 표시 답 |
| `refLink` | 문자열 | 선택: 관련 URL |
| `attachmentUrl` | 문자열 | 선택: 업로드 파일 URL (`/uploads/...`) |
| `attachmentName` | 문자열 | 선택: 원본 파일명 표시용 |

## 관리 경로

- **파일 직접 편집**: `server/data/exact-match-knowledge.json`
- **API**: `GET/POST/PUT/DELETE /api/knowledge` — 상세 [05-knowledge-api.md](05-knowledge-api.md) **참고**
- **관리 UI**: `/admin.html` — [09-admin-panel.md](09-admin-panel.md) **참고**

## 주의사항

- 키워드 과도 단순·빈번(예: “안”) 시 의도치 않은 매칭 **발생 가능**  
- 길고 구체적 키워드·순서·범위 **조정** 권장  
- 지식 추가 시 API: 동일 내용 ChromaDB **반영**·RAG **동기화** (키워드 매칭 실패 시에도 의미 검색 **연계 가능**)
