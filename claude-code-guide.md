# Claude Code 사용법 가이드

## 1. Claude Code란?

Claude Code는 Anthropic에서 제공하는 공식 CLI(Command Line Interface) 도구로, 터미널에서 직접 Claude AI와 대화하며 소프트웨어 개발 작업을 수행할 수 있는 에이전트형 코딩 도우미입니다.

**사용 가능 환경:**
- CLI (터미널)
- 데스크톱 앱 (Mac / Windows)
- 웹 앱 (claude.ai/code)
- IDE 확장 (VS Code, JetBrains)

---

## 2. 설치 및 시작

### 설치

```bash
npm install -g @anthropic-ai/claude-code
```

### 실행

```bash
# 현재 디렉토리에서 Claude Code 시작
claude

# 특정 프롬프트로 바로 실행
claude "이 프로젝트의 구조를 설명해줘"

# 파이프로 입력 전달
cat error.log | claude "이 에러를 분석해줘"
```

---

## 3. 주요 슬래시 명령어

| 명령어 | 설명 |
|--------|------|
| `/help` | 도움말 표시 |
| `/clear` | 대화 컨텍스트 초기화 |
| `/config` | 설정 변경 (테마, 모델 등) |
| `/permissions` | 권한 설정 관리 |
| `/hooks` | 훅(자동화 명령) 설정 |
| `/init` | CLAUDE.md 파일 초기화 |
| `/review` | GitHub PR 리뷰 |
| `/code-review` | 현재 diff 코드 리뷰 |
| `/ship` | PR 생성 및 배포 워크플로우 |
| `/fast` | Fast 모드 토글 (Opus 모델 사용) |

---

## 4. 핵심 기능

### 4.1 코드 읽기 및 탐색

Claude Code는 프로젝트 파일을 직접 읽고 검색할 수 있습니다.

```
# 사용 예시
"src 폴더의 구조를 알려줘"
"UserService 클래스가 어디에 정의되어 있어?"
"이 함수가 어디서 호출되는지 찾아줘"
```

### 4.2 코드 편집

파일을 직접 수정하거나 새 파일을 생성할 수 있습니다.

```
"login 함수에 입력값 검증을 추가해줘"
"이 컴포넌트를 TypeScript로 변환해줘"
"새로운 API 엔드포인트를 만들어줘"
```

### 4.3 터미널 명령 실행

빌드, 테스트, Git 등 터미널 명령을 실행합니다.

```
"테스트를 실행해줘"
"npm install로 의존성 설치해줘"
"현재 브랜치의 git log를 보여줘"
```

### 4.4 Git 작업

커밋, 브랜치, PR 생성 등 Git 워크플로우를 지원합니다.

```
"변경사항을 커밋해줘"
"새 브랜치를 만들어줘"
"PR을 생성해줘"
```

### 4.5 디버깅

에러 분석 및 버그 수정을 도와줍니다.

```
"이 에러 메시지를 분석해줘"
"왜 이 테스트가 실패하는지 찾아줘"
"이 함수의 버그를 찾아서 고쳐줘"
```

---

## 5. CLAUDE.md 파일

프로젝트 루트에 `CLAUDE.md` 파일을 생성하면 Claude Code에게 프로젝트별 컨텍스트를 제공할 수 있습니다.

```markdown
# CLAUDE.md 예시

## 프로젝트 개요
이 프로젝트는 React + TypeScript 기반 웹 애플리케이션입니다.

## 빌드 및 테스트
- 빌드: `npm run build`
- 테스트: `npm test`
- 린트: `npm run lint`

## 코딩 컨벤션
- 함수명은 camelCase 사용
- 컴포넌트 파일은 PascalCase 사용
- 들여쓰기는 2칸 스페이스
```

`/init` 명령으로 자동 생성할 수도 있습니다.

---

## 6. 권한 모드

Claude Code는 도구 실행 시 권한을 관리합니다.

| 모드 | 설명 |
|------|------|
| **Ask** | 매번 사용자 승인 필요 (기본값) |
| **Auto** | 안전한 작업은 자동 승인 |
| **Custom** | 사용자 정의 허용 규칙 설정 |

권한 설정 파일: `.claude/settings.json`

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(npm test)",
      "Bash(npm run lint)"
    ]
  }
}
```

---

## 7. 모델 선택

사용 가능한 Claude 모델:

| 모델 | 모델 ID | 특징 |
|------|---------|------|
| **Fable 5** | `claude-fable-5` | 최신 모델 |
| **Opus 4.8** | `claude-opus-4-8` | 최고 성능 |
| **Sonnet 4.6** | `claude-sonnet-4-6` | 균형 잡힌 성능 |
| **Haiku 4.5** | `claude-haiku-4-5-20251001` | 빠른 응답 |

`/fast` 명령으로 Opus 모델의 고속 출력 모드를 사용할 수 있습니다.

---

## 8. 서브 에이전트

복잡한 작업을 병렬로 처리하기 위해 서브 에이전트를 활용할 수 있습니다.

| 에이전트 | 용도 |
|----------|------|
| **Explore** | 코드 검색 및 탐색 |
| **Plan** | 구현 계획 설계 |
| **claude-code-guide** | Claude Code 사용법 질의 |

---

## 9. 유용한 팁

### 효과적인 프롬프트 작성법

```
# 나쁜 예 (모호함)
"코드 고쳐줘"

# 좋은 예 (구체적)
"src/api/auth.ts의 login 함수에서 비밀번호가 빈 문자열일 때 
에러를 반환하도록 수정해줘"
```

### 컨텍스트 활용

- 긴 대화가 이어지면 `/clear`로 초기화
- 관련 파일을 먼저 언급하면 더 정확한 결과
- CLAUDE.md에 프로젝트 규칙을 명시하면 일관된 코드 생성

### 안전한 사용

- 파괴적 작업(force push, reset --hard 등)은 항상 확인 후 실행
- `.env`, 자격 증명 파일은 커밋하지 않도록 주의
- 중요한 변경 전에는 커밋 또는 백업 권장

---

## 10. 문제 해결

| 문제 | 해결 방법 |
|------|-----------|
| 권한 거부 | `.claude/settings.json`에서 허용 규칙 추가 |
| 응답이 느림 | Haiku 모델로 전환 또는 `/fast` 사용 |
| 컨텍스트 초과 | `/clear`로 대화 초기화 |
| 훅 실패 | 훅 설정 확인 및 수정 |

### 피드백 및 이슈 보고

- GitHub: https://github.com/anthropics/claude-code/issues

---

## 참고 링크

- [Claude Code 공식 문서](https://docs.anthropic.com/en/docs/claude-code)
- [Anthropic 홈페이지](https://www.anthropic.com)
