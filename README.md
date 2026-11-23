# DiceWeb

A whole computer in your browser, made of pixel worlds. On a Raspberry Pi or a PC it becomes [Dice](https://github.com/dpatel7-dev/Dice).

**Play it:** https://djp7.pythonanywhere.com/diceweb/

## What's in it

- **Desktop**, where it opens: windows you drag and resize, a glass shelf in the middle, and the friends wandering across the wallpaper (the die bounces along with them).
- **Big screen**, for a TV or a controller: big covers, and behind them a little living world (clouds, stars, the app's mascot breathing and blinking) that dissolves into the next one as you move. Open it from the die at the bottom left, or the Big screen icon.
- **The die**: a black die with rounded edges, drawn in 3D and turned into pixel art (`js/die3d.js`). It's the logo, the start-up animation, the icons, and it floats over the worlds.
- **Apps:** Music (Dice Radio makes songs as it plays; add your own too), Terminal, Notes, Files, Web, Store (every app in the suite) and Settings.
- **Friends:** the suite's mascots. Say hi.
- Notifications, a frames-a-second overlay, sleep, and day and night that follow the sun.

## Moving around

| Keyboard | Controller | Does |
|---|---|---|
| Arrow keys | D-pad or left stick | Move |
| Enter | Bottom face button | Choose |
| Esc | Right face button | Back |
| M or Ctrl+1 | Menu or the big middle button | The menu |
| Q or Ctrl+2 | View | Quick access |
| / | Top face button | Search |
| X | Left face button | More things to do |
| [ and ] | Left and right shoulder buttons | Switch tabs |

On screen, controller buttons are shown by where they are (a little diamond of dots), so it makes sense on any controller.

The mouse and touch work everywhere too.

## Running it yourself

It's plain HTML, CSS and JavaScript with nothing to install. Open `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

then open http://localhost:8000.

Tests (Node 18 or newer): `node --test`

## How it fits together

- `js/logic.js`: the parts with no screen (moving focus, the pretend disk, Terminal's commands), tested in `test/`.
- `js/gfx.js`: the pixel worlds, icons and covers. `js/sound.js`: interface sounds and Dice Radio.
- `js/core.js`: settings, input, focus, notifications. `js/shell.js`: Big screen. `js/desk.js`: Desktop mode.
- `js/sys.js`, `js/vt.js`, `js/apps/realterm.js`: only switch on when Dice's helper serves the page (on a Pi or a PC running Dice).
- Everything DiceWeb remembers stays in your browser (localStorage, and your songs in IndexedDB).
