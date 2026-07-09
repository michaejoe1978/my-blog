# 픽셀 아트 에디터 — 코드 리뷰 결과

검토일: 2026-07-09

---

## 검토 항목별 결과

### 1. index.html — 필수 요소 존재 여부
**통과**
- `#pixel-canvas`, `#toolbar`, `#sidebar`, `#statusbar` 모두 존재
- `#status-tool`, `#status-coord`, `#palette`, `#recent-colors`, `#current-color-preview`, `#color-picker`, `#export-scale`, `#export-btn`, `#clear-btn` 전부 확인

### 2. style.css — 레이아웃 및 모바일 대응
**통과**
- `#pixel-canvas`: `display: grid; grid-template-columns: repeat(16, var(--cell-size))` — 16×16 격자 정상
- `.cell`: `width/height: var(--cell-size)`, 체커보드 패턴(투명 표시용) 적용
- `@media (max-width: 600px)`: `#main`을 `flex-direction: column`으로 전환, 사이드바 가로 스크롤 처리

### 3. script.js — state 구조
**통과**
- `{ grid, tool, color, history, future, recentColors, isDrawing, lastIndex }` 모두 존재

### 4. initGrid() — 256개 셀 생성
**통과**
- `for (let i = 0; i < 256; i++)` 루프로 정확히 256개 셀 생성
- 각 셀에 `mousedown`, `mouseenter`, `contextmenu` 이벤트 등록

### 5. paintCell() — grid 업데이트 + DOM 반영
**통과**
- `state.grid[idx] = color` 후 DOM `.style.background` 즉시 갱신

### 6. floodFill() — BFS 4방향 경계 처리
**통과 (행 경계 wrapping 버그 없음)**
```js
const row = Math.floor(idx / 16);
const col = idx % 16;
if (row > 0)  neighbors.push(idx - 16);   // 위
if (row < 15) neighbors.push(idx + 16);   // 아래
if (col > 0)  neighbors.push(idx - 1);    // 왼쪽 — col 가드로 wrapping 차단
if (col < 15) neighbors.push(idx + 1);    // 오른쪽 — col 가드로 wrapping 차단
```
- `col > 0` / `col < 15` 조건으로 행 경계 wrapping 완전히 방지
- 동일 색상 체크(`state.grid[n] === targetColor`)와 visited Set으로 무한루프 방지

### 7. saveSnapshot() — history 제한 및 future 초기화
**통과**
- `history.push(grid.slice())` — 깊은 복사(shallow array copy) 저장
- `history.length > 50` 시 `shift()`로 최대 50개 유지
- `future = []` 초기화 정상

### 8. undo() / redo() — 스택 조작
**통과**
- `undo()`: 현재 grid를 `future`에 push → `history`에서 pop → `renderGrid()`
- `redo()`: 현재 grid를 `history`에 push → `future`에서 pop → `renderGrid()`
- 스택 비어있을 때 조기 return 처리 정상

### 9. exportPNG() — null(투명) 셀 처리
**통과**
```js
ctx.clearRect(0, 0, size, size);   // 투명 배경 초기화
for (let i = 0; i < 256; i++) {
  const color = state.grid[i];
  if (color) {                      // null 셀은 건너뜀 → 투명 유지
    ctx.fillRect(...);
  }
}
```
- `clearRect`로 캔버스를 투명하게 초기화 후 채색 셀만 그림 — 정상

### 10. 터치 이벤트 — passive 옵션
**통과**
```js
canvasEl.addEventListener('touchstart', handler, { passive: false });
canvasEl.addEventListener('touchmove',  handler, { passive: false });
```
- `{ passive: false }` 명시로 `e.preventDefault()` 호출 가능
- 스크롤 억제가 드로잉 중 정상 작동

### 11. 키보드 단축키
**통과**
- `Ctrl+Z`: undo
- `Ctrl+Y` / `Ctrl+Shift+Z`: redo
- `P/E/F/I`: 도구 전환

---

## 발견된 버그 및 수정 내역

### 버그 #1 — 마우스가 브라우저 창 밖으로 나갔을 때 isDrawing 미해제

**심각도**: 중간  
**현상**: 드래그 중 마우스를 브라우저 창 밖으로 이동한 뒤 버튼을 떼고 돌아오면 `isDrawing = true` 상태가 유지되어 의도치 않은 드로잉이 계속됨  
**원인**: `document.addEventListener('mouseup')` 이벤트는 브라우저 창 밖에서 마우스 버튼을 해제하면 발화하지 않음

**수정 전** (`script.js` 198~201행):
```js
document.addEventListener('mouseup', () => {
  state.isDrawing = false;
  state.lastIndex = -1;
});
```

**수정 후** (추가):
```js
// 마우스가 브라우저 창 밖으로 나갔을 때 드래그 해제
document.documentElement.addEventListener('mouseleave', () => {
  state.isDrawing = false;
  state.lastIndex = -1;
});
```

- `document.documentElement`(`<html>` 요소)의 `mouseleave`는 마우스가 뷰포트를 벗어날 때 발화
- 창 밖으로 나가는 즉시 `isDrawing`을 해제하여 유령 드로잉 방지

---

## 최종 결론

**배포 가능** (버그 1건 수정 완료)

| 항목 | 결과 |
|------|------|
| 필수 DOM 요소 | 통과 |
| CSS 격자 레이아웃 | 통과 |
| CSS 모바일 미디어쿼리 | 통과 |
| floodFill 행 경계 wrapping | 통과 (버그 없음) |
| undo/redo 스택 관리 | 통과 |
| exportPNG null 셀 처리 | 통과 |
| touchmove passive 옵션 | 통과 |
| 마우스 창 이탈 시 isDrawing 해제 | **수정 완료** |

수정된 파일: `apps/pixel-art/script.js`
