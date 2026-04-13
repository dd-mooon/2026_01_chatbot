# Microsoft Teams에 코니(웹) 탭으로 넣기

팀즈에서 **개인용 정적 탭**으로 배포된 챗봇 URL을 여는 방식입니다.  
회사 테넌트에서 **커스텀 앱 업로드**가 막혀 있으면 진행할 수 없으니, 먼저 **IT / Teams 관리자**에게 “조직용 사용자 지정 앱 업로드” 가능 여부를 확인하세요.

## 준비물

1. **HTTPS로 배포된 프론트 주소** (예: Vercel `https://2026-01-chatbot.vercel.app`)  
2. **API 주소**가 위와 다른 도메인이면(예: Railway), 그 호스트도 `manifest.json`의 **`validDomains`**에 넣어야 할 수 있습니다. (탭 안에서 API로 `fetch`할 때 팀즈가 도메인을 검사합니다.)  
3. **아이콘** — 이 폴더에 이미 포함됨.  
   - `color.png` — **192×192**, `client/public/connie-avatar.png`를 정사각 중앙 크롭 후 리사이즈.  
   - `outline.png` — **32×32**, 흰 원 실루엣(팀즈용 아웃라인 아이콘 규격에 맞춘 단순 형태). 브랜드용으로 바꾸려면 동일 크기·투명 배경·흰색 전경으로 교체하면 됩니다.

## 매니페스트 수정

[manifest.json](manifest.json)을 열어 다음을 **본인 환경에 맞게** 바꿉니다.

| 항목 | 설명 |
|------|------|
| `id` | **새 GUID**로 교체 ([온라인 GUID 생성기](https://www.uuidgenerator.net/) 등). 앱을 다시 올릴 때마다 버전만 올리면 되고, 보통 `id`는 고정합니다. |
| `staticTabs[0].contentUrl` / `websiteUrl` | 실제 챗봇 **프론트** URL (끝에 `/` 유무는 배포에 맞춤). |
| `validDomains` | `contentUrl`의 호스트(예: `2026-01-chatbot.vercel.app`). API가 **다른 도메인**이면 그 호스트도 배열에 추가. |
| `developer.*Url` | 회사 정책에 맞는 **개인정보처리방침·약관** URL이 있으면 교체. 없으면 일단 동일 도메인 루트를 넣은 상태로 두면 패키지 검증은 통과하는 경우가 많지만, **실서비스는 정책 URL을 권장**합니다. |

## 패키지 만들기

`teams/` 폴더에서 아래 **3개 파일**을 골라 **압축(zip)** 합니다.

- `manifest.json` (수정 완료본)  
- `color.png`  
- `outline.png`  

폴더째가 아니라 **파일만** zip 루트에 들어가게 하세요. (압축 후 `manifest.json`이 zip 최상위에 보이면 OK.)

## 팀즈에 올리기 (개인 테스트)

1. Teams 데스크톱 또는 웹 로그인  
2. 왼쪽 **앱** → **앱 관리** → **사용자 지정 앱 업로드** (메뉴 이름은 클라이언트 언어/버전에 따라 다를 수 있음)  
3. 만든 **zip** 선택  
4. 설치 후 왼쪽 앱 목록에 **코니**가 생기면 탭 클릭 → 웹 챗봇이 iframe으로 열립니다.

**막히면:** 테넌트에서 사용자 지정 앱이 비활성화된 경우입니다. 관리자에게 **앱 승인** 또는 **허용 목록 등록**을 요청해야 합니다.

## 서버 CORS

탭 iframe의 출처는 보통 **프론트 배포 도메인**(예: `*.vercel.app`)입니다.  
백엔드 `ALLOWED_ORIGINS`(또는 `config.js`의 production 기본값)에 **그 프론트 URL**이 포함되어 있어야 채팅 API가 동작합니다. ([DEPLOY.md](../DEPLOY.md) 참고)

## 한계

- **팀즈 로그인과 코니 관리자 로그인은 별개**입니다. (SSO를 붙이려면 Azure AD 연동 등 추가 작업이 필요합니다.)  
- **채널/팀 탭**으로 넣으려면 매니페스트에 `team` 스코프와 다른 탭 정의가 필요할 수 있습니다. 지금 매니페스트는 **개인(personal)** 탭만 포함합니다.

## 참고

- [Teams 앱 매니페스트 스키마](https://learn.microsoft.com/microsoftteams/platform/resources/schema/manifest-schema)  
- [정적 탭](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/create-personal-tab)
