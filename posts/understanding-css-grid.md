---
title: CSS Grid 완벽 이해하기
date: 2026-06-28
summary: CSS Grid 레이아웃의 핵심 개념부터 실전 패턴까지, 예제와 함께 단계별로 알아봅니다.
---

# CSS Grid 완벽 이해하기

웹 페이지 레이아웃을 구성할 때 가장 강력한 도구 중 하나가 바로 **CSS Grid**입니다. Flexbox가 1차원(행 또는 열) 배치에 특화되어 있다면, Grid는 **2차원(행과 열 동시)** 배치를 자유롭게 다룰 수 있습니다. 이 글에서는 CSS Grid의 핵심 개념부터 실전에서 자주 쓰이는 패턴까지 정리합니다.

## Grid 컨테이너 만들기

Grid 레이아웃은 부모 요소에 `display: grid`를 선언하는 것으로 시작합니다.

```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 16px;
}
```

위 코드는 **3개의 동일한 너비 열**을 만들고, 각 셀 사이에 16px 간격을 둡니다.

### 핵심 속성 정리

| 속성 | 설명 | 예시 |
|------|------|------|
| `grid-template-columns` | 열의 개수와 너비 정의 | `1fr 2fr 1fr` |
| `grid-template-rows` | 행의 개수와 높이 정의 | `100px auto 50px` |
| `gap` | 셀 간 간격 | `16px` 또는 `16px 24px` |
| `grid-template-areas` | 이름으로 영역 배치 | `"header header" "nav main"` |

## fr 단위 이해하기

`fr`은 **fraction**(분수)의 약자로, 사용 가능한 공간을 비율로 나눕니다.

```css
/* 1:2:1 비율로 3열 구성 */
grid-template-columns: 1fr 2fr 1fr;

/* 고정 사이드바 + 유동 메인 콘텐츠 */
grid-template-columns: 250px 1fr;
```

`fr` 단위는 `gap`, `padding` 등 고정 크기를 먼저 제외한 뒤 남은 공간을 분배합니다. 덕분에 별도의 계산 없이도 유연한 레이아웃을 만들 수 있습니다.

## repeat()와 minmax()

반복되는 열 정의를 간결하게 쓸 수 있는 `repeat()` 함수와, 최솟값과 최댓값을 동시에 지정하는 `minmax()` 함수를 함께 사용하면 반응형 그리드를 쉽게 만들 수 있습니다.

```css
/* 고정 3열 반복 */
grid-template-columns: repeat(3, 1fr);

/* 반응형: 최소 280px, 최대 1fr로 자동 채움 */
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
```

### auto-fill vs auto-fit

이 두 키워드는 비슷해 보이지만 동작이 다릅니다.

- **`auto-fill`**: 빈 트랙도 유지합니다. 남는 공간이 있으면 빈 열이 생깁니다.
- **`auto-fit`**: 빈 트랙을 접어서(collapse) 기존 아이템이 남은 공간을 채웁니다.

```css
/* 아이템이 적을 때 차이가 드러남 */
.auto-fill { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
.auto-fit  { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
```

카드 목록처럼 아이템 수가 가변적인 경우, 대부분 `auto-fit`이 더 자연스러운 결과를 줍니다.

## Grid Area로 레이아웃 설계하기

`grid-template-areas`를 사용하면 레이아웃을 **시각적으로 설계**할 수 있습니다.

```css
.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

```html
<div class="page">
  <header class="header">헤더</header>
  <nav class="sidebar">사이드바</nav>
  <main class="main">본문</main>
  <footer class="footer">푸터</footer>
</div>
```

이 방식의 장점은 HTML 순서와 시각적 배치를 분리할 수 있다는 것입니다. 접근성을 위해 HTML은 논리적 순서를 유지하면서, CSS로 원하는 위치에 배치할 수 있습니다.

## 아이템 배치: line 기반

Grid 라인 번호를 사용해 아이템의 시작과 끝 위치를 직접 지정할 수도 있습니다.

```css
.featured {
  grid-column: 1 / 3;  /* 1번 라인부터 3번 라인까지 (2열 차지) */
  grid-row: 1 / 2;
}

.wide {
  grid-column: 1 / -1;  /* 첫 번째부터 마지막 라인까지 (전체 너비) */
}
```

`-1`은 마지막 라인을 의미하므로, 열 개수가 바뀌어도 전체 너비를 차지하는 코드가 깨지지 않습니다.

## 정렬하기

Grid는 컨테이너와 아이템 양쪽에서 정렬을 제어할 수 있습니다.

```css
/* 컨테이너 레벨: 전체 아이템에 적용 */
.container {
  justify-items: center;  /* 수평 정렬 */
  align-items: center;    /* 수직 정렬 */
  place-items: center;    /* 위 두 줄의 단축형 */
}

/* 아이템 레벨: 개별 아이템만 */
.special-item {
  justify-self: end;
  align-self: start;
}
```

| 속성 | 대상 | 방향 |
|------|------|------|
| `justify-items` / `justify-self` | 아이템 | 수평(인라인 축) |
| `align-items` / `align-self` | 아이템 | 수직(블록 축) |
| `justify-content` | 그리드 트랙 전체 | 수평 |
| `align-content` | 그리드 트랙 전체 | 수직 |

## 실전 예제: 반응형 카드 그리드

미디어 쿼리 없이도 반응형 카드 레이아웃을 만들 수 있습니다.

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px;
}

.card {
  background: var(--color-surface);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

이 한 줄의 `grid-template-columns`만으로 화면 너비에 따라 1열, 2열, 3열이 자동으로 전환됩니다.

## Flexbox와 언제 구분해서 쓸까?

| 상황 | 추천 |
|------|------|
| 한 방향(행 또는 열)으로 나열 | Flexbox |
| 행과 열을 동시에 제어 | Grid |
| 아이템 크기가 콘텐츠에 따라 유동적 | Flexbox |
| 전체 페이지 레이아웃 | Grid |
| 내비게이션 바, 버튼 그룹 | Flexbox |
| 대시보드, 갤러리, 카드 목록 | Grid |

실무에서는 둘을 함께 사용하는 경우가 많습니다. 페이지 전체 구조는 Grid로, 각 컴포넌트 내부는 Flexbox로 구성하는 것이 일반적인 패턴입니다.

## 브라우저 지원

CSS Grid는 2017년부터 모든 주요 브라우저에서 지원됩니다. `subgrid`는 비교적 최근에 추가되었지만, 2024년 기준으로 Chrome, Firefox, Safari, Edge 모두에서 사용 가능합니다. IE 지원이 필요한 프로젝트가 아니라면 Grid를 안심하고 사용할 수 있습니다.

## 마무리

CSS Grid는 복잡한 레이아웃을 선언적으로 표현할 수 있게 해주는 강력한 도구입니다. 핵심을 정리하면:

- **`fr` 단위**로 비율 기반 레이아웃을 쉽게 구성
- **`repeat(auto-fit, minmax())`**로 미디어 쿼리 없는 반응형 구현
- **`grid-template-areas`**로 시각적이고 직관적인 레이아웃 설계
- **Flexbox와 역할 분담**: 페이지 구조는 Grid, 컴포넌트 내부는 Flexbox

직접 코드를 작성해보면서 익히는 것이 가장 효과적입니다. 간단한 카드 그리드부터 시작해서 점차 복잡한 레이아웃으로 확장해 보세요.
