# 관리자 로그인·회원가입

## 목적

`/admin.html` 및 **지식·업로드·미답변·FAQ 수정** API를 **로그인한 사내 계정**만 쓰도록 보호한다.  
비밀번호는 서버에서 **scrypt**로 해시해 `admin-users.json`에 저장한다.

## 이메일 정책

- 허용 도메인: **`@concentrix.com`** 만 (`server/config.js`의 `ADMIN_EMAIL_DOMAIN`).
- 로컬 파트(골뱅이 앞): 영문·숫자 및 `._+-`, 길이 1~64자.
- 관리자 화면에서는 **아이디만 입력**하고 UI에 `@concentrix.com`이 고정 표시된다.

## 인증 API

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| `POST` | `/api/auth/register` | 불필요 | 회원가입 후 세션 쿠키 발급 |
| `POST` | `/api/auth/login` | 불필요 | 로그인 후 세션 쿠키 발급 |
| `POST` | `/api/auth/logout` | (있으면 무효화) | 세션 삭제·쿠키 제거 |
| `GET` | `/api/auth/me` | 쿠키 | `{ user: { email } }` 또는 401 |

요청 본문 예: `{ "email": "user@concentrix.com", "password": "..." }`

## 회원가입 제한

- **첫 계정**: 누구나 가입 가능 (`admin-users.json`의 `users`가 비어 있을 때).
- **추가 계정**: 기본적으로 비활성. 서버 실행 시 **`ADMIN_SIGNUP_OPEN=true`** 환경 변수를 주면 추가 가입 허용.

```bash
ADMIN_SIGNUP_OPEN=true npm start
```

## 세션

- 쿠키 이름: **`connie_admin`** (httpOnly, `Path=/`, `SameSite=lax`, 프로덕션에서는 `Secure` 권장).
- 세션 데이터는 **프로세스 메모리**에 보관한다. **서버 재시작 시 전원 로그아웃**된다.

## 보호되는 API (로그인 필요)

미들웨어: `server/middleware/requireAdminAuth.js` — 쿠키에 유효한 세션이 없으면 **401**.

| 영역 | 경로 |
|------|------|
| 지식 | `GET/POST/PUT/DELETE /api/knowledge` … |
| 업로드 | `POST /api/upload` |
| 미답변 | `GET/DELETE /api/unanswered` … |
| FAQ 수정 | `PUT /api/faq` |

**공개로 둔 API** (채팅 클라이언트·봇용):

- `POST /api/chat`, `GET /api/ollama-status`, **`GET /api/faq`** (칩용 목록)

## CORS

- `credentials: true` + `origin: true` 로 쿠키 전달이 가능하도록 설정되어 있다 (`server/index.js`).

## 관련 파일

| 파일 | 역할 |
|------|------|
| `server/routes/auth.js` | register / login / logout / me |
| `server/services/adminUsers.js` | 사용자 목록, 해시, `validateEmail` |
| `server/services/adminSessions.js` | 세션 토큰 발급·검증 |
| `server/data/admin-users.json` | 계정 저장소 |
| `server/public/admin.html` | 로그인·회원가입 UI, `fetch` 시 `credentials: 'include'` |

## 운영 시 참고

- `admin-users.json`에는 **비밀번호 해시**만 저장된다. 저장소에 올릴지 여부는 팀 정책에 따른다.
- API/정적 라우트 순서: **API 라우트가 `express.static`보다 먼저** 등록되어 `/api/*`가 우선 처리된다.

## 같이 보면 좋은 문서

- [09-admin-panel.md](09-admin-panel.md) — 어드민 화면 구성  
- [05-knowledge-api.md](05-knowledge-api.md), [08-file-upload.md](08-file-upload.md) — 보호되는 엔드포인트 상세  
