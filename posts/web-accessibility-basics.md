---
title: "웹 접근성(Web Accessibility) 기초: 모두를 위한 웹 만들기"
date: "2026-07-05"
summary: "시맨틱 마크업, ARIA, 키보드 내비게이션 등 웹 접근성의 핵심 개념을 실제 코드 예제와 함께 정리합니다."
---

# 웹 접근성(Web Accessibility) 기초: 모두를 위한 웹 만들기

웹 접근성(Accessibility, 줄여서 **a11y**)은 시각·청각·운동 장애가 있는 사용자를 포함해 **누구나** 웹사이트를 사용할 수 있도록 만드는 것을 말합니다. 스크린 리더 사용자, 키보드만으로 조작하는 사용자, 저시력 사용자 모두가 콘텐츠에 접근할 수 있어야 합니다.

이 글에서는 프레임워크 없이 순수 HTML/CSS/JS로 만든 블로그에도 바로 적용할 수 있는 접근성 기본기를 정리합니다.

## 왜 접근성이 중요한가?

- **법적/윤리적 이유**: 많은 국가에서 웹 접근성 준수를 요구합니다.
- **더 넓은 사용자층**: 전 세계 인구의 상당수가 어떤 형태로든 장애를 가지고 있습니다.
- **SEO에도 도움**: 시맨틱 마크업은 검색 엔진 크롤러에게도 명확한 구조를 제공합니다.
- **모두에게 더 나은 UX**: 키보드 내비게이션, 명확한 포커스 표시는 비장애인에게도 편리합니다.

---

## 1. 시맨틱 HTML부터 시작하기

접근성의 80%는 `<div>` 대신 의미 있는 태그를 쓰는 것에서 시작합니다.

```html
<!-- 나쁜 예: div로만 구성 -->
<div class="header">
  <div class="title">내 블로그</div>
</div>
<div class="nav">
  <div onclick="goHome()">홈</div>
</div>

<!-- 좋은 예: 시맨틱 태그 사용 -->
<header>
  <h1>내 블로그</h1>
</header>
<nav>
  <a href="/">홈</a>
</nav>
```

`<button>`, `<nav>`, `<main>`, `<article>`, `<time>` 같은 태그는 스크린 리더에게 "이것이 무엇인지"를 자동으로 알려줍니다. `<div onclick="...">`는 마우스 클릭은 되지만 키보드 `Tab`으로 포커스가 가지 않고, 스크린 리더는 그것을 버튼로 인식하지 못합니다.

---

## 2. 이미지에는 항상 대체 텍스트(alt)를

```html
<!-- 정보를 전달하는 이미지 -->
<img src="chart.png" alt="2026년 1분기 방문자 수는 전분기 대비 30% 증가했습니다">

<!-- 장식용 이미지는 빈 alt로 스크린 리더가 건너뛰게 함 -->
<img src="divider-line.svg" alt="">
```

| 이미지 종류 | alt 작성 방법 |
|------------|---------------|
| 정보 전달 (그래프, 다이어그램) | 내용을 요약해서 설명 |
| 장식용 (아이콘, 구분선) | `alt=""` (빈 문자열) |
| 링크 역할을 하는 이미지 | 이미지가 어디로 연결되는지 설명 |

---

## 3. 키보드만으로도 모든 기능을 사용할 수 있어야 한다

마우스 없이 `Tab`, `Shift+Tab`, `Enter`, `Space`, 방향키만으로 사이트의 모든 인터랙션이 가능해야 합니다.

```javascript
// 다크모드 토글 버튼 예시 - button 태그를 쓰면 키보드 접근성이 기본 제공됨
const toggleBtn = document.querySelector('#theme-toggle');

toggleBtn.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
});

// button 태그이므로 별도 keydown 처리 없이도
// Tab으로 포커스, Enter/Space로 클릭이 자동으로 동작한다
```

`<div>`나 `<span>`으로 버튼을 흉내 낸다면 `tabindex="0"`과 `keydown` 이벤트를 직접 구현해야 하므로, 처음부터 `<button>`을 쓰는 편이 훨씬 간단하고 안전합니다.

### 포커스 스타일을 지우지 말 것

