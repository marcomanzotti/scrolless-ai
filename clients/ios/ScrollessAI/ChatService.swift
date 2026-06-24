import Foundation

// ───────────────────────────────────────────────────────────────────
// Backend endpoint. NO API KEY HERE — the key lives only on the server.
// For the local demo, the Mac runs the backend on localhost:3000.
// The iOS Simulator can reach the Mac via localhost; a physical device
// needs your Mac's LAN IP (e.g. http://192.168.1.20:3000/api/chat).
// In production, point this at Scrolless's deployed backend URL.
// ───────────────────────────────────────────────────────────────────
enum Config {
    static let chatEndpoint = URL(string: "http://localhost:3000/api/chat")!
}

struct ChatMessage: Identifiable, Codable {
    enum Role: String, Codable { case user, assistant }
    let id = UUID()
    let role: Role
    let content: String

    private enum CodingKeys: String, CodingKey { case role, content }
}

private struct ChatRequest: Encodable { let messages: [WireMessage] }
private struct WireMessage: Encodable { let role: String; let content: String }
private struct ChatResponse: Decodable { let reply: String?; let error: String? }

enum ChatService {
    /// Sends the full history to the backend and returns the assistant reply.
    static func send(history: [ChatMessage]) async throws -> String {
        var req = URLRequest(url: Config.chatEndpoint)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let wire = history.map { WireMessage(role: $0.role.rawValue, content: $0.content) }
        req.httpBody = try JSONEncoder().encode(ChatRequest(messages: wire))

        let (data, _) = try await URLSession.shared.data(for: req)
        let decoded = try JSONDecoder().decode(ChatResponse.self, from: data)
        if let reply = decoded.reply, !reply.isEmpty { return reply }
        throw NSError(domain: "ScrollessAI", code: 1,
                      userInfo: [NSLocalizedDescriptionKey: decoded.error ?? "No reply"])
    }
}
