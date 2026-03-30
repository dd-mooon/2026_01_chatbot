# 코니(Connie) 기능별 문서

프로젝트 기능을 **역할 단위**로 나눈 상세 설명입니다. 배포·설치는 루트의 `README.md`, `DEPLOY.md`를 참고하세요.

| 문서 | 내용 |
|------|------|
| [features/01-chat-pipeline.md](features/01-chat-pipeline.md) | **채팅 API** (`POST /api/chat`)와 답변이 결정되는 전체 순서 |
| [features/02-exact-match.md](features/02-exact-match.md) | **키워드 Exact Match** — 질문에 키워드가 포함되면 등록 답을 그대로 반환 |
| [features/03-chromadb-rag.md](features/03-chromadb-rag.md) | **ChromaDB** 벡터 검색, RAG용 컬렉션, `ingest.js` |
| [features/04-ollama.md](features/04-ollama.md) | **Ollama** 연동, RAG 프롬프트 vs 일반 지식 답변, 타임아웃·환경 변수 |
| [features/05-knowledge-api.md](features/05-knowledge-api.md) | **지식 CRUD** REST API, JSON·Chroma 동기화 |
| [features/06-unanswered.md](features/06-unanswered.md) | **미답변 로그** 저장·조회·삭제 API |
| [features/07-faq-chips.md](features/07-faq-chips.md) | **FAQ 칩** (최대 3개), `/api/faq` |
| [features/08-file-upload.md](features/08-file-upload.md) | **파일 업로드** (`POST /api/upload`), 용량·저장 경로 |
| [features/09-admin-panel.md](features/09-admin-panel.md) | **관리자 페이지** (`/admin.html`) — 지식·미답변·FAQ |
| [features/10-client-chat-ui.md](features/10-client-chat-ui.md) | **React 채팅 UI** — 훅, 컴포넌트, Teams 스타일 |
| [features/11-admin-auth.md](features/11-admin-auth.md) | **관리자 로그인·회원가입** — `@concentrix.com`, 세션, 보호 API |

### 읽는 순서 제안

1. 답이 어떻게 나오는지 전체 그림: `01-chat-pipeline.md`  
2. 백엔드 세부: `02` → `03` → `04`  
3. 데이터·운영: `05` → `06` → `07` → `08` → `09`  
4. 관리자 보안: `11-admin-auth.md` (어드민 사용 시)  
5. 사용자 화면: `10-client-chat-ui.md`