```css
/* 절대 이렇게 하지 말 것 */
:focus {
  outline: none;
}

/* 대신 outline을 유지하거나 디자인에 맞게 커스터마이징 */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

`outline: none`만 남기면 키보드 사용자는 현재 어떤 요소에 포커스가 있는지 전혀 알 수 없게 됩니다. `:focus-visible`을 사용하면 마우스 클릭 시에는 숨기고 키보드 탐색 시에만 표시할 수 있습니다.

---

## 4. ARIA는 "최후의 수단"

ARIA(Accessible Rich Internet Applications)는 시맨틱 HTML만으로 표현이 부족할 때 보완하는 속성입니다.

```html
<!-- 다크모드 토글처럼 상태가 있는 버튼 -->
<button id="theme-toggle" aria-pressed="false" aria-label="다크 모드 전환">
  🌙
</button>
```

```javascript
toggleBtn.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark-mode');
  toggleBtn.setAttribute('aria-pressed', String(isDark));
});
```

> **제1원칙(First Rule of ARIA)**: 시맨틱 HTML 요소로 원하는 동작을 구현할 수 있다면 ARIA를 사용하지 마라. ARIA는 잘못 사용하면 오히려 접근성을 해칠 수 있다.

자주 쓰이는 ARIA 속성:

| 속성 | 용도 |
|------|------|
| `aria-label` | 화면에 보이지 않는 요소의 이름을 지정 |
| `aria-pressed` | 토글 버튼의 눌림 상태 표시 |
| `aria-expanded` | 아코디언/드롭다운의 열림/닫힘 상태 |
| `aria-hidden="true"` | 장식용 요소를 스크린 리더에서 숨김 |
| `aria-live="polite"` | 동적으로 변하는 콘텐츠를 스크린 리더에 알림 |

---

## 5. 색상 대비(Contrast)와 색맹 고려

텍스트와 배경 사이의 명도 대비가 충분해야 저시력 사용자도 읽을 수 있습니다. WCAG(웹 콘텐츠 접근성 지침) 기준으로는 일반 텍스트는 최소 **4.5:1**, 큰 텍스트는 **3:1** 비율을 권장합니다.

```css
:root {
  --color-text: #1a1a1a;      /* 배경 흰색 대비 대비율 약 16:1 */
  --color-bg: #ffffff;
  --color-accent: #0b5fff;    /* 링크 색상도 대비 확인 필요 */
}

.dark-mode {
  --color-text: #e8e8e8;
  --color-bg: #121212;
  --color-accent: #6ea8ff;
}
```

또한 "빨간색 글자는 오류, 초록색 글자는 성공"처럼 색만으로 의미를 전달하지 말고 아이콘이나 텍스트를 함께 사용하세요. 색맹 사용자는 색만으로는 구분하지 못할 수 있습니다.

---

## 6. 빠르게 점검하는 방법

1. **키보드로만 사이트를 탐색해보기** — 마우스를 치우고 `Tab`만으로 모든 버튼과 링크에 도달할 수 있는지 확인합니다.
2. **브라우저 개발자 도구의 Lighthouse 탭** — Accessibility 점수와 구체적인 개선 항목을 자동으로 알려줍니다.
3. **스크린 리더로 직접 들어보기** — Windows는 Narrator(`Ctrl+Win+Enter`), macOS는 VoiceOver(`Cmd+F5`)로 실제 경험을 체험해볼 수 있습니다.

```bash
# Lighthouse를 CLI로 실행해서 접근성 리포트만 뽑아보기
npx lighthouse https://example.com --only-categories=accessibility --view
```

---

## 마치며

접근성은 별도 기능이 아니라 **기본기**입니다. 시맨틱 태그를 우선 사용하고, 모든 이미지에 적절한 `alt`를 달고, 키보드 내비게이션과 포커스 스타일을 유지하는 것만으로도 대부분의 문제를 예방할 수 있습니다. ARIA는 정말 필요한 경우에만 최소한으로 추가하고, 색상 대비와 명확한 포커스 표시로 마무리하면 훨씬 더 많은 사람이 편하게 사용할 수 있는 사이트가 됩니다.
