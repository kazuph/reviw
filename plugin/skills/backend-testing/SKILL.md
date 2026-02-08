---
name: backend-testing
description: Toolkit for backend API testing with proper test frameworks (vitest/jest, go test, pytest, cargo test). Supports verifying API endpoints, database state changes, error handling, and collecting test evidence. curl/httpie for testing is PROHIBITED - use proper test frameworks only. [MANDATORY] Before saying "implementation complete", you MUST use this skill to run tests and verify functionality. Completion reports without verification are PROHIBITED.
license: Complete terms in LICENSE.txt
---

# Backend API Testing

To test backend APIs, use **proper test frameworks** for your language. Manual testing with curl/httpie is strictly prohibited.

**CRITICAL: Test File Placement**
- **ALWAYS** place test files in the project's standard test directory (`tests/`, `__tests__/`, `*_test.go`, etc.)
- **NEVER** place test scripts in `.artifacts/` - that's for evidence only (test output logs, coverage reports)
- Test files should be permanent project assets, not disposable artifacts

## Decision Tree: Framework Selection by Language

```
Project language → Which framework?
    │
    ├─ Node.js / TypeScript
    │   ├─ Vitest (preferred) + supertest
    │   └─ Jest + supertest (if project already uses Jest)
    │
    ├─ Go
    │   └─ go test + net/http/httptest (stdlib)
    │
    ├─ Python
    │   ├─ pytest + httpx (preferred for async)
    │   └─ pytest + requests (sync only)
    │
    └─ Rust
        └─ cargo test + actix-web::test / axum::test / reqwest
```

## Test Framework Selection Table

| Language | Framework | HTTP Client | DB Access |
|----------|-----------|-------------|-----------|
| Node.js/TS | vitest or jest | supertest | prisma / drizzle / knex |
| Go | go test | net/http/httptest | database/sql / sqlx / gorm |
| Python | pytest | httpx / TestClient | sqlalchemy / asyncpg |
| Rust | cargo test | reqwest / framework test utils | sqlx / diesel |

## Example Tests

### Node.js (Vitest + supertest)

```typescript
// tests/api/users.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';

describe('POST /api/users', () => {
  beforeEach(async () => {
    await db.execute('DELETE FROM users WHERE email = ?', ['test@example.com']);
  });

  afterEach(async () => {
    await db.execute('DELETE FROM users WHERE email = ?', ['test@example.com']);
  });

  it('should create a user and return 201', async () => {
    // Act
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' })
      .expect(201);

    // Assert response body
    expect(res.body).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(res.body.id).toBeDefined();

    // Assert DB state changed
    const rows = await db.query('SELECT * FROM users WHERE email = ?', ['test@example.com']);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Test User');
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'not-an-email', name: 'Test User' })
      .expect(400);

    expect(res.body.error).toContain('email');

    // Assert DB was NOT modified
    const rows = await db.query('SELECT * FROM users WHERE email = ?', ['not-an-email']);
    expect(rows).toHaveLength(0);
  });

  it('should return 409 for duplicate email', async () => {
    // Setup: create first user
    await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'First User' })
      .expect(201);

    // Act: attempt duplicate
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Duplicate User' })
      .expect(409);

    expect(res.body.error).toContain('already exists');
  });
});
```

### Go (go test + httptest)

```go
// handlers/users_test.go
package handlers_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
    "myapp/handlers"
    "myapp/db"
)

func TestCreateUser(t *testing.T) {
    testDB := db.SetupTestDB(t)
    defer testDB.Cleanup()

    handler := handlers.NewUserHandler(testDB)

    t.Run("creates user and returns 201", func(t *testing.T) {
        body, _ := json.Marshal(map[string]string{
            "email": "test@example.com",
            "name":  "Test User",
        })

        req := httptest.NewRequest(http.MethodPost, "/api/users", bytes.NewReader(body))
        req.Header.Set("Content-Type", "application/json")
        rec := httptest.NewRecorder()

        handler.CreateUser(rec, req)

        // Assert status code
        assert.Equal(t, http.StatusCreated, rec.Code)

        // Assert response body
        var resp map[string]interface{}
        err := json.Unmarshal(rec.Body.Bytes(), &resp)
        require.NoError(t, err)
        assert.Equal(t, "test@example.com", resp["email"])

        // Assert DB state
        user, err := testDB.GetUserByEmail("test@example.com")
        require.NoError(t, err)
        assert.Equal(t, "Test User", user.Name)
    })

    t.Run("returns 400 for invalid email", func(t *testing.T) {
        body, _ := json.Marshal(map[string]string{
            "email": "not-an-email",
            "name":  "Test User",
        })

        req := httptest.NewRequest(http.MethodPost, "/api/users", bytes.NewReader(body))
        req.Header.Set("Content-Type", "application/json")
        rec := httptest.NewRecorder()

        handler.CreateUser(rec, req)

        assert.Equal(t, http.StatusBadRequest, rec.Code)
    })
}
```

