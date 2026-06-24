import SwiftUI

// The floating action button that opens the chat. Drop this `.overlay` onto
// your app's root view:
//
//   YourRootView()
//       .overlay(alignment: .bottomTrailing) {
//           if !showChat {
//               ChatButton(showChat: $showChat)
//                   .padding(.trailing, 20).padding(.bottom, 24)
//           }
//       }
//       .sheet(isPresented: $showChat) {
//           ChatView(onClose: { showChat = false })
//               .presentationDetents([.large])
//       }
//
// Hiding the button while `showChat` is true (and showing it again once the
// sheet is dismissed) keeps it from floating behind the chat panel.
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
