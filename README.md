# DiceWeb

A whole console in your browser, made of pixel worlds. On a Raspberry Pi it becomes [Dice](https://github.com/dpatel7-dev/Dice).

**Play it:** https://djp7.pythonanywhere.com/diceweb/

## What's in it

- **Gaming Mode**, like a Steam Deck. Home has big covers, and behind them a little living world (clouds, stars, the app's mascot breathing and blinking) that dissolves into the next one as you move.
- **Desktop mode** (Power, Switch to Desktop): windows you drag and resize, a glass shelf in the middle, and the friends wandering across the wallpaper.
- **Apps:** Roll (the dice game Pig), Bumble's Flight, Music (Dice Radio makes songs as it plays; add your own too), Terminal, Notes, Files, Web, Store (every app in the suite) and Settings.
- **Friends:** the suite's mascots. Say hi, or play Roll against one. Each plays differently.
- **Achievements**, notifications, a frames-a-second overlay, sleep, and day and night that follow the sun.

## Moving around

| Keyboard | Controller | Does |
|---|---|---|
| Arrow keys | D-pad or left stick | Move |
| Enter | A | Choose |
| Esc | B | Back |
| M or Ctrl+1 | Menu or the big middle button | The menu |
| Q or Ctrl+2 | View | Quick access |
| / | Y | Search |
| X | X | More things to do |
| [ and ] | LB and RB | Switch tabs |

The mouse and touch work everywhere too.

## Running it yourself

It's plain HTML, CSS and JavaScript with nothing to install. Open `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

then open http://localhost:8000.

Tests (Node 18 or newer): `node --test`

## How it fits together

- `js/logic.js`: the parts with no screen (moving focus, the dice game, the pretend disk, Terminal's commands), tested in `test/`.
- `js/gfx.js`: the pixel worlds, icons and covers. `js/sound.js`: interface sounds and Dice Radio.
- `js/core.js`: settings, input, focus, notifications. `js/shell.js`: Gaming Mode. `js/desk.js`: Desktop mode.
- `js/sys.js`, `js/vt.js`, `js/apps/realterm.js`: only switch on when Dice's helper on a Pi serves the page.
- Everything DiceWeb remembers stays in your browser (localStorage, and your songs in IndexedDB).
