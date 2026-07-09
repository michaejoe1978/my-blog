# 2048 게임 - Review 결과

Review 서브에이전트가 `apps/2048/index.html`, `style.css`, `script.js`를 spec.md/build-instructions.md 요구사항과 대조하고, 헤드리스 브라우저(`browse` 스킬, 실제 Chromium)에서 직접 동작 검증을 수행했다.

## 1. 코드 정적 검증

| 항목 | 결과 | 비고 |
|---|---|---|
| 이동/압축(compress) 로직 | 통과 | `processLine`: 0 제거 → 좌측 압축 |
| 병합(merge) 로직, 연쇄 병합 방지 | 통과 | 필터링된 원본 배열 인덱스만 순회하며 병합하므로 병합 결과가 같은 턴에 재병합되지 않음 (`filtered[i] === filtered[i+1]`이면 `i += 2`로 건너뜀) |
| 4방향 → "왼쪽 이동" 정규화 | 통과 | `getLineCoords(direction, index)`가 각 방향별 좌표 순서를 반환, `left/right/up/down` 모두 동일한 `processLine`으로 처리 |
| 실제 변화가 있을 때만 새 타일 생성 | 통과 | `move()`에서 `if (!moved) return;` 후에만 `spawnRandomTile()` 호출 |
| 새 타일 랜덤(2:90%, 4:10%) | 통과 | `Math.random() < 0.9 ? 2 : 4` |
| 승리 판정(2048 타일) | 통과 | `checkWinCondition()`, `hasWon` 플래그로 재판정 방지, "계속하기" 클릭 시 `locked=false`로 이어가기 가능 |
| 패배 판정(이동/병합 불가) | 통과 | `canMoveAny()`가 4방향 16개 라인에 대해 가상 `processLine` 실행 후 `moved` 여부로 판정. 빈 칸 유무를 별도로 검사하지 않아도 되는 일반화된 정확한 구현 |
| 승리/패배 동시 발생 시 우선순위 | 통과 | `checkWinCondition()` → `checkGameOver()` 순서로 호출되며, 승리 오버레이가 이미 열려 있으면(`locked && !winOverlay hidden`) `checkGameOver()`가 조기 반환하여 두 오버레이가 동시에 뜨지 않음 |
| 점수 계산 | 통과 | 병합될 때마다 `mergedValue`(합쳐진 결과값)를 `gainedScore`에 가산, 한 턴에 여러 라인의 병합 점수를 합산 |
| localStorage 최고점수 저장 | 통과 | 키 `best2048score`, `updateScore()`에서 현재 점수가 최고 점수를 초과할 때만 갱신 및 저장, `init()`에서 로드 |
| 방향키 `preventDefault` | 통과 | `handleKeydown`에서 유효한 방향키일 때만 `event.preventDefault()` 호출 |
| 모바일 스와이프 | 통과 | `touchstart`/`touchend` 좌표 비교, 임계값 30px, 큰 축 기준 방향 판별 후 동일한 `move()` 호출. `touchmove`에 `preventDefault`(pull-to-refresh 방지) |
| `touch-action: none` | 통과 | `.board`에 적용됨 (계산된 CSS로 확인) |
| 새 게임 버튼 상시 노출 | 통과 | `app__controls` 영역에 항상 표시, 오버레이 내부에도 재시작/계속하기 버튼 별도 제공 |
| CLAUDE.md 컨벤션(camelCase, 2칸 들여쓰기, CSS 커스텀 속성) | 통과 | JS 전역 camelCase, 2-space indent 일관, `:root`에 색상/치수를 CSS 변수로 관리, 다크모드는 `prefers-color-scheme`로 변수 재정의 |
| `/apps/2048/` 밖 파일 미변경 | 통과(Build 단계 기준) | Build가 생성한 파일은 `apps/2048/index.html`, `style.css`, `script.js`뿐이며 git status상 신규 `apps/` 폴더로만 나타남. 단, 검증 중 `CLAUDE.md`·`.gitignore`가 이미 수정된 상태(M)임을 발견 — 이 변경은 이번 Review 세션에서 발생시킨 것이 아니며(파일을 읽기만 했음, 편집 도구 미사용), 이전 단계에서 이루어진 것으로 보임. Review 지침 범위(`/apps/2048/`) 밖이라 손대지 않음 |

## 2. 브라우저 실제 동작 검증 (헤드리스 Chromium, `browse` 스킬)

`file:///D:/ParkKiSung/Temp/ClaudeCode_Exam/apps/2048/index.html`을 헤드리스 Chromium으로 직접 열고 아래 시나리오를 실제로 실행해 콘솔/DOM/전역 상태를 확인했다(코드 트레이스가 아닌 실제 실행 결과).

