# Scrolless AI — iOS plugin (SwiftUI)

A small, self-contained chat widget for SwiftUI apps: a floating button that
opens a native chat screen calling the shared `/api/chat` backend. **No API
key in this code** — the key lives only on the server.

This is **not** a standalone app — it's 4 files meant to be dropped into the
real Scrolless iOS app.

## Files

| File | Purpose |
|------|---------|
| `ChatButton.swift` | The floating action button. Drop its `.overlay` onto your root view. |
| `ChatView.swift` | The chat screen (message list + input) and its view model. |
| `ChatService.swift` | Networking to `/api/chat` — set the backend URL here. |
| `Theme.swift` | Color palette sampled from the real Scrolless site (dark slate + warm peach accent). |

## How to integrate

1. Copy the 4 `.swift` files into your Xcode project (drag the
   `clients/ios/ScrollessAI/` folder in, check *Copy items if needed*).
2. In `ChatService.swift`, set `Config.chatEndpoint` to your deployed backend:
   ```swift
   static let chatEndpoint = URL(string: "https://<scrolless-backend>/api/chat")!
   ```
3. On your root view, add the button + sheet:
   ```swift
   struct ContentView: View {
       @State private var showChat = false
       var body: some View {
           YourExistingContent()
               .overlay(alignment: .bottomTrailing) {
                   if !showChat {
                       ChatButton(showChat: $showChat)
                           .padding(.trailing, 20).padding(.bottom, 24)
                   }
               }
               .sheet(isPresented: $showChat) {
                   ChatView(onClose: { showChat = false })
                       .presentationDetents([.large])
               }
       }
   }
   ```
   Hiding the button while `showChat` is `true` keeps it from floating
   behind the open chat panel.

## Local testing

While testing against a backend running on your Mac (see the root
[README](../../README.md) for `npm start`), point `Config.chatEndpoint` at
`http://localhost:3000/api/chat` (Simulator) or your Mac's LAN IP (physical
device), and add this to your app's `Info.plist` so iOS allows plain HTTP:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
```

Remove that exception once pointed at the production HTTPS backend.
