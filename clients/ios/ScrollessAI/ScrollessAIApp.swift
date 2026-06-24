import SwiftUI

// Entry point of the demo app. In Scrolless's real app you would drop the
// ChatButton overlay onto whatever your root screen already is.
@main
struct ScrollessAIApp: App {
    var body: some Scene {
        WindowGroup {
            DemoHomeView()
        }
    }
}
