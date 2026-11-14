# Photo lab · Horizon film reel v2 (local)

Copy of `/workspace/horizon-reel`, with Horizon films as an Amy Currell-style drifting reel: full-screen motion clips, an analog glass rail scrubber, a transport dial, five viewing modes, and controls that fade (the rail stays). Not pushed.

```
python3 /workspace/horizon-reel-v2/tools/serve.py 8897
```
Open http://127.0.0.1:8897/ → **films**.

Notes, QA and walkthroughs are in `/workspace/share/horizon-reel-v2/` (CHANGES.md). `stills-zoom/` is a symlink to `/workspace/stills-zoom` (read only), and `media/` and `icons/` are symlinks to the shared photo-lab media, as in horizon-reel. The reel clips live in `reel/` (34 MB) and are rebuilt with `tools/build_reel.py` + `tools/make_atlas.py`.
