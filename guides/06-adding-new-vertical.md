# Adding a New Vertical

## What is a Vertical?

A vertical is a domain-specific configuration for the OverSite platform. Construction is the first vertical. Others (electrical, plumbing, solar inspections) can be added.

## VerticalConfiguration Protocol

Each vertical implements this Swift protocol:

```swift
protocol VerticalConfiguration {
    var id: String { get }
    var displayName: String { get }
    var systemPrompt: String { get }
    var toolDeclarations: [[String: Any]] { get }

    func handleToolCall(_ call, sessionManager:) async -> ToolResult?
    func asyncFanOutTask(for call, result:, sessionManager:) -> AsyncFanOutTask?
    func contextBlock(sessionManager:) async -> String?
    func generateReport(from session:) async -> ReportOutput?
}
```

## Steps to Add a New Vertical

### 1. Create the Configuration File

Create `ios/.../Verticals/NewVerticalConfig.swift`:

```swift
import Foundation

class NewVerticalConfig: VerticalConfiguration {
    let id = "new_vertical"
    let displayName = "New Vertical"

    var systemPrompt: String {
        """
        You are an AI assistant helping with [domain-specific task].

        You can:
        - [Capability 1]
        - [Capability 2]

        Always be helpful and professional.
        """
    }

    var toolDeclarations: [[String: Any]] {
        [
            [
                "name": "my_tool",
                "description": "Does something useful",
                "parameters": [
                    "type": "object",
                    "properties": [
                        "param1": ["type": "string", "description": "First parameter"]
                    ],
                    "required": ["param1"]
                ]
            ]
        ]
    }

    func handleToolCall(_ call: ToolCall, sessionManager: SessionManager) async -> ToolResult? {
        switch call.name {
        case "my_tool":
            // Handle the tool call locally
            let result = "Tool executed successfully"
            return ToolResult(success: true, message: result)
        default:
            return nil  // Falls through to Agent
        }
    }

    func asyncFanOutTask(for call: ToolCall, result: ToolResult, sessionManager: SessionManager) -> AsyncFanOutTask? {
        // Optional: dispatch async work to Agent
        return nil
    }

    func contextBlock(sessionManager: SessionManager) async -> String? {
        // Optional: inject context into system prompt
        return nil
    }

    func generateReport(from session: WalkthroughSession) async -> ReportOutput? {
        // Optional: generate end-of-session report
        return nil
    }
}
```

### 2. Register in the Vertical Picker

Add to `NonStreamView.swift`:

```swift
let verticals: [VerticalConfiguration] = [
    ConstructionConfig(),
    NewVerticalConfig(),  // Add here
    GeneralConfig()
]
```

### 3. Add Event Types (if needed)

If your vertical has custom events, add them to:
- `ios/.../EventStore/EventTypes.swift`
- `src/types/events.ts`

### 4. Update Dashboard (if needed)

If your vertical needs custom dashboard views, add components to `src/components/dashboard/`.

## Important Notes

- **Ask Sean** to add the new Swift file to the Xcode project
- New verticals are OverSite-specific -- never push to VisionClaw upstream
- Test thoroughly before deploying
- Consider how the vertical will appear in the dashboard event timeline
