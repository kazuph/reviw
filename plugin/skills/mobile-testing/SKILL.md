---
name: mobile-testing
description: Toolkit for mobile app testing using Maestro MCP. Supports launching apps, interacting with UI elements, capturing screenshots, running automated flows, and collecting test evidence for iOS and Android. [MANDATORY] Before saying "implementation complete", you MUST use this skill to run tests and verify functionality. Completion reports without verification are PROHIBITED.
license: Complete terms in LICENSE.txt
---

# Mobile Application Testing

To test mobile applications, use **Maestro MCP** for UI automation and verification. Maestro provides a simple, reliable way to test mobile apps on both iOS and Android.

**CRITICAL: Maestro MCP Installation Check**

Before using any Maestro functionality, verify the MCP server is available:

```bash
# Check if Maestro MCP is configured
claude mcp list | grep maestro
```

If not installed, add it:

```bash
claude mcp add maestro -- npx @nicepkg/maestro-mcp@latest
```

After adding, **restart Claude Code** to activate the MCP server.

**CRITICAL: Flow File Placement**
- **ALWAYS** place Maestro flow files in `maestro/flows/` directory at the project root
- **NEVER** place flow files in `.artifacts/` - that's for evidence only (screenshots, test logs)
- Flow files should be permanent project assets, not disposable artifacts

## Decision Tree: Getting Started

```
Task → Is Maestro MCP available?
    │
    ├─ No → Install Maestro MCP
    │   └─ claude mcp add maestro -- npx @nicepkg/maestro-mcp@latest
    │   └─ Restart Claude Code
    │   └─ Retry
    │
    └─ Yes → Is a device/simulator running?
        ├─ No → list_devices → start_device
        │
        └─ Yes → Is the app installed?
            ├─ No → Build & install the app first
            │
            └─ Yes → Reconnaissance-then-action:
                1. launch_app
                2. take_screenshot (understand current state)
                3. inspect_view_hierarchy (find element IDs)
                4. Interact (tap_on, input_text, etc.)
                5. take_screenshot (verify result)
                6. Collect evidence
```

## Maestro MCP Tools Reference

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `list_devices` | List available devices/simulators | - |
| `start_device` | Start a device/simulator | `deviceId`, `platform` |
| `launch_app` | Launch an app on the device | `appId` (bundle ID / package name) |
| `take_screenshot` | Capture the current screen | - |
| `tap_on` | Tap on a UI element | `text`, `id`, `point` |
| `input_text` | Type text into focused field | `text` |
| `back` | Press the back button | - |
| `stop_app` | Stop a running app | `appId` |
| `run_flow` | Execute a Maestro YAML flow | `yaml` (inline YAML content) |
| `run_flow_files` | Execute flow files from disk | `paths` (file paths) |
| `check_flow_syntax` | Validate flow YAML syntax | `yaml` or `paths` |
| `inspect_view_hierarchy` | Get the current UI element tree | - |
| `query_docs` | Search Maestro documentation | `query` |
| `cheat_sheet` | Get quick reference for Maestro commands | - |

## YAML Flow File Format

### Basic Flow

```yaml
# maestro/flows/login.yaml
appId: com.example.myapp
---
- launchApp
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Log In"
- assertVisible: "Welcome"
```

### Flow with Screenshots (Evidence Collection)

```yaml
# maestro/flows/login-with-evidence.yaml
appId: com.example.myapp
---
- launchApp
- takeScreenshot: .artifacts/feature/images/01-login-screen

- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- takeScreenshot: .artifacts/feature/images/02-credentials-filled

- tapOn: "Log In"
- assertVisible: "Welcome"
- takeScreenshot: .artifacts/feature/images/03-login-success
```

### Error Handling Flow

```yaml
# maestro/flows/login-error.yaml
appId: com.example.myapp
---
- launchApp
- tapOn: "Email"
- inputText: "invalid@example.com"
- tapOn: "Password"
- inputText: "wrong"
- tapOn: "Log In"
- assertVisible: "Invalid credentials"
- takeScreenshot: .artifacts/feature/images/04-login-error
```

### Flow with Conditional Logic

```yaml
# maestro/flows/onboarding.yaml
appId: com.example.myapp
---
- launchApp

# Skip onboarding if already completed
- runFlow:
    when:
      visible: "Get Started"
    commands:
      - tapOn: "Get Started"
      - tapOn: "Next"
      - tapOn: "Next"
      - tapOn: "Done"

- assertVisible: "Home"
```

### Flow with Scroll and Swipe

```yaml
# maestro/flows/feed-scroll.yaml
appId: com.example.myapp
---
- launchApp
- assertVisible: "Feed"

# Scroll down to find content
- scrollUntilVisible:
    element: "Load More"
    direction: DOWN
    timeout: 10000

- tapOn: "Load More"
- assertVisible: "More Items"
```

## Autonomous Testing Workflow

### Phase 1: Reconnaissance

```
1. list_devices → Identify available simulators/devices
2. start_device → Boot the target device
3. launch_app → Open the app under test
4. take_screenshot → Capture initial state
5. inspect_view_hierarchy → Map all UI elements and their IDs
```

### Phase 2: Write Flows

Based on reconnaissance:
- Identify testable user flows
- Map element selectors (testID > text > point)
- Write YAML flow files in `maestro/flows/`
- Validate syntax with `check_flow_syntax`

### Phase 3: Execute & Debug

