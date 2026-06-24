import SwiftUI

// Demo home screen that mimics the Scrolless app, with the floating chat
// button overlaid in the bottom-right corner.
//
// To integrate into the real Scrolless app, you only need the `.overlay`
// block below (the ChatButton). Drop it on top of your existing root view.
struct DemoHomeView: View {
    @State private var showChat = false

    var body: some View {
        ZStack {
            Theme.cream.ignoresSafeArea()

            VStack(spacing: 18) {
                Spacer()
                Circle().fill(Theme.tan).frame(width: 16, height: 16)
                Text("Scrolless")
                    .font(.system(size: 22, weight: .bold)).foregroundColor(Theme.brown)
                Text("Your digital life, balanced.\nVision protected.")
                    .multilineTextAlignment(.center)
                    .font(.system(size: 17)).foregroundColor(Theme.text).opacity(0.8)
                    .padding(.horizontal, 40)
                Spacer()
            }
        }
        // ▼▼▼ This overlay is the reusable piece for the real app ▼▼▼
        .overlay(alignment: .bottomTrailing) {
            ChatButton(showChat: $showChat)
                .padding(.trailing, 20).padding(.bottom, 24)
        }
        // ▲▲▲
        .sheet(isPresented: $showChat) {
            ChatView(onClose: { showChat = false })
                .padding(.top, 8)
                .presentationDetents([.large])
        }
    }
}

// The floating action button. Self-contained — reuse anywhere.
struct ChatButton: View {
    @Binding var showChat: Bool
    var body: some View {
        Button(action: { showChat = true }) {
            Image(systemName: "message.fill")
                .font(.system(size: 24))
                .foregroundColor(Theme.cream)
                .frame(width: 60, height: 60)
                .background(Theme.brown)
                .clipShape(Circle())
                .shadow(color: Theme.brown.opacity(0.35), radius: 10, y: 6)
        }
        .accessibilityLabel("Open Scrolless AI chat")
    }
}
