# emulation harness (run before every push)
    npm i playwright-core            # google-chrome at /usr/local/bin/google-chrome
    python3 -m http.server 8777 --directory proto-shell &
    node run.js shell /tmp/out [device,device]   # iphone-se, iphone-15-pro, iphone-pro-max, phone-landscape, ipad, desktop
    python3 sheet.py /tmp/out                     # contact sheets per device and theme
`shell.js` is the proto-shell journey, `real.js` the real-site journey (BASE=... to point it at a build), `ghost.js` the ghost-dial checks.
Gates: waveform plays, renders and never dims (Night and Red); photos keep true colour; Reduce Motion matches (state path); desktop background stays dark; no stray tap through the snap.
