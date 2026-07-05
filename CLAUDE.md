# CLAUDE.md

## 프로젝트 개요

마크다운(.md) 파일을 읽어서 블로그 웹사이트로 변환하는 정적 블로그 생성기.
프레임워크 없이 순수 HTML, CSS, JavaScript만 사용.

## 기술 스택

- HTML5, CSS3, Vanilla JavaScript (프레임워크/라이브러리 없음)
- 마크다운 파싱: 직접 구현 또는 경량 라이브러리(marked.js 등) 사용 가능

## 디자인 요구사항

- 깔끔하고 읽기 좋은 타이포그래피 중심 디자인
- 다크 모드 지원 (시스템 설정 연동 + 수동 토글)
- 모바일 반응형 레이아웃 (모바일 퍼스트)

## 프로젝트 구조

```
/
├── CLAUDE.md
├── index.html          # 메인 페이지
├── style.css           # 스타일시트
├── script.js           # 메인 스크립트
├── posts/              # 마크다운 블로그 글
│   └── *.md
└── claude-code-guide.md
```

## 빌드 및 실행

- 빌드 단계 없음. 로컬 서버로 바로 실행
- `npx serve .` 또는 `python -m http.server 8000`

## 코딩 컨벤션

- CSS: BEM 네이밍 또는 시맨틱 클래스명
- JS: camelCase, ES6+ 문법
- 들여쓰기: 2칸 스페이스
- CSS 커스텀 속성(변수)으로 테마 색상 관리
