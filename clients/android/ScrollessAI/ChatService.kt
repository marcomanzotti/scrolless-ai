package com.scrolless.ai

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

// ───────────────────────────────────────────────────────────────────
// Backend endpoint. NO API KEY HERE — the key lives only on the server.
// 10.0.2.2 is the Android emulator's alias for the host machine (your Mac),
// so it reaches the local backend on the Mac's localhost:3000.
// A physical device needs your Mac's LAN IP instead.
// In production, point this at Scrolless's deployed backend URL.
// ───────────────────────────────────────────────────────────────────
object Config {
    const val CHAT_ENDPOINT = "http://10.0.2.2:3000/api/chat"
}

data class ChatMessage(val role: String, val content: String) // role: "user" | "assistant"

object ChatService {
    /** Sends the full history to the backend and returns the assistant reply. */
    suspend fun send(history: List<ChatMessage>): String = withContext(Dispatchers.IO) {
        val body = JSONObject().put("messages", JSONArray().apply {
            history.forEach { put(JSONObject().put("role", it.role).put("content", it.content)) }
        })

        val conn = (URL(Config.CHAT_ENDPOINT).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            setRequestProperty("Content-Type", "application/json")
            doOutput = true
            connectTimeout = 15000
            readTimeout = 30000
        }
        conn.outputStream.use { it.write(body.toString().toByteArray()) }

        val stream = if (conn.responseCode in 200..299) conn.inputStream else conn.errorStream
        val text = stream.bufferedReader().use { it.readText() }
        val json = JSONObject(text)
        json.optString("reply").ifEmpty {
            throw RuntimeException(json.optString("error", "No reply"))
        }
    }
}
