import SwiftUI

// Demo home screen using the real scrolless.com hero screenshot as a
// full-bleed background, with the floating chat button overlaid in the
// bottom-right corner — so you can show exactly how it'd look live.
//
// To integrate into the real Scrolless app, you only need the `.overlay`
// block below (the ChatButton). Drop it on top of your existing root view.
struct DemoHomeView: View {
    @State private var showChat = false

    var body: some View {
        GeometryReader { geo in
            Image("HeroBackground")
                .resizable()
                .scaledToFill()
                .frame(width: geo.size.width, height: geo.size.height)
                .clipped()
                .ignoresSafeArea()
        }
        // ▼▼▼ This overlay is the reusable piece for the real app ▼▼▼
        .overlay(alignment: .bottomTrailing) {
            if !showChat {
                ChatButton(showChat: $showChat)
                    .padding(.trailing, 20).padding(.bottom, 24)
            }
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
                .foregroundColor(Theme.peach)
                .frame(width: 60, height: 60)
                .background(Theme.dark)
                .overlay(Circle().stroke(Theme.slateLight, lineWidth: 1))
                .clipShape(Circle())
                .shadow(color: Color.black.opacity(0.45), radius: 12, y: 6)
        }
        .accessibilityLabel("Open Scrolless AI chat")
    }
}
