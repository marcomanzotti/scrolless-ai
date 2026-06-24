# Scrolless AI — Android plugin (Kotlin + Jetpack Compose)

A small, self-contained chat widget for Compose apps: a floating button that
opens a chat bottom sheet calling the shared `/api/chat` backend. **No API
key in this code** — the key lives only on the server.

This is **not** a standalone app — it's 2 files meant to be dropped into the
real Scrolless Android app.

## Files

| File | Purpose |
|------|---------|
| `ScrollessAI/ChatPlugin.kt` | `Theme` (color palette), `ChatViewModel`, the `ChatButton` composable, `ChatSheet` (the chat UI), and `Bubble`. |
| `ScrollessAI/ChatService.kt` | Networking to `/api/chat` — set the backend URL here. |

## How to integrate

1. Copy both `.kt` files into your app's module (e.g. into
   `app/src/main/java/com/yourpackage/`), adjusting the `package` line to
   match your project.
2. In `ChatService.kt`, set `Config.CHAT_ENDPOINT` to your deployed backend:
   ```kotlin
   const val CHAT_ENDPOINT = "https://<scrolless-backend>/api/chat"
   ```
3. Add the `INTERNET` permission to your `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   ```
4. In your screen, add the button + sheet:
   ```kotlin
   @Composable
   fun YourScreen() {
       var showChat by remember { mutableStateOf(false) }
       Box(Modifier.fillMaxSize()) {
           YourExistingContent()
           if (!showChat) {
               ChatButton(
                   onClick = { showChat = true },
                   modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp)
               )
           }
           if (showChat) ChatSheet(onClose = { showChat = false })
       }
   }
   ```
   Hiding the button while `showChat` is `true` keeps it from floating
   behind the open chat sheet.

## Local testing

While testing against a backend running on your Mac (see the root
[README](../../README.md) for `npm start`), point `Config.CHAT_ENDPOINT` at
`http://10.0.2.2:3000/api/chat` (Android emulator — `10.0.2.2` is the host
alias) or your Mac's LAN IP (physical device), and allow cleartext HTTP for
that host in a `network_security_config.xml`:

```xml
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

referenced from your manifest's `<application android:networkSecurityConfig="@xml/network_security_config">`.
Remove this once pointed at the production HTTPS backend.
