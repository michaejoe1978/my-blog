# 픽셀 아트 에디터 — Build 지침

## 작업 범위
`D:\ParkKiSung\Temp\ClaudeCode_Exam\apps\pixel-art\` 폴더 안에만 파일을 생성/수정한다.
블로그의 다른 파일(index.html, style.css, script.js, posts/ 등)은 절대 건드리지 않는다.

## 생성할 파일
- `index.html`
- `style.css`
- `script.js`

## spec.md 참고
같은 폴더의 spec.md를 읽고 그 내용을 충실히 구현한다.

## 구현 세부 사항

### index.html
- `lang="ko"`, charset UTF-8, viewport meta
- 구조: `#app > #toolbar + #main(#canvas-wrapper + #sidebar) + #statusbar`
- toolbar: 펜(✏️), 지우개(🧹), 채우기(🪣), 스포이드(💉), 구분선, 전체지우기(🗑️) 버튼
- canvas-wrapper: `#pixel-canvas` div (JS로 256개 cell 생성)
- sidebar:
  - 현재 색상 미리보기 `#current-color-preview`
  - 팔레트 `#palette` (JS로 색상 스워치 생성)
  - `<input type="color" id="color-picker">`
  - 최근 색상 `#recent-colors`
  - 저장 배율 select `#export-scale` (옵션: 1, 8, 16, 32)
  - PNG 저장 버튼 `#export-btn`
- script.js, style.css 링크

### style.css
- CSS 변수: `--cell-size`, `--grid-size: calc(var(--cell-size) * 16)`
- `--cell-size: clamp(16px, calc(min(90vw, 60vh) / 16), 32px)`
- `#pixel-canvas`: `display:grid; grid-template-columns: repeat(16, var(--cell-size)); width: var(--grid-size); height: var(--grid-size)`
- `.cell`: `width: var(--cell-size); height: var(--cell-size); box-sizing: border-box; border: 1px solid rgba(0,0,0,0.1); cursor: crosshair; background: white`
- `.cell.filled`: 배경색은 JS 인라인 style
- `.tool-btn`: 최소 44×44px, 아이콘+라벨, 선택 시 `.active` 강조
- `.swatch`: 28×28px, border-radius 4px, hover 시 scale(1.2)
- `#current-color-preview`: 48×48px, border-radius 8px, border
- 다크 배경 격자 체크패턴 (투명 셀 표현): `.cell` background를 체크 패턴으로
- `@media (max-width: 600px)`: `#main` flex-direction column, sidebar 하단 가로 스크롤

### script.js
**상태:**
```js
const state = {
  grid: Array(256).fill(null),
  tool: 'pen',
  color: '#000000',
  history: [],
  future: [],
  recentColors: [],
  isDrawing: false,
  lastIndex: -1
}
```

**팔레트 32색 (픽셀 아트용):**
```js
const PALETTE = [
  '#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff',
  '#ff8800','#8800ff','#00ff88','#ff0088','#0088ff','#88ff00','#ff8888','#88ff88',
  '#8888ff','#ffff88','#ff88ff','#88ffff','#884400','#448800','#004488','#884488',
  '#aaaaaa','#555555','#ffccaa','#aaffcc','#ccaaff','#ffaacc','#ccffaa','#aaccff'
]
```

**주요 함수:**
- `initGrid()`: 256개 div.cell 생성, 각 셀에 mousedown/mouseenter/contextmenu 이벤트
- `paintCell(idx, color)`: state.grid[idx] = color, 셀 style.background = color ?? '' (null이면 투명)
- `floodFill(startIdx, fillColor)`: BFS, targetColor = state.grid[startIdx], 4방향 연결
- `saveSnapshot()`: history.push(state.grid.slice()), history 50 초과시 shift, future 초기화
- `undo()` / `redo()`: 스택 조작 후 renderGrid()
- `renderGrid()`: 256개 셀 배경 일괄 업데이트
- `exportPNG(scale)`: `<canvas>` 생성, 각 셀 fillRect, null은 투명, toDataURL → a.download
- `addRecentColor(color)`: 중복 제거 후 앞에 삽입, 최대 8개
- 드래그: `mousedown` → isDrawing=true, `mousemove` → isDrawing이면 처리, `mouseup`(document) → false
- 터치: `touchstart`, `touchmove`(preventDefault), `touchend` - `document.elementFromPoint`로 셀 찾기
- 키보드: Ctrl+Z=undo, Ctrl+Y/Ctrl+Shift+Z=redo

**이벤트 흐름:**
1. 셀 mousedown: saveSnapshot → 도구별 처리(pen/eraser/fill/eyedropper)
2. 셀 mouseenter + isDrawing: pen/eraser만 처리 (fill/eyedropper는 드래그 무시)
3. document mouseup: isDrawing=false
4. 셀 contextmenu: 지우기 + preventDefault

## 완성 기준
- 16×16 격자에 마우스로 그림 그리기 가능
- 4가지 도구 동작
- 팔레트 색상 선택 및 커스텀 색상 피커 동작
- Undo/Redo 동작
- PNG 저장 동작 (배율 옵션 포함)
- 모바일 터치 동작
- 콘솔 에러 없음
