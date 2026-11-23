# DiceWeb

A whole computer in your browser, made of pixel worlds. On a Raspberry Pi or a PC it becomes [Dice](https://github.com/dpatel7-dev/DiceOS).

**Play it:** https://djp7.pythonanywhere.com/diceweb/

## What's in it

- **Desktop**, where it opens, kept clean like Ubuntu: your Home folder, windows you drag and resize, a small dock of favourites, and every app in a full-screen grid behind the button at the dock's left.
- **Backgrounds**: twelve worlds, each a calm, detailed landscape that moves a little (clouds, water, swaying grass, snow, fireflies, an aurora) with nobody in it (`js/scape.js`). Pick one in Settings, Look.
- **Big screen**, for a TV or a controller: big covers over the same landscape. Open it from the app grid.
- **The die**: the logo is a black die in the classic isometric view (the 1, 2 and 3 showing), drawn pixel by pixel so it's sharp even at 16 pixels. The start-up animation is the same die in 3D, tumbling in and landing (`js/die3d.js`).
- **SereneTab**, the web browser: tabs, an address bar that also searches (DuckDuckGo, Google, Bing, Brave or Wikipedia), and a calm new tab page in liquid glass. Behind it is a pixel skyline of New York, London, Santorini or Dubai under that city's real sky right now: the sun and moon where they really are, the city's real weather, windows lit after dark (`js/skyline.js`). Pages open inside SereneTab when the site allows it; big sites that don't (Google, GitHub and so on) open in their own window.
- **Axiom**, the planner for school: classes with their own colours, tasks by class, a Today page (overdue, due today, this week, tests and quizzes), a month calendar with a dot per class, notes linked to a class, and a reminder when a task with a time comes due. Two looks: Dawn (Mt. Fuji at sunrise) and Calm. Anything on the old Calendar moves across.
- **Games**: the games from dpatel.dev (Algebra Dash, Ball and Wall, Neon Voids and Pixel Lander), in `games/`.
- **More apps:** Files, Terminal, Notes, Music (Dice Radio makes songs as it plays; add your own too), Calculator, Clock, System Monitor, Store (every app in the suite) and Settings.
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

- `js/logic.js`: the parts with no screen (moving focus, the pretend disk, Terminal's commands, the calculator's sums, Axiom's weeks and task sorting, the sun and moon over SereneTab's cities, the address bar), tested in `test/`.
- `js/scape.js`: the backgrounds. Open `test/scapes.html` to see all twelve, by day and night, moving.
- `js/skyline.js`: SereneTab's cities. Open `test/skylines.html` to see each by day, at sunset and at night (add `?wx=rain` or `snow`, `fog`, `storm`).
- `js/apps/serenetab.js`, `js/apps/axiom.js`, `js/apps/games.js`: the browser, the planner and the games list. SereneTab's weather comes from Open-Meteo (free, no key).
- `js/gfx.js`: the pixel art: app icons, the die, the mascots and the covers. `js/sound.js`: interface sounds and Dice Radio.
- `js/core.js`: settings, input, focus, notifications. `js/shell.js`: Big screen. `js/desk.js`: Desktop mode.
- `js/sys.js`, `js/vt.js`, `js/apps/realterm.js`: only switch on when Dice's helper serves the page (on a Pi or a PC running Dice).
- `js/emu.js`: a pretend Dice helper, for the emulator on the website (`/dice/try`). It only switches on when the emulator opens DiceWeb with `?emu=1`, and keeps its own storage.
- Everything DiceWeb remembers stays in your browser (localStorage, and your songs in IndexedDB).