### Python (pytest + httpx)

```python
# tests/test_users.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db import get_session

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture(autouse=True)
async def cleanup_db():
    yield
    async with get_session() as session:
        await session.execute("DELETE FROM users WHERE email = 'test@example.com'")
        await session.commit()

@pytest.mark.asyncio
async def test_create_user_returns_201(client: AsyncClient):
    # Act
    response = await client.post("/api/users", json={
        "email": "test@example.com",
        "name": "Test User",
    })

    # Assert status code
    assert response.status_code == 201

    # Assert response body
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "id" in data

    # Assert DB state changed
    async with get_session() as session:
        result = await session.execute(
            "SELECT * FROM users WHERE email = 'test@example.com'"
        )
        rows = result.fetchall()
        assert len(rows) == 1
        assert rows[0].name == "Test User"

@pytest.mark.asyncio
async def test_create_user_invalid_email_returns_400(client: AsyncClient):
    response = await client.post("/api/users", json={
        "email": "not-an-email",
        "name": "Test User",
    })

    assert response.status_code == 400
    assert "email" in response.json()["detail"]
```

### Rust (cargo test)

```rust
// tests/api/users.rs
use actix_web::test;
use actix_web::web::Data;
use myapp::{create_app, db::TestDb};

#[actix_web::test]
async fn test_create_user_returns_201() {
    let test_db = TestDb::new().await;
    let app = test::init_service(create_app(Data::new(test_db.pool.clone()))).await;

    let req = test::TestRequest::post()
        .uri("/api/users")
        .set_json(serde_json::json!({
            "email": "test@example.com",
            "name": "Test User"
        }))
        .to_request();

    let resp = test::call_service(&app, req).await;

    // Assert status code
    assert_eq!(resp.status(), 201);

    // Assert response body
    let body: serde_json::Value = test::read_body_json(resp).await;
    assert_eq!(body["email"], "test@example.com");
    assert_eq!(body["name"], "Test User");

    // Assert DB state
    let row = sqlx::query!("SELECT name FROM users WHERE email = $1", "test@example.com")
        .fetch_one(&test_db.pool)
        .await
        .unwrap();
    assert_eq!(row.name, "Test User");

    test_db.cleanup().await;
}

#[actix_web::test]
async fn test_create_user_invalid_email_returns_400() {
    let test_db = TestDb::new().await;
    let app = test::init_service(create_app(Data::new(test_db.pool.clone()))).await;

    let req = test::TestRequest::post()
        .uri("/api/users")
        .set_json(serde_json::json!({
            "email": "not-an-email",
            "name": "Test User"
        }))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 400);

    test_db.cleanup().await;
}
```

## Running Tests with Evidence Collection

### Node.js
```bash
FEATURE=${FEATURE:-feature}
mkdir -p .artifacts/$FEATURE

# Run tests with output capture
npx vitest run tests/api/ --reporter=verbose 2>&1 | tee .artifacts/$FEATURE/test-results.txt

# Generate coverage report
npx vitest run tests/api/ --coverage --coverage.reporter=html --coverage.reportsDirectory=.artifacts/$FEATURE/coverage/
```

### Go
```bash
FEATURE=${FEATURE:-feature}
mkdir -p .artifacts/$FEATURE/coverage

# Run tests with verbose output
go test -v -count=1 ./... 2>&1 | tee .artifacts/$FEATURE/test-results.txt

# Generate coverage
go test -coverprofile=.artifacts/$FEATURE/coverage/coverage.out ./...
go tool cover -html=.artifacts/$FEATURE/coverage/coverage.out -o .artifacts/$FEATURE/coverage/coverage.html
```

### Python
```bash
FEATURE=${FEATURE:-feature}
mkdir -p .artifacts/$FEATURE/coverage

# Run tests with verbose output
pytest tests/ -v 2>&1 | tee .artifacts/$FEATURE/test-results.txt

# Generate coverage
pytest tests/ --cov=app --cov-report=html:.artifacts/$FEATURE/coverage/ --cov-report=json:.artifacts/$FEATURE/coverage/coverage.json
```

### Rust
```bash
FEATURE=${FEATURE:-feature}
mkdir -p .artifacts/$FEATURE

# Run tests with verbose output
cargo test -- --nocapture 2>&1 | tee .artifacts/$FEATURE/test-results.txt

# Generate coverage (requires cargo-llvm-cov)
cargo llvm-cov --html --output-dir .artifacts/$FEATURE/coverage/
```