```
1. run_flow / run_flow_files → Execute test flows
2. If failure:
   a. take_screenshot → Capture failure state
   b. inspect_view_hierarchy → Check element state
   c. Fix the flow or report the bug
   d. Re-run
3. If success:
   a. take_screenshot → Capture success state
   b. Proceed to evidence collection
```

### Phase 4: Collect Evidence

```bash
FEATURE=${FEATURE:-feature}
mkdir -p .artifacts/$FEATURE/{images,videos}

# Run flows with evidence collection
# (Screenshots taken within flows land in .artifacts/)

# Copy any additional evidence
cp maestro/test-results/*.png .artifacts/$FEATURE/images/
```

## Element Selection Best Practices

**Priority order**: testID > accessibility label > text content > position

### React Native

```jsx
// Best: testID
<TouchableOpacity testID="login-button">
  <Text>Log In</Text>
</TouchableOpacity>

// Maestro flow
- tapOn:
    id: "login-button"
```

### Flutter

```dart
// Best: Key
ElevatedButton(
  key: const Key('login-button'),
  onPressed: _login,
  child: const Text('Log In'),
)

// Also: Semantics
Semantics(
  identifier: 'login-button',
  child: ElevatedButton(...),
)

// Maestro flow
- tapOn:
    id: "login-button"
```

### SwiftUI

```swift
// Best: accessibilityIdentifier
Button("Log In") {
    login()
}
.accessibilityIdentifier("login-button")

// Maestro flow
- tapOn:
    id: "login-button"
```

### Kotlin (Jetpack Compose)

```kotlin
// Best: testTag
Button(
    onClick = { login() },
    modifier = Modifier.testTag("login-button")
) {
    Text("Log In")
}

// Maestro flow
- tapOn:
    id: "login-button"
```

### Maestro Selector Priority Table

| Priority | Selector | Example | Reliability |
|----------|----------|---------|-------------|
| 1 | `id` (testID) | `id: "login-button"` | Highest - stable across UI changes |
| 2 | `text` (exact) | `text: "Log In"` | High - breaks on text changes |
| 3 | `text` (regex) | `text: "Log.*"` | Medium - more flexible |
| 4 | `point` (x, y) | `point: "50%,80%"` | Low - breaks on layout changes |

## File Structure Convention

```
project/
├── maestro/                  # Maestro test assets (permanent)
│   └── flows/
│       ├── login.yaml
│       ├── login-error.yaml
│       ├── checkout.yaml
│       └── onboarding.yaml
├── .artifacts/               # Evidence only (temporary)
│   └── <feature>/
│       ├── images/           # Screenshots
│       ├── videos/           # Recorded videos
│       └── REPORT.md         # Review report
└── src/                      # Application source
```

**Key distinction:**
- `maestro/flows/` = Permanent test flow files (committed to repo)
- `.artifacts/` = Temporary evidence for PR review (gitignored or LFS)

## Common Pitfalls

- **Don't** use `point` (x, y coordinates) as primary selectors
- **Do** use `id` (testID/accessibilityIdentifier) for reliable element selection

- **Don't** place flow files in `.artifacts/`
- **Do** place flows in `maestro/flows/` as permanent project assets

- **Don't** skip the reconnaissance step
- **Do** always `inspect_view_hierarchy` before writing selectors

- **Don't** hardcode wait times
- **Do** use `assertVisible` which has built-in retry/timeout

- **Don't** test only the happy path
- **Do** test error states, empty states, edge cases

- **Don't** forget to add testID/accessibilityIdentifier to new UI elements
- **Do** add testability attributes during implementation, not as an afterthought

## REPORT.md Test Results Section Template

```markdown
### Mobile Test Results

| Flow | Platform | Status | Duration | Evidence |
|------|----------|--------|----------|----------|
| Login (happy path) | iOS 17 | Pass | 4.2s | ![](./images/login-success.png) |
| Login (error) | iOS 17 | Pass | 3.1s | ![](./images/login-error.png) |
| Checkout | iOS 17 | Pass | 8.5s | ![](./images/checkout-complete.png) |
| **Total** | - | **3/3 Pass** | **15.8s** | - |

### Screenshots

| Step 1: Login | Step 2: Credentials | Step 3: Dashboard |
|--------------|--------------------|--------------------|
| ![Login](./images/01-login.png) | ![Filled](./images/02-filled.png) | ![Dashboard](./images/03-dashboard.png) |

<details>
<summary>Flow execution logs</summary>

\`\`\`bash
# Flow: login.yaml
Running on iPhone 15 Pro (iOS 17.2)
 - launchApp: com.example.myapp ... OK
 - tapOn: "Email" ... OK (0.3s)
 - inputText: "test@example.com" ... OK (0.1s)
 - tapOn: "Password" ... OK (0.2s)
 - inputText: "password123" ... OK (0.1s)
 - tapOn: "Log In" ... OK (0.5s)
 - assertVisible: "Welcome" ... OK (1.2s)

Flow completed successfully in 4.2s
\`\`\`

</details>
```

## Best Practices

- **Add testID early** - Add testability attributes during implementation, not later
- **Use descriptive flow names** - `login-happy-path.yaml`, not `test1.yaml`
- **One flow per user story** - Keep flows focused and independent
- **Include error flows** - Test what happens when things go wrong
- **Screenshot at key steps** - Before action, after action, final state
- **Use `inspect_view_hierarchy`** - Always discover elements before writing selectors
- **Validate before running** - Use `check_flow_syntax` to catch YAML errors
- **Keep flows idempotent** - Each flow should be runnable independently
- **Test on multiple devices** - Different screen sizes reveal layout issues
