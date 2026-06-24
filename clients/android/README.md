# Scrolless AI — Android client (Kotlin + Jetpack Compose)

A minimal native app: a floating chat button that opens a native chat screen,
calling the shared `/api/chat` backend. **No API key in this code** — the key
lives only on the server.

## Files

| File | Purpose |
|------|---------|
| `app/src/main/java/com/scrolless/ai/MainActivity.kt` | Demo home (real scrolless.com screenshot as background) + reusable FAB + chat UI + color palette |
| `app/src/main/java/com/scrolless/ai/ChatService.kt` | Networking to `/api/chat` (set the URL here) |
| `app/src/main/AndroidManifest.xml` | Internet permission + cleartext config |
| `app/src/main/res/xml/network_security_config.xml` | Allows HTTP to the local backend (demo only) |
| `app/src/main/res/drawable/hero_background.png` | The real scrolless.com hero screenshot, used as the demo background |
| `build.gradle.kts`, `settings.gradle.kts`, `app/build.gradle.kts` | Gradle build |

## Open in Android Studio

1. **File ▸ Open…** and select this `android/` folder.
2. Let Gradle sync (it downloads the Android Gradle Plugin + Compose).
3. Run on an **emulator** (it reaches your Mac's localhost via `10.0.2.2`).

> The Gradle wrapper (`gradlew`) is not checked in. Android Studio generates it
> on first sync, or run `gradle wrapper` once if you have Gradle installed.

## Point it at the backend

Edit `ChatService.kt` → `Config.CHAT_ENDPOINT`:

- **Local demo, emulator:** `http://10.0.2.2:3000/api/chat` (default — `10.0.2.2` is the host alias)
- **Local demo, physical device:** `http://<your-mac-LAN-IP>:3000/api/chat`
- **Production:** `https://<scrolless-backend>/api/chat`

## Integrate into the real Scrolless app

Reuse the `FloatingActionButton` block and the `ChatSheet` / `Bubble` composables
from `MainActivity.kt`, plus `ChatService.kt`. Add `INTERNET` permission to your
manifest. In production you can delete `network_security_config.xml` (HTTPS) and
the `hero_background.png` drawable (only used for this demo's mock home screen).

> `hero_background.png` is a single ~3 MB image with no density variants —
> fine for this demo, but for production provide proper `drawable-*dpi` variants
> or switch to a `Coil`/`Glide`-loaded remote image.
