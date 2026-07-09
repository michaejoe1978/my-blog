# 지침: 2048 게임 구현 (Build 단계)

## 배경
프로젝트 루트의 `CLAUDE.md`를 먼저 읽고 전체 컨벤션(작업 사이클, 서브에이전트 규칙, 웹앱 규칙)을 파악하라.
계획 문서는 `D:\ParkKiSung\Temp\ClaudeCode_Exam\apps\2048\spec.md`에 이미 작성되어 있고 사용자 승인을 받았다. 이 spec.md를 그대로 구현 기준으로 삼는다.

## 네가 할 일
`spec.md`에 정의된 대로 아래 파일을 작성하라.

- `D:\ParkKiSung\Temp\ClaudeCode_Exam\apps\2048\index.html`
- `D:\ParkKiSung\Temp\ClaudeCode_Exam\apps\2048\style.css`
- `D:\ParkKiSung\Temp\ClaudeCode_Exam\apps\2048\script.js`

### 구현 요구사항 (spec.md 요약)
- 4x4 그리드, 2차원 배열(board)로 상태 관리, 빈칸은 0.
- 시작 시 랜덤 위치에 타일 2개 생성 (2: 90%, 4: 10%).
- 방향키(↑↓←→)로 이동. 모든 방향을 "왼쪽 이동"으로 정규화해 압축→병합→재압축→역변환하는 표준 알고리즘 사용. 한 턴에 같은 타일은 한 번만 병합(연쇄 병합 금지).
- 그리드에 실제 변화가 있었을 때만 점수 갱신 + 새 타일 랜덤 생성.
- 점수판: 현재 점수 + localStorage 기반 최고 점수(BEST), 매 턴 갱신.
- 2048 타일 생성 시 승리 오버레이("You Win!" + 계속하기/새 게임 버튼). 이동 불가 시 게임오버 오버레이("Game Over" + 최종 점수 + 다시 시작 버튼).
- 새 게임 버튼은 상단에 항상 노출.
- 모바일 대응: touchstart/touchend 기반 스와이프 제스처로 동일한 move(direction) 호출, 그리드에 `touch-action: none`, 반응형 크기(`min(90vw, 420px)` 등 vw/clamp 기반), 터치 타깃 44px 이상.
- 외부 라이브러리 없이 순수 Vanilla HTML/CSS/JS로 구현. CDN 폰트는 선택사항(필수 아님).
- 방향키 입력 시 `event.preventDefault()`로 페이지 스크롤 방지.

### 코딩 컨벤션 (CLAUDE.md 준수)
- CSS: 시맨틱 클래스명, CSS 커스텀 속성(변수)으로 색상 관리.
- JS: camelCase, ES6+ 문법.
- 들여쓰기: 2칸 스페이스.

## 제약 (매우 중요)
- **오직 `/apps/2048/` 폴더 안의 파일만 생성/수정한다.** 블로그 루트의 `index.html`, `style.css`, `script.js`, `posts.json`, `posts/` 등 다른 어떤 파일도 건드리지 않는다.
- git 커밋은 하지 않는다 (Embed 단계에서 별도로 처리).
- 브라우저 실행 테스트(live-server 등)는 이번 단계에서 하지 않아도 된다. 다음 Review 단계에서 별도 서브에이전트가 검증한다.

## 완료 후 보고
작성한 파일 목록과 구현 시 특이사항(있다면)을 요약해서 보고하라.
