# 픽셀 아트 에디터 — spec.md

## 1. 앱 개요

16×16 격자 위에 마우스(또는 터치)로 도트를 찍어 픽셀 아트를 만드는 브라우저 전용 에디터.
완성된 그림은 PNG 파일로 로컬에 저장할 수 있다.
순수 HTML/CSS/JavaScript만 사용하며 외부 라이브러리는 사용하지 않는다.

---

## 2. 기능 목록 (상세)

### 캔버스
- 16×16 픽셀 격자를 `<div>` 셀로 렌더링
- 셀 클릭 → 현재 선택 색상으로 채색
- 셀 클릭 후 드래그(mousemove / touchmove) → 연속 채색
- 우클릭(또는 지우개 모드) → 해당 셀을 투명(빈 칸)으로 초기화

### 도구
| 도구 | 동작 |
|------|------|
| 펜 (기본) | 선택 색상으로 셀 채색 |
| 지우개 | 셀을 투명으로 초기화 |
| 채우기 (Fill) | 클릭한 셀과 같은 색의 연결 영역을 현재 색으로 채움 (Flood Fill, BFS) |
| 스포이드 | 클릭한 셀의 색을 현재 색으로 가져옴 |

### 색상 팔레트
- 기본 32색 팔레트 제공 (픽셀 아트에 적합한 제한 팔레트)
- 사용자 정의 색상 입력: `<input type="color">` 피커
- 최근 사용 색상 8개 자동 기록

### 편집 보조
- 실행 취소(Undo): 최대 50단계 (`Ctrl+Z`)
- 다시 실행(Redo): `Ctrl+Y` / `Ctrl+Shift+Z`
- 캔버스 전체 지우기 버튼

### PNG 저장
- `<canvas>` API를 이용해 16×16 픽셀(또는 배율 옵션 ×8 = 128×128) PNG 생성
- `<a download>` 트릭으로 로컬 저장
- 저장 배율 선택: 1×(16px), 8×(128px), 16×(256px), 32×(512px)

### 모바일 지원
- `touchstart` / `touchmove` / `touchend` 이벤트 처리
- 셀 크기를 뷰포트에 맞춰 자동 조정 (CSS clamp / vmin 단위)
- 도구 버튼 최소 48×48px 터치 영역 확보

---

## 3. 파일 구조

```
apps/pixel-art/
├── index.html   — 뼈대 마크업, 레이아웃 컨테이너
├── style.css    — 격자, 팔레트, 도구 버튼 스타일
└── script.js   — 상태 관리, 이벤트 처리, 저장 로직
```

---

## 4. 각 파일의 주요 구현 내용

### index.html

- `<meta viewport>` 포함 (모바일 대응)
- 최상위 레이아웃: `#app` (flex column)
  - `#toolbar` — 도구 버튼 행
  - `#main` (flex row)
    - `#canvas-wrapper` — 16×16 격자 div (`#pixel-canvas`)
    - `#sidebar` — 팔레트, 색상 피커, 최근 색상, 저장 옵션
  - `#statusbar` — 현재 좌표 / 현재 도구 표시
- script.js, style.css 링크

### style.css

| 선택자 | 역할 |
|--------|------|
| `#pixel-canvas` | `display: grid; grid-template-columns: repeat(16, 1fr)` |
| `.cell` | `aspect-ratio: 1; border: 1px solid #ddd; cursor: crosshair` |
| `.cell.filled` | 배경색은 JS에서 인라인 style로 주입 |
| `.tool-btn.active` | 선택된 도구 강조 (outline/색상 변경) |
| `.swatch` | 팔레트 색상 샘플, `width/height: 28px`, hover 확대 |
| `@media (max-width: 600px)` | 사이드바를 하단으로 이동, 격자 크기 vmin 기반 축소 |

### script.js

**상태 객체 (`state`)**
```js
{
  grid: Array(256).fill(null),  // null = 투명, '#rrggbb' = 색상
  tool: 'pen',                  // 'pen' | 'eraser' | 'fill' | 'eyedropper'
  color: '#000000',
  history: [],   // Undo 스택 (최대 50 스냅샷)
  future: [],    // Redo 스택
  recentColors: [],
  isDrawing: false
}
```

**주요 함수**

| 함수 | 역할 |
|------|------|
| `initGrid()` | 256개 `.cell` div 생성 및 이벤트 바인딩 |
| `paintCell(index, color)` | 셀 배경색 변경 + state.grid 업데이트 |
| `floodFill(index, targetColor, fillColor)` | BFS로 연결 영역 채우기 |
| `saveSnapshot()` | history에 grid 복사본 push (50개 초과 시 shift) |
| `undo()` / `redo()` | history/future 스택 조작 후 renderGrid() |
| `renderGrid()` | state.grid 전체를 DOM에 반영 |
| `exportPNG(scale)` | Canvas 2D API로 픽셀 그려 `toDataURL('image/png')` → 다운로드 |
| `addRecentColor(color)` | recentColors 배열 앞에 추가, 최대 8개 유지, DOM 갱신 |

**이벤트 흐름**
1. `mousedown` / `touchstart` → `isDrawing = true`, saveSnapshot(), 해당 셀 처리
2. `mousemove` / `touchmove` → `isDrawing`이면 현재 포인터 아래 셀 처리
3. `mouseup` / `touchend` / `mouseleave` → `isDrawing = false`
4. `contextmenu` → 지우개 동작 + `preventDefault()`

---

## 5. UI 레이아웃 설명

```
┌─────────────────────────────────────────────┐
│  [펜] [지우개] [채우기] [스포이드]  [전체지우기] │  ← #toolbar
├──────────────────────┬──────────────────────┤
│                      │ 현재 색상 미리보기      │
│   16×16 픽셀 격자     │ ────────────────────  │
│   (셀: div grid)     │ 색상 팔레트 (32색)     │
│                      │ ────────────────────  │
│                      │ 색상 피커 (input)      │
│                      │ ────────────────────  │
│                      │ 최근 색상 (8개)        │
│                      │ ────────────────────  │
│                      │ 저장 배율: [8×][16×]  │
│                      │ [PNG 저장] 버튼        │
├──────────────────────┴──────────────────────┤
│  도구: 펜  |  좌표: (3, 7)                   │  ← #statusbar
└─────────────────────────────────────────────┘
```

**모바일 레이아웃 (600px 이하)**

```
┌──────────────────────────┐
│ [펜][지우개][채우기][스포이드] │  ← #toolbar (아이콘 중심)
├──────────────────────────┤
│                          │
│   16×16 픽셀 격자         │  ← 너비 = min(90vw, 90vmin)
│                          │
├──────────────────────────┤
│ 팔레트 | 피커 | 저장 버튼  │  ← #sidebar (하단 가로 배치)
└──────────────────────────┘
```

격자 셀 크기는 `calc(min(90vw, 90vmin) / 16)` 로 결정되어
어떤 화면 크기에서도 격자가 뷰포트를 벗어나지 않는다.
