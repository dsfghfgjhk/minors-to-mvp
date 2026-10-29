# Opening movie

`opening.mp4` is a silent H.264 video. The first 6.6 seconds contain the original-work and Seo's Games credits. The following 12 seconds are rendered from the game's Blender-authored player meshes in a separate night stadium scene.

The sequence contains a batter close-up, pitcher windup and release, a ball-follow camera, a slow-motion swing, a flight camera, and a final crane shot with the game title. The renderer adds directional lighting, shadows, a vignette, letterboxing and titles.

To regenerate the action frames, serve the repository and run `tools/render_opening_cinematic.cjs` with Playwright available through `NODE_PATH`. It uses Chromium with software WebGL. Set `OPENING_URL`, `THREE_LOCAL`, and `OPENING_FRAMES` to override the defaults documented in the script. The output is 288 PNG frames at 24 fps and 960 × 540 pixels. Encode them to H.264, upscale to 1280 × 720, and prepend the existing first 6.6 seconds of credits. Preserve MP4 fast-start metadata for web playback.

The website autoplays the muted movie before the title menu. Clicking or tapping the movie skips to the title; normal completion does the same.

Devices that block video autoplay, such as iPhones and iPads in Low Power Mode, play the opening without a video element so it still starts without a tap:

1. `opening.h264` is the same movie as a raw H.264 stream (1280 × 720, 24 fps, no B-frames, an access unit delimiter before every frame). The page downloads it as a stream, decodes it with WebCodecs `VideoDecoder` as data arrives, and draws each frame on a canvas at 24 fps. Regenerate it after changing the movie:

```sh
ffmpeg -i assets/opening/opening.mp4 -an -c:v libx264 -profile:v main -level 3.1 -pix_fmt yuv420p -preset slow -crf 20 -x264-params "aud=1:repeat-headers=1:keyint=48:min-keyint=48:scenecut=0:bframes=0" -f h264 assets/opening/opening.h264
```

2. Browsers without WebCodecs use `frames/00.webp` … `frames/27.webp` hold the same movie as 768 × 432 still frames, 16 per sheet in a 4 × 4 grid. Devices that block video autoplay, such as iPhones and iPads in Low Power Mode, draw these sheets on a canvas at 24 fps instead, so the opening still starts without a tap. Playback waits for a sheet that has not arrived yet instead of skipping frames, and frees sheets that have already played. Regenerate them after changing the movie:

```sh
mkdir -p /tmp/op && ffmpeg -i assets/opening/opening.mp4 -vf "scale=768:432:flags=lanczos" /tmp/op/%04d.png
python3 - <<'PY'
from PIL import Image
import glob
fs=sorted(glob.glob('/tmp/op/*.png'))
for i in range(0,len(fs),16):
    sh=Image.new('RGB',(768*4,432*4),(6,17,13))
    for k,f in enumerate(fs[i:i+16]):sh.paste(Image.open(f).convert('RGB'),((k%4)*768,(k//4)*432))
    sh.save('assets/opening/frames/%02d.webp'%(i//16),quality=74,method=6)
PY
```

If the frame count changes, update `OPF.n` and `OPF.sheets` in `index.html`.
