# Opening movie

`opening.mp4` is a silent H.264 video. The first 6.6 seconds contain the original-work and Seo's Games credits. The following 12 seconds are rendered from the game's Blender-authored player meshes in a separate night stadium scene.

The sequence contains a batter close-up, pitcher windup and release, a ball-follow camera, a slow-motion swing, a flight camera, and a final crane shot with the game title. The renderer adds directional lighting, shadows, a vignette, letterboxing and titles.

To regenerate the action frames, serve the repository and run `tools/render_opening_cinematic.cjs` with Playwright available through `NODE_PATH`. It uses Chromium with software WebGL. Set `OPENING_URL`, `THREE_LOCAL`, and `OPENING_FRAMES` to override the defaults documented in the script. The output is 288 PNG frames at 24 fps and 960 × 540 pixels. Encode them to H.264, upscale to 1280 × 720, and prepend the existing first 6.6 seconds of credits. Preserve MP4 fast-start metadata for web playback.

The website autoplays the muted movie before the title menu. Clicking or tapping the movie skips to the title; normal completion does the same.
