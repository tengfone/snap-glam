# Profile Picture Overlay Maker

## Goal
Build a polished single-page editor where someone uploads a profile photo, adjusts it, adds a professional or playful circular overlay, and downloads the finished image. The uploaded photo and edits remain entirely in the browser and are never sent or saved anywhere.

## Experience
- Start with a clear upload area and an always-visible privacy reassurance: “Your photo never leaves this device.”
- After upload, show a large circular profile preview with simple controls beside it on desktop and below it on mobile.
- Provide drag-to-reposition, zoom, 90° rotation, horizontal flip, and reset controls for photo framing.
- Include a preset gallery with a familiar green “#OPEN TO WORK” treatment, hiring/networking variants, and a few tasteful funny options.
- Add a custom overlay mode for changing the message, foreground/background colors, font size, and text repetition around the ring.
- Keep the output profile-ready: a square 1080×1080 PNG with the photo clipped into a circle and the selected overlay rendered around its edge.
- Add Replace photo, Download PNG, and Start over actions with clear enabled/disabled states.

## Visual Direction
- Clean creative-tool layout rather than a marketing landing page.
- Warm off-white workspace, charcoal type, crisp black dividers, emerald as the primary action color, and small coral/yellow accents in preset thumbnails.
- Bold editorial heading paired with a highly legible sans-serif interface.
- Compact controls, restrained corners, strong hierarchy, and subtle motion that respects reduced-motion preferences.

## Privacy and Safety
- Use browser file APIs and canvas only; no upload endpoint, account, analytics payload, cloud storage, or persistence.
- Accept common image formats, validate file type/size locally, and show a helpful local error for unsupported files.
- Revoke temporary browser image URLs when a photo is replaced or the editor closes.

## Technical Details
- Replace the placeholder home page and give it unique title, description, Open Graph, and Twitter metadata.
- Build focused editor pieces for upload, canvas preview, adjustment controls, preset selection, and customization.
- Render the final image from the original-resolution source onto an off-screen canvas so download quality is independent of preview size.
- Keep all visual values in semantic design tokens and use the existing project’s icon and control libraries.
- Verify upload, editing, preset switching, custom text, reset, and PNG download on desktop and mobile-sized layouts.

## Scope
No accounts, server storage, sharing links, background removal, or network image processing. The first version exports PNG only.
