---
title: "TypeScript 입문: 타입으로 만드는 더 안전한 JavaScript"
date: "2026-06-30"
summary: "TypeScript의 핵심 타입 시스템을 실제 코드 예제와 함께 정리합니다. 타입 추론, 인터페이스, 제네릭까지 단계별로 알아봅니다."
---

# TypeScript 입문: 타입으로 만드는 더 안전한 JavaScript

TypeScript는 Microsoft가 만든 JavaScript의 **슈퍼셋(Superset)** 언어입니다. 기존 JavaScript 코드를 그대로 사용하면서 **정적 타입 시스템**을 추가해 런타임 오류를 개발 단계에서 잡아낼 수 있습니다.

## 왜 TypeScript를 사용할까?

```javascript
// JavaScript — 런타임에 오류 발생
function greet(user) {
  return `안녕하세요, ${user.name}님!`;
}

greet({ username: '홍길동' }); // undefined — 오류를 알 수 없음
```

```typescript
// TypeScript — 컴파일 타임에 오류 감지
interface User {
  name: string;
}

function greet(user: User): string {
  return `안녕하세요, ${user.name}님!`;
}

greet({ username: '홍길동' }); // ❌ 컴파일 오류: 'username'은 'User'에 없습니다
greet({ name: '홍길동' });     // ✅ 정상
```

---

## 기본 타입

TypeScript가 제공하는 기본 타입들입니다.

| 타입 | 예시 | 설명 |
|------|------|------|
| `string` | `"안녕"` | 문자열 |
| `number` | `42`, `3.14` | 숫자 (정수/실수 구분 없음) |
| `boolean` | `true`, `false` | 불리언 |
| `null` | `null` | 값 없음(명시적) |
| `undefined` | `undefined` | 초기화 안 됨 |
| `any` | 모든 값 | 타입 검사 비활성화 |
| `unknown` | 모든 값 | 안전한 any |
| `never` | 반환 없음 | 도달 불가 코드 |

```typescript
let name: string = '홍길동';
let age: number = 30;
let isActive: boolean = true;

// 배열
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ['홍길동', '김철수'];

// 튜플 — 길이와 타입이 고정된 배열
let point: [number, number] = [10, 20];
let entry: [string, number] = ['홍길동', 30];
```

---

## 타입 추론

타입을 명시하지 않아도 TypeScript가 자동으로 추론합니다.

```typescript
let message = '안녕하세요'; // string으로 추론
let count = 0;              // number로 추론

message = 42; // ❌ 오류: number를 string에 할당할 수 없음
count = '열';  // ❌ 오류: string을 number에 할당할 수 없음
```

---

## 인터페이스(Interface)와 타입 별칭(Type Alias)

객체의 구조를 정의하는 두 가지 방법이 있습니다.

### 인터페이스

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string; // ? 는 선택적 속성
  readonly createdAt: Date; // readonly는 수정 불가
}

const laptop: Product = {
  id: 1,
  name: '맥북 프로',
  price: 2500000,
  createdAt: new Date(),
};

laptop.price = 2000000;   // ✅ 가능
laptop.createdAt = new Date(); // ❌ 오류: readonly
```

### 타입 별칭

```typescript
type Point = {
  x: number;
  y: number;
};

type Status = 'active' | 'inactive' | 'pending'; // 유니온 타입

const userStatus: Status = 'active'; // ✅
const wrong: Status = 'deleted';     // ❌ 오류
```

### 인터페이스 vs 타입 별칭

| 구분 | `interface` | `type` |
|------|-------------|--------|
| 선언 병합 | ✅ 가능 | ❌ 불가 |
| 유니온/교차 | ❌ 불가 | ✅ 가능 |
| 상속(extends) | ✅ 가능 | `&` 교차 타입으로 가능 |
| 주로 사용 | 객체, 클래스 계약 | 복잡한 타입 조합 |

---

## 함수 타입

```typescript
// 매개변수와 반환값에 타입 지정
function add(a: number, b: number): number {
  return a + b;
}

// 화살표 함수
const multiply = (a: number, b: number): number => a * b;

// 선택적 매개변수와 기본값
function createUser(name: string, age?: number, role: string = 'user') {
  return { name, age, role };
}

createUser('홍길동');           // ✅ age는 undefined
createUser('김철수', 25);      // ✅
createUser('이영희', 30, 'admin'); // ✅
```

### 함수 오버로딩

```typescript
function format(value: string): string;
function format(value: number, decimals: number): string;
function format(value: string | number, decimals?: number): string {
  if (typeof value === 'string') return value.toUpperCase();
  return value.toFixed(decimals ?? 2);
}

format('hello');       // "HELLO"
format(3.14159, 2);   // "3.14"
```

---

## 제네릭(Generic)

타입을 **매개변수처럼** 다루어 재사용 가능한 컴포넌트를 만듭니다.

```typescript
// 제네릭 없이 — any 사용 시 타입 안전성 없음
function firstElement(arr: any[]): any {
  return arr[0];
}

