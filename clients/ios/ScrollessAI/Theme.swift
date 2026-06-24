import SwiftUI

// Palette sampled from the real scrolless.com hero screenshot:
// dark slate background with a warm peach/amber glow.
enum Theme {
    static let dark        = Color(red: 0.102, green: 0.102, blue: 0.114) // #1A1A1D — navbar / header
    static let slate       = Color(red: 0.180, green: 0.196, blue: 0.231) // #2E323B — panel background
    static let slateLight  = Color(red: 0.239, green: 0.259, blue: 0.302) // #3D424D — borders
    static let peach       = Color(red: 0.847, green: 0.604, blue: 0.431) // #D89A6E — warm accent
    static let peachDark   = Color(red: 0.780, green: 0.482, blue: 0.322) // #C77B52 — accent pressed
    static let text        = Color(red: 0.961, green: 0.949, blue: 0.933) // #F5F2EE — light text
    static let textDim     = Color(red: 0.788, green: 0.776, blue: 0.761) // #C9C6C2 — secondary text
}