## Prohibited Patterns

| Category | Prohibited | Why | Use Instead |
|----------|-----------|-----|-------------|
| **curl/httpie** | `curl`, `http`, `wget` for testing | Not repeatable, no assertions | Test framework + HTTP client |
| **DB Mocks** | `jest.fn()` / `vi.fn()` for DB | Hides real query bugs | Test DB instance / emulator |
| **Network Mocks** | `nock`, `msw`, `httpretty` | Hides real API behavior | Real local services / emulators |
| **Status-code-only** | `expect(res.status).toBe(200)` alone | Misses body/DB bugs | Assert status + body + DB state |
| **Sleep-based waits** | `setTimeout`, `time.sleep` in tests | Flaky, slow | Polling / retry with timeout |
| **Hardcoded IDs** | `expect(res.body.id).toBe(1)` | Brittle, order-dependent | `toBeDefined()` or dynamic check |

## Mandatory Test Patterns

Every API test MUST include:

| Pattern | Requirement | Example |
|---------|------------|---------|
| **Status code** | Assert correct HTTP status | `expect(res.status).toBe(201)` |
| **Response body** | Assert response structure and values | `expect(res.body.email).toBe(...)` |
| **DB state change** | Verify the database was actually modified | `SELECT * FROM users WHERE ...` |
| **Error cases** | Test 400, 401, 403, 404, 409, 500 | Invalid input, unauthorized, not found |
| **Auth/Authz** | Test with and without valid credentials | Token missing, expired, wrong role |

## Evidence Collection

### What Constitutes Valid Evidence

| Evidence Type | Format | Location |
|--------------|--------|----------|
| Test output log | `.txt` | `.artifacts/<feature>/test-results.txt` |
| Coverage report | HTML / JSON | `.artifacts/<feature>/coverage/` |
| Test summary | In REPORT.md | `.artifacts/<feature>/REPORT.md` |

### REPORT.md Test Results Section Template

```markdown
### Test Results

| Suite | Tests | Passed | Failed | Duration |
|-------|-------|--------|--------|----------|
| API Users | 8 | 8 | 0 | 1.2s |
| API Auth | 5 | 5 | 0 | 0.8s |
| **Total** | **13** | **13** | **0** | **2.0s** |

<details>
<summary>Full test output</summary>

\`\`\`bash
# Command executed
npx vitest run tests/api/ --reporter=verbose

# Output
 ✓ tests/api/users.test.ts (8 tests) 1.2s
 ✓ tests/api/auth.test.ts (5 tests) 0.8s

 Test Files  2 passed (2)
      Tests  13 passed (13)
   Start at  15:30:00
   Duration  2.0s
\`\`\`

</details>

### Coverage

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| src/handlers/users.ts | 95% | 88% | 100% | 95% |
| src/handlers/auth.ts | 92% | 85% | 100% | 92% |

Full coverage report: `./coverage/index.html`
```

## File Structure Convention

```
project/
├── tests/                    # Test code (permanent)
│   ├── api/
│   │   ├── users.test.ts
│   │   ├── auth.test.ts
│   │   └── orders.test.ts
│   ├── integration/
│   │   └── db.test.ts
│   └── fixtures/
│       └── seed.ts
├── .artifacts/               # Evidence only (temporary)
│   └── <feature>/
│       ├── test-results.txt  # Test output log
│       ├── coverage/         # Coverage report (HTML/JSON)
│       └── REPORT.md         # Review report
└── vitest.config.ts          # Test configuration
```

**Key distinction:**
- `tests/` = Permanent test code (committed to repo)
- `.artifacts/` = Temporary evidence for PR review (gitignored or LFS)

## Common Pitfalls

- **Don't** test with curl and paste output as evidence
- **Do** use test frameworks that produce repeatable, assertable results

- **Don't** assert only status codes
- **Do** assert status + response body + DB state changes

- **Don't** mock the database layer
- **Do** use a real test database (SQLite in-memory, Docker Postgres, emulators)

- **Don't** place test files in `.artifacts/`
- **Do** place test files in the project's standard test directory

- **Don't** skip error case testing
- **Do** test every error path: 400, 401, 403, 404, 409, 500

## Best Practices

- **Use test databases** - Real DB instances (SQLite in-memory, Docker containers, emulators)
- **Clean up between tests** - Each test should be independent (beforeEach/afterEach cleanup)
- **Test error paths thoroughly** - Error handling is where most bugs hide
- **Assert DB state changes** - API response alone is not sufficient evidence
- **Collect evidence automatically** - Pipe test output to `.artifacts/` with `tee`
- **Generate coverage reports** - HTML coverage helps identify untested paths
- **Use realistic test data** - Not "test", "foo", "bar" but plausible values