// 제네릭 사용 — 타입 정보 유지
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = firstElement([1, 2, 3]);      // number
const str = firstElement(['a', 'b', 'c']); // string
const nope = firstElement([]);             // undefined
```

### 제네릭 제약(Constraint)

```typescript
// T는 반드시 length 속성을 가져야 함
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest([1, 2], [1, 2, 3]);      // [1, 2, 3]
longest('abc', 'ab');            // 'abc'
longest(10, 20);                 // ❌ 오류: number에는 length가 없음
```

### 제네릭 인터페이스

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
}

async function fetchUser(id: number): Promise<ApiResponse<User>> {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

const response = await fetchUser(1);
console.log(response.data.name); // ✅ name: string 타입 보장
```

---

## 유틸리티 타입

TypeScript 내장 유틸리티 타입으로 기존 타입을 변환합니다.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Partial<T> — 모든 속성을 선택적으로
type UpdateUser = Partial<User>;
// { id?: number; name?: string; email?: string; password?: string }

// Required<T> — 모든 속성을 필수로
type StrictUser = Required<User>;

// Pick<T, K> — 특정 속성만 선택
type PublicUser = Pick<User, 'id' | 'name' | 'email'>;
// { id: number; name: string; email: string }

// Omit<T, K> — 특정 속성 제외
type SafeUser = Omit<User, 'password'>;
// { id: number; name: string; email: string }

// Readonly<T> — 모든 속성을 읽기 전용으로
type ImmutableUser = Readonly<User>;

// Record<K, V> — 키-값 맵 타입
type UserMap = Record<string, User>;
const users: UserMap = {
  'user-1': { id: 1, name: '홍길동', email: 'hong@example.com', password: '...' },
};
```

---

## 타입 가드(Type Guard)

런타임에 타입을 좁혀 안전하게 사용하는 패턴입니다.

```typescript
interface Cat { type: 'cat'; meow(): void; }
interface Dog { type: 'dog'; bark(): void; }

type Animal = Cat | Dog;

function makeSound(animal: Animal) {
  // 타입 가드: discriminated union
  if (animal.type === 'cat') {
    animal.meow(); // ✅ Cat으로 좁혀짐
  } else {
    animal.bark(); // ✅ Dog으로 좁혀짐
  }
}

// instanceof 타입 가드
function processInput(input: string | Error) {
  if (input instanceof Error) {
    console.error(input.message); // Error로 좁혀짐
  } else {
    console.log(input.toUpperCase()); // string으로 좁혀짐
  }
}
```

---

## 실전 예제: 블로그 포스트 관리

이 블로그 프로젝트에 TypeScript를 적용한다면 어떻게 될까요?

```typescript
interface Post {
  title: string;
  date: string;
  summary: string;
  file: string;
}

async function loadPosts(): Promise<Post[]> {
  const response = await fetch('/posts.json');
  if (!response.ok) throw new Error('게시물을 불러오지 못했습니다');
  return response.json() as Promise<Post[]>;
}

function renderPostCard(post: Post): string {
  return `
    <article class="post-card">
      <h2>${post.title}</h2>
      <time>${post.date}</time>
      <p>${post.summary}</p>
    </article>
  `;
}

async function main() {
  try {
    const posts = await loadPosts();
    const container = document.querySelector<HTMLElement>('#posts');
    if (!container) throw new Error('#posts 요소를 찾을 수 없습니다');
    container.innerHTML = posts.map(renderPostCard).join('');
  } catch (error) {
    console.error(error);
  }
}
```

---

## TypeScript 시작하기

```bash
# TypeScript 설치
npm install -g typescript

# 버전 확인
tsc --version

# tsconfig.json 생성
tsc --init

# .ts 파일을 .js로 컴파일
tsc index.ts

# 감시 모드 (변경 시 자동 컴파일)
tsc --watch
```

기본 `tsconfig.json` 설정:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

`"strict": true` 옵션은 `null` 체크, 암묵적 `any` 금지 등 엄격한 타입 검사를 활성화합니다. 새 프로젝트에서는 반드시 켜두세요.

---

## 마치며

TypeScript의 핵심은 **런타임 오류를 컴파일 타임으로 옮기는 것**입니다. 타입을 명시할수록 IDE 자동완성이 강력해지고, 리팩토링이 안전해지며, 팀원 간 코드 계약이 명확해집니다.

처음에는 타입 오류가 번거롭게 느껴질 수 있지만, 시간이 지날수록 "타입 오류가 없으면 버그가 없다"는 확신을 갖게 됩니다. 기존 JavaScript 프로젝트라면 `.js` → `.ts` 파일 확장자 변경부터 시작해 점진적으로 도입할 수 있습니다.
