# 프로젝트 저장 위치

- 이전일: 2026-10-19 (Asia/Seoul)
- 개발 폴더: `G:\내 드라이브\경영\창업\2026_이루티\2026_프로젝트\to_do`
- 기존 위치: `C:\Users\user\.codex\.chatgpt-projects\g-p-6ad5cb5cffbc8191a5fe203317d69fc4`
- 기존 Git 기준 커밋: `c9e97c0`

코드·기획 문서·Supabase 스키마와 숨김 `.git` 폴더를 이전했다. 최초 복사 후
Git 추적 파일 21개의 SHA-256 일치 및 `git fsck --full` 성공을 확인했다.

Codex 사용자 설정의 새 경로 항목에 `trust_level = "trusted"`를 등록했다.
변경 전 사용자 설정은 `C:\Users\user\.codex\config.toml.before-planner-relocation-20261019`에
백업했다. 다른 프로젝트의 설정은 유지한다.

Google Drive 가상 파일시스템에 맞춰 `pnpm-workspace.yaml`에 hoisted 설치 및
파일 복사 방식을 지정했다. `node_modules`와 `.next`는 생성 파일이며 Git 관리
대상이 아니다. Google Drive 서버 동기화 완료 여부는 별도 확인이 필요하다.

## Codex에서 열기

Codex 앱에서 기존 폴더를 프로젝트로 추가할 때 위 `to_do` 폴더를 선택한다.
현재 ChatGPT 프로젝트 채팅의 기본 폴더를 바꾸거나 로컬 프로젝트를 등록하는
도구는 제공되지 않아, 앱의 프로젝트 연결은 사용자 조작이 필요하다. 기존
ChatGPT 프로젝트 폴더의 `AGENTS.md`에도 새 개발 위치를 기록했다.

GitHub 원격 저장소는 아직 연결하지 않았다.

## 이전 후 검증

- 새 경로에서 `pnpm install --frozen-lockfile --force` 완료.
- 새 경로에서 `pnpm lint`, `pnpm typecheck`, `pnpm build` 모두 통과.
- 기존 작업 폴더의 코드·Git·생성 캐시는 다음 복구용 로컬 백업으로 이동:
  `C:\Users\user\.codex\.relocation-backups\ai-work-planner-20261019`.
- 기존 ChatGPT 작업 폴더에는 새 경로를 안내하는 `AGENTS.md`와 읽기 전용
  `sources/`만 남긴다.
