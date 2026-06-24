# Scrolless AI — iOS client (SwiftUI)

A minimal native app: a floating chat button that opens a native chat screen,
calling the shared `/api/chat` backend. **No API key in this code** — the key
lives only on the server.

## Files

| File | Purpose |
|------|---------|
| `ScrollessAIApp.swift` | App entry point |
| `DemoHomeView.swift` | Mock home screen + the reusable `ChatButton` overlay |
| `ChatView.swift` | Native chat UI + view model |
| `ChatService.swift` | Networking to `/api/chat` (set the URL here) |
| `Theme.swift` | Scrolless palette (cream / brown / tan) |
| `Info.plist` | Allows HTTP to localhost for the local demo |

## Open in Xcode

There is no `.xcodeproj` checked in (it's machine-specific). Create one in ~1 minute:

1. Xcode → **File ▸ New ▸ Project… ▸ App**. Product name `ScrollessAI`,
   Interface **SwiftUI**, Language **Swift**.
2. Delete the auto-generated `ContentView.swift` and `…App.swift`.
3. Drag the six files from this folder into the project (check *Copy items if needed*).
4. In the target's **Info** tab, add the `NSAppTransportSecurity` →
   `NSAllowsLocalNetworking = YES` key (or replace the generated Info.plist
   with the one here).
5. Run on the **iOS Simulator** (it reaches your Mac's `localhost` directly).

## Point it at the backend

Edit `ChatService.swift` → `Config.chatEndpoint`:

- **Local demo, Simulator:** `http://localhost:3000/api/chat` (default)
- **Local demo, physical device:** `http://<your-mac-LAN-IP>:3000/api/chat`
- **Production:** `https://<scrolless-backend>/api/chat`

## Integrate into the real Scrolless app

You only need the `.overlay { ChatButton(...) }` block from `DemoHomeView.swift`
plus `ChatView.swift`, `ChatService.swift`, and `Theme.swift`. Drop the overlay
on top of your existing root view.
