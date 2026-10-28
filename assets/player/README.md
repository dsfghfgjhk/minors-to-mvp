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

## Human proportions revision

The head includes cheek and eye-socket shaping, a nose bridge, eyes, brows,
lips and ears. Hands include four fingers and a thumb. The trouser mesh is
voxel-sculpted as a continuous surface and weighted to pelvis and both thigh/knee
chains, retaining separation between the inner thighs during wide strides.
`pantsSkin.si/sw` are exported Blender-derived indices and normalized weights;
the game binds them to its five matching bones. The uniform waist and sleeve
profiles and cap bill were adjusted for a less mannequin-like silhouette.
This is a lightweight game model, not a photorealistic scan.
