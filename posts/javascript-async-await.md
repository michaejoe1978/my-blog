---
title: "JavaScript 비동기 프로그래밍: Promise와 async/await 완전 정복"
date: "2026-07-01"
summary: "콜백 지옥부터 Promise, async/await까지 JavaScript 비동기 처리의 흐름을 예제와 함께 단계별로 이해합니다."
---

# JavaScript 비동기 프로그래밍: Promise와 async/await 완전 정복

JavaScript는 **싱글 스레드** 언어입니다. 한 번에 하나의 작업만 처리할 수 있죠. 그런데 어떻게 네트워크 요청이나 파일 읽기 같은 시간이 걸리는 작업을 처리할 수 있을까요? 바로 **비동기 프로그래밍** 덕분입니다.

## 1. 동기 vs 비동기

### 동기(Synchronous) 처리

동기 코드는 위에서 아래로, 순서대로 실행됩니다.

```javascript
console.log("1번 작업 시작");
console.log("2번 작업 시작");
console.log("3번 작업 시작");
// 출력: 1번 → 2번 → 3번 (순서 보장)
```

### 비동기(Asynchronous) 처리

비동기 코드는 시간이 걸리는 작업을 기다리지 않고 다음 코드를 먼저 실행합니다.

```javascript
console.log("시작");

setTimeout(() => {
  console.log("2초 후 실행");
}, 2000);

console.log("끝");
// 출력: 시작 → 끝 → 2초 후 실행
```

---

## 2. 콜백 지옥 (Callback Hell)

비동기 처리를 콜백 함수로만 하면 코드가 깊게 중첩되어 읽기 어려워집니다.

```javascript
// 콜백 지옥의 예
fetchUser(userId, function(user) {
  fetchOrders(user.id, function(orders) {
    fetchOrderDetail(orders[0].id, function(detail) {
      fetchProduct(detail.productId, function(product) {
        console.log(product.name); // 드디어 결과!
      });
    });
  });
});
```

이 코드는 오류 처리도 각 단계마다 해야 해서 더욱 복잡해집니다. 이 문제를 해결하기 위해 **Promise**가 등장했습니다.

---

## 3. Promise

Promise는 "미래에 완료될 작업"을 나타내는 객체입니다.

### Promise의 세 가지 상태

| 상태 | 설명 |
|------|------|
| `pending` | 초기 상태, 아직 처리 중 |
| `fulfilled` | 작업 성공 완료 |
| `rejected` | 작업 실패 |

### Promise 만들기

```javascript
const myPromise = new Promise((resolve, reject) => {
  const success = true;

  if (success) {
    resolve("성공 결과값"); // fulfilled 상태로 전환
  } else {
    reject(new Error("실패 이유")); // rejected 상태로 전환
  }
});
```

### Promise 사용하기: `.then()` / `.catch()`

```javascript
fetchUser(userId)
  .then(user => fetchOrders(user.id))
  .then(orders => fetchOrderDetail(orders[0].id))
  .then(detail => fetchProduct(detail.productId))
  .then(product => console.log(product.name))
  .catch(error => console.error("오류 발생:", error));
```

콜백 지옥과 비교하면 훨씬 읽기 쉽습니다.

### Promise.all — 여러 작업 병렬 실행

```javascript
// 세 요청을 동시에 보내고, 모두 완료될 때까지 기다림
const [users, posts, comments] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
  fetchComments(),
]);
```

### Promise.race — 가장 빠른 결과만 사용

```javascript
// 타임아웃 구현 예시
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("시간 초과")), 5000)
);

const result = await Promise.race([fetchData(), timeout]);
```

---

## 4. async / await

`async/await`는 Promise를 더 간결하게 작성할 수 있는 문법입니다. 비동기 코드를 마치 동기 코드처럼 읽을 수 있게 해줍니다.

### 기본 문법

```javascript
// async 함수 선언
async function loadUserData(userId) {
  const user = await fetchUser(userId);       // Promise가 완료될 때까지 대기
  const orders = await fetchOrders(user.id);
  return orders;
}
```

- `async` 키워드를 함수 앞에 붙이면 그 함수는 항상 Promise를 반환합니다.
- `await`는 `async` 함수 안에서만 사용할 수 있으며, Promise가 완료될 때까지 실행을 일시 정지합니다.

### 오류 처리: try / catch

```javascript
async function loadUserData(userId) {
  try {
    const user = await fetchUser(userId);
    const orders = await fetchOrders(user.id);
    return orders;
  } catch (error) {
    console.error("데이터 로드 실패:", error.message);
    return [];
  } finally {
    console.log("로딩 완료"); // 성공/실패 관계없이 실행
  }
}
```

---

## 5. 실전 예제: fetch API로 데이터 불러오기

실제로 가장 많이 쓰이는 패턴인 `fetch`와 `async/await`를 함께 사용해 봅시다.

```javascript
async function getGitHubUser(username) {
  const response = await fetch(`https://api.github.com/users/${username}`);

  if (!response.ok) {
    throw new Error(`HTTP 오류: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// 호출
getGitHubUser("octocat")
  .then(user => console.log(user.name))
  .catch(err => console.error(err));
```

---

## 6. 흔한 실수와 주의사항

### await를 빠뜨리는 실수

```javascript
// 잘못된 코드 — await 없이 Promise 객체 자체를 반환
async function wrong() {
  const data = fetchData(); // ❌ Promise 객체가 그대로 반환됨
  console.log(data); // Promise { <pending> }
}

// 올바른 코드
async function correct() {
  const data = await fetchData(); // ✅
  console.log(data); // 실제 데이터
}
```

### 불필요한 순차 실행

```javascript
// 느린 코드: 두 요청이 순차적으로 실행됨 (합계 대기 시간 = A + B)
const userA = await fetchUser("A");
const userB = await fetchUser("B");

// 빠른 코드: 두 요청이 동시에 실행됨 (합계 대기 시간 = max(A, B))
const [userA, userB] = await Promise.all([fetchUser("A"), fetchUser("B")]);
```

---

## 정리

| 방식 | 장점 | 단점 |
|------|------|------|
| 콜백 | 단순, 오래된 API 호환 | 중첩으로 가독성 저하 |
| Promise | 체이닝, 오류 처리 개선 | 여전히 `.then()` 중첩 가능 |
| async/await | 동기 코드처럼 읽힘, 가장 가독성 좋음 | `try/catch` 필요 |

`async/await`는 현재 JavaScript 비동기 처리의 **표준 방식**입니다. Promise 위에서 동작하기 때문에 두 개념 모두 이해하는 것이 중요합니다.

비동기 처리는 처음엔 헷갈리지만, 위 패턴들을 반복해서 사용하다 보면 자연스럽게 익혀집니다. 꾸준히 연습해 보세요!
