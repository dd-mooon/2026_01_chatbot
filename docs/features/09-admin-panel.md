# 관리자 페이지 (`/admin.html`)

## 목적

별도 빌드 없이 **Express 정적 파일**으로 제공되는 단일 HTML 페이지에서, 지식 베이스·미답변·FAQ·첨부 업로드를 관리한다.

## 로그인

- 최초 접속 시 **로그인 / 회원가입** 화면이 표시된다. (`@concentrix.com` 고정)  
- 상세: [11-admin-auth.md](11-admin-auth.md)

## 접속

- 서버 기동 후: `http://localhost:3001/admin.html` (포트는 `PORT` 환경 변수)  
- 루트 `GET /` 응답 JSON에도 `admin` 안내가 있다.

## 주요 섹션

### 1. 지식 추가 / 수정

- **키워드**: 쉼표로 구분해 여러 개 입력 (내부적으로 배열로 저장).  
- **답변 본문**, **참고 링크** 입력.  
- **첨부**: 파일 선택 → **업로드** 버튼으로 `POST /api/upload` 호출 → 성공 시 숨은 필드에 URL·파일명 설정, 칩 UI 표시.  
- **추가** / 편집 모드일 때 **저장**, **취소**.  
- 미답변 목록에서 “답 등록”으로 넘어오면 `pendingUnansweredId` 등으로 이어 붙일 수 있다.

### 2. 지식 베이스

- **목록 불러오기**: `GET /api/knowledge`로 리스트 표시.  
- 각 행: 답 미리보기, 메타, **FAQ 체크박스**(최대 3개), **수정**, **삭제**.  
- FAQ 선택은 `PUT /api/faq`로 ID 배열을 저장하는 방식과 연동된다.

### 3. 미답변 질문

- **목록 불러오기**: `GET /api/unanswered`.  
- **선택 삭제** / **전체 지우기**: `DELETE /api/unanswered/bulk`.  
- **답 등록**: 해당 질문을 지식 추가 폼에 채워 넣는 플로우.  
- **제거**: 개별 `DELETE /api/unanswered/:id`.

## 헤더·상태

- 서버 헬스 등 간단한 연결 상태를 표시하는 영역이 있다.  
- 채팅 클라이언트로 가는 링크 안내가 있다.

## 관련 API 문서

- 인증: [11-admin-auth.md](11-admin-auth.md)  
- 지식: [05-knowledge-api.md](05-knowledge-api.md)  
- 미답변: [06-unanswered.md](06-unanswered.md)  
- FAQ: [07-faq-chips.md](07-faq-chips.md)  
- 업로드: [08-file-upload.md](08-file-upload.md)  

## 소스 위치

- `server/public/admin.html` — 마크업 + 인라인 스크립트로 API 호출  
