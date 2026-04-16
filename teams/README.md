# Microsoft Teams에 코니(웹) 탭으로 넣기

팀즈 **개인용 정적 탭**·배포 챗봇 URL **오픈** 방식.  
회사 테넌트 **커스텀 앱 업로드** 불가 시 진행 **불가**·선행 **IT / Teams 관리자** “조직용 사용자 지정 앱 업로드” 가능 여부 **확인** 권장.

## 준비물

1. **HTTPS 프론트 주소** (예: Vercel `https://2026-01-chatbot.vercel.app`)  
2. **API 주소** 도메인 상이 시(예: Railway) `manifest.json` **`validDomains`** 해당 호스트 **포함** 필요 가능 (탭 내 API `fetch` 시 팀즈 도메인 검사)  
3. **아이콘** — 본 폴더 **포함**  
   - `color.png` — **192×192**, `client/public/connie-avatar.png` 정사각 중앙 크롭·리사이즈  
   - `outline.png` — **32×32**, 흰 원 실루엣(팀즈 아웃라인 규격 단순 형태). 브랜드 교체 시 동일 크기·투명 배경·흰 전경 **권장**

## 매니페스트 수정

[manifest.json](manifest.json) 열어 **본인 환경**에 맞게 **변경**.

| 항목 | 설명 |
|------|------|
| `id` | **새 GUID** 교체 ([온라인 GUID 생성기](https://www.uuidgenerator.net/) 등). 재업로드 시 버전만 상향·통상 `id` 고정 |
| `staticTabs[0].contentUrl` / `websiteUrl` | 챗봇 **프론트** URL (끝 `/` 배포에 맞춤) |
| `validDomains` | `contentUrl` 호스트(예: `2026-01-chatbot.vercel.app`). API **다른 도메인** 시 해당 호스트 배열 **추가** |
| `developer.*Url` | 회사 정책 **개인정보처리방침·약관** URL 교체. 없을 시 동일 도메인 루트로 패키지 검증 통과 사례·**실서비스 정책 URL 권장** |

## 패키지 만들기

`teams/` 폴더에서 아래 **3파일** 선택·**zip** 압축.

- `manifest.json` (수정본)  
- `color.png`  
- `outline.png`  

폴더 단위가 아니라 **파일만** zip 루트 배치. 압축 후 zip 최상위 `manifest.json` 노출 **확인**.

## 팀즈에 올리기 (개인 테스트)

1. Teams 데스크톱 또는 웹 로그인  
2. 왼쪽 **앱** → **앱 관리** → **사용자 지정 앱 업로드** (메뉴명 클라이언트 언어·버전별 **상이 가능**)  
3. 생성 **zip** 선택  
4. 설치 후 왼쪽 앱 목록 **코니** 생성·탭 클릭·웹 챗봇 iframe **오픈**

**막힘:** 테넌트 사용자 지정 앱 비활성. 관리자 **앱 승인** 또는 **허용 목록 등록** **요청**.

## 서버 CORS

탭 iframe 출처 통상 **프론트 배포 도메인**(예: `*.vercel.app`).  
백엔드 `ALLOWED_ORIGINS`(또는 `config.js` production 기본값)에 **해당 프론트 URL** **포함**·채팅 API **동작 전제**. ([DEPLOY.md](../DEPLOY.md) **참고**)

## 한계

- **팀즈 로그인**과 **코니 관리자 로그인** **별개** (SSO: Azure AD 등 **별도 작업**)  
- **채널/팀 탭**: 매니페스트 `team` 스코프·별도 탭 정의 **필요 가능**. 현 매니페스트 **개인(personal)** 탭만 **포함**

## 참고

- [Teams 앱 매니페스트 스키마](https://learn.microsoft.com/microsoftteams/platform/resources/schema/manifest-schema)  
- [정적 탭](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/create-personal-tab)
