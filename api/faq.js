// Knowledge base: FAQ reali di Scrolless (https://www.scrolless.com/faq)
// Per il prototipo le inseriamo tutte nel system prompt. Quando le FAQ
// diventeranno centinaia, sostituire questo file con un vero vector store.

export const FAQ = `
# Scrolless — FAQ

## Getting Started

Q: What is Scrolless and how does it work?
A: Scrolless is an iOS app designed to protect your eyes from digital strain. Using Apple's Screen Time API, Scrolless monitors your phone usage and prompts you to take science-backed eye rest breaks at optimal intervals. It tracks usage on selected apps, calculates rest timing via an algorithm, locks apps when breaks are needed, guides rest sessions, and displays an Eye Strain Meter.

Q: How much does Scrolless cost?
A: Scrolless offers a 7-day free trial so you can experience the full benefits risk-free. After the trial, the regular annual subscription is 39.99 EUR. Subscriptions are managed through the App Store and can be cancelled anytime.

Q: How do I set up and use the Scrolless app?
A: Installation has three steps: install on iPhone, select which apps to track (all or most recommended, but exclude essential apps like work, video call, or navigation apps), then use your phone normally while the algorithm manages breaks.

Q: Is Scrolless available for Android, Mac, or Windows?
A: Currently iPhone only. "Not yet—but we're working on it!" You can sign up for updates about future platform launches.

## Features & Benefits

Q: When will I start noticing relief from eye strain?
A: Relief timeframes vary individually. Most people experience improvement within 1–14 days. Those with significant fatigue may notice results within 1–3 days.

Q: Is Scrolless safe to use?
A: Yes. Taking regular breaks from screens is the most natural and recommended way to reduce digital eye strain. Avoid closing your eyes while driving or operating machinery.

Q: Can I customize when and how often I get break reminders?
A: No customization is currently available. Scrolless uses a smart algorithm that calculates optimal break timing based on your individual usage patterns and eye strain levels.

Q: Which apps should I track with Scrolless?
A: For comprehensive eye protection, track all apps or at least all apps where you spend significant time scrolling, reading, or watching content. Exclude navigation, video calling, and work-critical apps. You can adjust selections later in Settings.

Q: What if my eye strain persists despite using Scrolless?
A: Consult a healthcare professional. Scrolless is NOT a medical care provider, and persistent eye strain may indicate underlying eye conditions. Multiple factors affect eye health: total screen time across devices, lighting, nutrition, hydration, outdoor time, age, and general health.

## Privacy & Performance

Q: Does Scrolless see or store my Screen Time data?
A: No. Your Screen Time data always stays on your device. The app uses Apple's Screen Time API without storing data. As an EU-based company, Scrolless follows GDPR rules and never sells your personal data to third parties.

Q: Will Scrolless affect my phone's performance or battery life?
A: No negative impact. Scrolless is designed to run efficiently in the background without slowing down your phone or draining your battery. Battery impact is minimal for most users.

## Troubleshooting

Q: I don't receive notifications to take breaks.
A: Notifications are likely filtered by iPhone Focus mode. Go to Settings > Focus, then add Scrolless to the allowed apps for each Focus mode you use.

Q: What if break notifications disappear too quickly?
A: Go to Settings > Notifications > Scrolless, then select "Persistent" under Banner style so reminders stay until tapped.

Q: I never get reminders for a specific app, even though it's selected as tracked.
A: Confirm the app is selected in Tracked Apps (Profile tab), then review iPhone Settings > Screen Time > Always Allowed and remove any apps you want tracked.

Q: How do I avoid interruptions during video calls or while driving?
A: Two options: unselect those apps in the Tracked Apps list (easiest, but their time is excluded from strain calculations), or add them to iPhone's "Always Allowed" list (advanced—apps won't lock but time still counts toward strain).

Q: What if screen locks and break reminders aren't working at all?
A: Troubleshoot in four steps: (1) tap notifications in restricted apps, (2) force close and reopen Scrolless, (3) restart your device, (4) reset Screen Time tracking by unselecting all apps, confirming reset, then reselecting. Note: resetting also resets the daily Eye Strain Meter to zero.

## Account & Billing

Q: How do I cancel my subscription or request a refund?
A: Cancel via Settings > [your Apple ID name] > Subscriptions > Scrolless > Cancel Subscription. Apple may take up to 24 hours to process cancellations. Scrolless cannot cancel subscriptions or process refunds for purchases made via Apple—all cancellations and refunds are handled directly by Apple.

## Contact & Support

Q: How do I contact Scrolless?
A: Submit a support form, email info@scrolless.com, or message us on social media. Include detailed descriptions with screenshots/videos when possible for faster resolution.
`;
