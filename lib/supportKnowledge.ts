export const SUPPORT_KNOWLEDGE = `
- Posting: The post composer lives directly on the Home feed page — there is no separate "Create Post" button or modal. Pick a type using the Post / Audio / Event tabs in the composer, fill in the fields, then submit.
- Text/image posts: Write text in the editor. To attach an image, click the image icon — accepted formats are JPEG, PNG, WEBP, or GIF, up to 5MB. After choosing an image, an "Add to gallery" toggle switch appears; turn it on if you also want the image to show up on the public Gallery page. It is off by default.
- Audio posts: Switch to the Audio tab. Track Title and Artist Name are required; Album, Release Year, and Cover Art are optional. The track file must be an MP3 (.mp3 only), up to 10MB — no other audio formats are accepted. After choosing the file, an "Add to streaming radio" toggle switch appears; you must turn it on for the track to be submitted to the site's always-on radio station. It is off by default and is not automatic.
- AI-ify: While writing a text post, an "AI-ify" button rewrites your post in a selected tone using AI.
- Mentions: Type "@" followed by a user's handle inside the post editor to mention them; a dropdown suggests matching users as you type.
- Events: Switch to the Event tab in the Home composer, or use the calendar icon/link to go to /calendar/add-event, to schedule an event with a venue and date/time.
- Gallery: Public page at /gallery — shows posts where "Add to gallery" was turned on.
- Calendar: Public page at /calendar — lists scheduled events.
- Notifications: Available at /notifications — shows likes, comments, mentions, and new followers.
- Profile: Manage display name, handle, avatar, and bio at /profile. The bottom of that page has "Delete my account", which permanently deletes the account and all its posts and cannot be undone.
- Settings: Available at /settings. It has push notification toggles for the mobile app (a "Pause all push notifications" checkbox plus separate checkboxes for likes, comments, mentions, and new followers; each saves as soon as it is clicked), the list of blocked users with an Unblock button, "Your data", and the signed-in email. Push settings only affect push notifications on the phone; the /notifications page always shows everything.
- Export your data: On /settings, "Email me my data" emails a download link to the account's sign-in address. The link works for one hour, opens in any browser, and downloads a JSON file with the person's profile, posts, comments, likes, follows, notifications, and boosts. Uploaded files are listed as links, not included. If the email doesn't arrive, check spam, then use "Send it again".
- Blocking: The Block button is on other people's profile cards. Blocking hides their posts and notifications from you and ends any follow between you. Blocked users can be unblocked from /settings.
`;
