# Add Slack Transparent Export

## Goal
Add a Slack export that produces a 512×512 PNG with transparent corners outside the circular profile image, avoiding white square edges wherever Slack preserves transparency.

## Changes
- Add a **Slack** platform preset at 512×512, with Slack’s official 512–1024px guidance and source link.
- Selecting Slack will default the format to **PNG**, because JPG cannot contain transparency.
- Keep pixels outside the circular avatar transparent in the downloaded PNG; the current canvas renderer already clears and leaves those corners transparent.
- Add a short export note that Slack may display transparent pixels against its own interface background, since Slack does not document guaranteed transparency behavior for profile photos.
- Preserve JPG for other exports, while making its opaque-background limitation clear.

## Verification
- Export a Slack PNG and inspect its alpha channel to confirm all four corners are transparent.
- Confirm the downloaded file is 512×512 and named for Slack.
- Verify switching between Slack and other platform presets keeps format and dimensions understandable.
