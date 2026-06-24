import SwiftUI

@MainActor
final class ChatViewModel: ObservableObject {
    @Published var messages: [ChatMessage] = [
        ChatMessage(role: .assistant,
                    content: "Hi! I'm Scrolless AI. Ask me about pricing, how the app works, privacy, or troubleshooting. 👋")
    ]
    @Published var input: String = ""
    @Published var isSending = false

    func send() {
        let text = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, !isSending else { return }
        messages.append(ChatMessage(role: .user, content: text))
        input = ""
        isSending = true

        Task {
            do {
                let reply = try await ChatService.send(history: messages)
                messages.append(ChatMessage(role: .assistant, content: reply))
            } catch {
                messages.append(ChatMessage(role: .assistant,
                    content: "Oops, something went wrong. Please try again or email info@scrolless.com."))
            }
            isSending = false
        }
    }
}

struct ChatView: View {
    @StateObject private var vm = ChatViewModel()
    var onClose: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack(spacing: 10) {
                Circle().fill(Theme.tan).frame(width: 8, height: 8)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Scrolless AI").font(.system(size: 15, weight: .semibold))
                    Text("Here to help with your eyes").font(.system(size: 12)).opacity(0.8)
                }
                Spacer()
                Button(action: onClose) {
                    Image(systemName: "xmark").font(.system(size: 16, weight: .semibold))
                }
            }
            .foregroundColor(Theme.cream)
            .padding(16)
            .background(Theme.brown)

            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 10) {
                        ForEach(vm.messages) { msg in
                            bubble(msg).id(msg.id)
                        }
                        if vm.isSending {
                            HStack { TypingDots(); Spacer() }.padding(.horizontal, 4)
                        }
                    }
                    .padding(16)
                }
                .onChange(of: vm.messages.count) { _ in
                    if let last = vm.messages.last { withAnimation { proxy.scrollTo(last.id, anchor: .bottom) } }
                }
            }
            .background(Theme.cream)

            // Input
            HStack(spacing: 8) {
                TextField("Type your question…", text: $vm.input)
                    .padding(.horizontal, 14).padding(.vertical, 10)
                    .background(Color.white)
                    .overlay(RoundedRectangle(cornerRadius: 22).stroke(Theme.border))
                    .clipShape(RoundedRectangle(cornerRadius: 22))
                    .onSubmit { vm.send() }
                Button(action: vm.send) {
                    Image(systemName: "paperplane.fill")
                        .foregroundColor(.white)
                        .frame(width: 40, height: 40)
                        .background(Theme.tan)
                        .clipShape(Circle())
                }
                .disabled(vm.input.trimmingCharacters(in: .whitespaces).isEmpty || vm.isSending)
            }
            .padding(12)
            .background(Theme.cream)
        }
        .clipShape(RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(Theme.border))
    }

    @ViewBuilder private func bubble(_ msg: ChatMessage) -> some View {
        HStack {
            if msg.role == .user { Spacer() }
            Text(msg.content)
                .font(.system(size: 14))
                .foregroundColor(msg.role == .user ? Theme.cream : Theme.text)
                .padding(.horizontal, 13).padding(.vertical, 10)
                .background(msg.role == .user ? Theme.brown : Color.white)
                .overlay(msg.role == .assistant ?
                         RoundedRectangle(cornerRadius: 14).stroke(Theme.border) : nil)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .frame(maxWidth: 260, alignment: msg.role == .user ? .trailing : .leading)
            if msg.role == .assistant { Spacer() }
        }
    }
}

// Animated "typing" indicator.
struct TypingDots: View {
    @State private var phase = 0.0
    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<3) { i in
                Circle().fill(Theme.tan).frame(width: 7, height: 7)
                    .opacity(phase == Double(i) ? 1 : 0.4)
            }
        }
        .padding(.horizontal, 14).padding(.vertical, 12)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .onAppear {
            Timer.scheduledTimer(withTimeInterval: 0.3, repeats: true) { _ in
                phase = (phase + 1).truncatingRemainder(dividingBy: 3)
            }
        }
    }
}
