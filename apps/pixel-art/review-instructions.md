# 픽셀 아트 에디터 — Review 지침

## 작업 범위
`D:\ParkKiSung\Temp\ClaudeCode_Exam\apps\pixel-art\` 파일만 읽는다.
코드를 읽고 문제를 찾아 수정하되, 이 폴더 안에서만 작업한다.

## 검증 항목

### 코드 정적 검토
1. index.html - 필수 요소(#pixel-canvas, #toolbar, #sidebar, #statusbar) 존재 여부
2. style.css - 격자 grid 레이아웃, .cell 스타일, 모바일 미디어쿼리
3. script.js:
   - state 객체 구조 (grid, tool, color, history, future, recentColors, isDrawing)
   - initGrid(): 256개 셀 생성 확인
   - paintCell(): grid 업데이트 + DOM 반영
   - floodFill(): BFS 4방향 연결 로직 정확성
   - saveSnapshot(): history push, 50개 제한, future 초기화
   - undo()/redo(): 스택 조작 정확성
   - exportPNG(): canvas 2D API 사용, toDataURL, a.download
   - 터치 이벤트: touchstart/touchmove/touchend
   - 키보드: Ctrl+Z, Ctrl+Y

### 버그 체크
- floodFill에서 경계 초과(index 범위 벗어남, 행 경계 wrapping) 없는지
- undo 시 future 스택 관리 정확한지
- exportPNG에서 null(투명) 셀 처리 (clearRect 또는 skip)
- 드래그 중 마우스가 canvas 밖으로 나갔을 때 isDrawing 해제 여부
- 터치 이벤트 passive 옵션 (touchmove에 preventDefault 가능한지)

### 문제 발견 시
발견한 버그는 직접 수정하고 review.md에 기록한다.

## 결과 보고
`D:\ParkKiSung\Temp\ClaudeCode_Exam\apps\pixel-art\review.md` 에 결과를 작성한다:
- 검토 항목별 통과/실패
- 발견한 버그와 수정 내역
- 최종 결론 (배포 가능 여부)
