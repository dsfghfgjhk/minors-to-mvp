# Blender player

Original procedural meshes authored for this game using Blender 4.3.2.

- `baseball-player.blend`: editable mesh library, rigged player, studio camera and preview floor.
- `baseball-player.glb`: rigged reusable player; no studio geometry.
- `player-meshes.json`: local part geometry buffers exported from Blender.
- `preview.png`: Blender Workbench render of the editable source.

Rebuild from repository root:

```sh
blender -b --python tools/build_player_blender.py
node tests/player-asset.cjs
```

The builder also refreshes the marked `BLENDER_PLAYER` block in `index.html`.
The game reads those embedded Blender meshes and connects them to its existing
pitching, batting and running skeleton. Team colors and jersey numbers remain
dynamic. Embedding avoids additional loader requests and preserves standalone
HTML use. Coordinates are converted from Blender Z-up to the game's Y-up.
The web player can be checked with the source's Blender studio preview and the
game's actual animated poses; the preview is a standing rest pose.