1. **페이지 로드**: 콘솔 에러 없음. 초기 타일 2개 자동 생성 확인(`board` = 두 칸에 값 2).
2. **이동(압축만, 병합 없음)**: `ArrowDown` 입력 → 타일이 그리드 하단으로 이동, 변화가 있었으므로 새 타일 자동 생성, 점수 변동 없음(병합 없었으므로 0 유지).
3. **병합**: `ArrowLeft` 입력으로 `[2,2,0,2]` → `[4,2,0,0]`, 점수 0→4로 갱신 확인.
4. **연쇄 병합 방지**: `board`를 `[[2,2,2,2],...]`로 직접 설정 후 `ArrowLeft` → 결과 `[4,4,0,0]`(0/8이 아님), 점수 +8 확인. 한 턴에 4개가 8 하나로 합쳐지는 버그 없음.
5. **승리**: `board`에 `[1024,1024,...]` 배치 후 `ArrowLeft` → `2048` 타일 생성, 승리 오버레이 노출(`winOverlay` 클래스에서 `overlay--hidden` 사라짐), 화면 텍스트에 "You Win!" 출력, BEST 점수 2048로 자동 갱신 확인.
6. **계속하기**: `#keepGoingBtn` 클릭 → `locked=false`, 오버레이 닫힘, 이후 `ArrowRight` 입력이 정상적으로 처리됨(게임 지속 가능) 확인.
7. **게임 오버**: 상하좌우 어느 쪽으로도 이동/병합 불가능한 보드(체커보드 패턴)를 설정하고 `checkGameOver()` 트리거 → 게임오버 오버레이 노출, 최종 점수 텍스트 표시, `locked=true`로 추가 입력이 차단됨(잠금 후 `ArrowUp` 입력해도 보드/점수 불변 확인).
8. **새 게임/다시 시작**: `#restartBtn` 클릭 → 보드 초기화(새 타일 2개), 점수 0, `locked=false`, 오버레이 숨김 확인.
9. **정적 판정(no-op) 이동**: 이미 좌측으로 완전히 압축된 행(`[2,4,8,16]`)에서 `ArrowLeft` 재입력 → 보드/점수 불변, 빈 칸 개수 불변(새 타일 생성 안 됨) 확인 — "변화 없으면 아무 동작 안 함" 규칙 검증.
10. **모바일 스와이프**: `TouchEvent`를 합성해 `.board` 요소에 `touchstart(300,100)` → `touchend(50,100)`(좌측 스와이프) 디스패치 → `move('left')`가 정상 호출되어 보드가 실제로 이동함을 확인.
11. **localStorage 최고점수 영속성**: BEST 2048 달성 후 `reload()` → `localStorage.getItem('best2048score')`와 `bestScore` 변수가 `"2048"`/`2048`로 유지됨을 확인.
12. **반응형 레이아웃**: viewport `375x812`(모바일)로 전환 후 스크린샷 촬영 — 레이아웃 깨짐/오버플로 없이 점수판·보드·버튼이 뷰포트 안에 정상 배치됨을 육안 확인.
13. **콘솔 에러**: 전체 시나리오(1~12) 진행 동안 `browse console --errors`로 반복 확인, 에러/경고 없음.

## 3. 발견한 문제 및 수정 내역

브라우저 실행 및 정적 검증 결과 **버그를 발견하지 못했다.** 이동/병합/연쇄병합 방지/점수/승리/패배/새 게임/스와이프/최고점수 저장 등 spec.md에 명시된 모든 시나리오가 실제 브라우저에서 의도대로 동작했으며, `/apps/2048/` 파일에는 수정하지 않았다(수정 사항 없음).

## 4. 최종 결론

**배포 가능.** spec.md의 요구사항을 모두 충족하고, 헤드리스 Chromium 실제 실행 검증에서도 핵심 게임 로직(이동·병합·연쇄병합 방지·점수·승리·패배·새 게임·모바일 스와이프·최고점수 영속성)이 모두 정상 동작했다. 콘솔 에러 없음. CLAUDE.md 코딩 컨벤션도 준수함.

참고: 검증 중 프로젝트 루트 `CLAUDE.md`, `.gitignore`가 이미 수정된 상태(M)인 것을 발견했으나, 이는 이번 Review 세션이 발생시킨 변경이 아니며(읽기만 수행), Review 지침의 작업 범위(`/apps/2048/` 폴더 한정) 밖이라 별도 조치를 하지 않았다. 다음 Embed 단계 담당자가 참고할 필요가 있어 보인다.
