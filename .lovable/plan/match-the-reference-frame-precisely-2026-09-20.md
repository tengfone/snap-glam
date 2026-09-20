# Match the reference frame precisely

## Goal
Make the frame follow the uploaded reference: one lower three-quarter arc, soft fades at both raised ends, and a single label that starts vertically on the left and flows toward the lower-right. The label must never be centered automatically or overflow around the full circle.

## Changes
- Restore a fixed left-side starting anchor for the label instead of calculating its position from the phrase midpoint.
- Draw the message on a true continuous curved path so characters follow one smooth baseline without appearing as separately tilted blocks.
- Reserve a bounded text path from the left side through the bottom toward the lower-right, matching the reference’s placement.
- Measure every custom message against that path and reduce font size and spacing until the entire phrase fits inside the allowed area; prevent it from wrapping into the upper-right or crossing the faded ends.
- Match the reference’s arc thickness, opening, green tonal transition, and soft transparent fade at both ends.
- Keep the gradient when the message changes. Editing text will no longer turn the ring into a flat color.
- When the user changes the ring color, generate a coordinated lighter/darker gradient automatically instead of removing gradient styling.

## Validation
- Compare the default `#OPENTOWORK` result directly with the uploaded correct reference.
- Test short, standard, and maximum-length custom messages to confirm the left anchor stays fixed and all text remains within the lower arc.
- Verify preview and downloaded PNG/JPG use identical geometry and coloring at multiple export sizes.
- Check desktop and mobile previews, then confirm a clean build with no browser errors.

## Technical detail
The text layout will use cumulative glyph measurements from a fixed angular start, with a capped end angle and automatic scale calculation. The ring gradient will be computed independently from text customization, so message edits cannot clear it.
