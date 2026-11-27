# DiceWeb

The DiceOS desktop in your browser, made of pixel worlds. On a Raspberry Pi or a PC it becomes [DiceOS](https://github.com/dpatel7-dev/DiceOS).

**Play it:** https://djp7.pythonanywhere.com/diceweb/

## What's in it

- **Desktop**, where it opens, kept clean like Ubuntu: your Home folder, windows you drag and resize, a small dock of favourites, and every app in a full-screen grid behind the button at the dock's left.
- **Backgrounds**: twelve worlds, each a calm, detailed landscape that moves a little (clouds, water, swaying grass, snow, fireflies, an aurora) with nobody in it (`js/scape.js`). Pick one in Settings, Look.
- **DiceTV**, for a TV or a controller: your world fills the screen, with the time and today down the left and your apps standing in it as little blocks; below, on frosted glass, are **Live** (pictures to leave on), **News** (news channels' own live streams) and **Watch** (your streaming sites with their own icons; add your own, even a Plex or Jellyfin box at home). A pixel-art frame moves to what's picked. News keeps playing in a corner when you go Home, and Picture off leaves just the sound. Leave it alone and an ambient clock comes up (`js/tv.js`). Open it from the app grid.
- **Dice Home**, for a screen on the wall: a big clock, the weather, today's Axiom tasks and buttons for Home Assistant (`js/home.js`).
- **Dice Cloud**: your files (photos, songs, videos, documents), notes, Axiom, SereneTab, Dice Home, the Watch list, widgets and a few settings the same on every computer, item by item, locked with your own code before they leave (`js/cloud.js`). Files are cut into 4 MB parts, each locked with a key of the file's own, and can be shared with a link that carries that key after the # (`js/drive.js`). Its app (`js/apps/cloudapp.js`) lists your computers, sends links and notes between them (Dice Drop), adds a TV with a short code and goes back to older versions. Like Dropbox: older versions of each file, Deleted files for 30 days, stars, a Dice Cloud folder and Pictures backup on DiceOS (`js/drivesync.js`), and your own server for the files if you want more room.
- **The die**: the logo is a black die in the classic isometric view (the 1, 2 and 3 showing), drawn pixel by pixel so it's sharp even at 16 pixels. The start-up animation is the same die in 3D, tumbling in and landing (`js/die3d.js`).
- **SereneTab**, the web browser: tabs, an address bar that searches (DuckDuckGo, Google, Bing, Brave or Wikipedia) and suggests as you type, History, reopening closed tabs, and a calm new tab page in liquid glass with a focus timer on its clock and Axiom's tasks for today. Behind it is a pixel skyline of New York, London, Santorini or Dubai under that city's real sky right now: the sun and moon where they really are, the city's real weather, windows lit after dark (`js/skyline.js`). Pages open inside SereneTab when the site allows it; big sites that don't (Google, GitHub and so on) open in their own window.
- **Axiom**, the planner for school: classes with their own colours, tasks by class, a Today page (overdue, due today, this week, tests and quizzes), a month calendar with a dot per class, notes linked to a class, and a reminder when a task with a time comes due. Two looks: Dawn (Mt. Fuji at sunrise) and Calm. Anything on the old Calendar moves across.
- **Files** (`js/apps/files.js`): icons or a list, real thumbnails, picking several, drag and drop, copy and paste, a right-click menu, a details panel, quick look, search, Dice Cloud as a place, and a Trash that puts things back where they were. In a browser it uses the Dice disk (`js/fs.js`): real files kept in the browser's own database.
- **The Store** (`js/store.js`): on DiceOS, real Linux apps from Flathub; everywhere, any website as an app of its own; and Dhruv's terminal apps.
- **DiceGaming** (`js/apps/gaming.js`, on the desktop): Xbox Cloud Gaming, GeForce NOW, Amazon Luna and your Dice Cloud PC, with no gaming PC needed; and, if you have one, your gaming PC's games streamed with Moonlight and Sunshine.
- **Deuce** (`js/deuce.js`, `js/deucebrain.js`): the voice assistant. Hold the remote's microphone button (or press the two dots at the top of DiceTV, or type in Search) and say "put on the Knicks game": it finds the game on ESPN's scoreboard, the channel, and the way you can watch it, and opens it. It understands what you said right here, with no cloud AI; `test/deuce.test.js` has what it knows.
- **TV channels** (`js/watch.js`): MSG, NBC, CBS, ABC, ESPN and more on DiceTV's Home, each opened the real way: an antenna tuner, your live TV service, or the channel's own app.
- **Inputs** (`js/inputs.js`, DiceOS): a KVM switch. The other things on a TV's HDMI (HDMI-CEC, with the remote passed on to them), or a PC screen's other inputs (DDC/CI), with names of your own that Deuce knows.
- **Heavenly looks** (`js/heaven.js`): a layer of light over the worlds (sunbeams, lit clouds, glowing motes, petals on the breeze, cloud shadows, starlight and aurora), finer worlds and deeper glass. `window.DiceHeaven` is the painter on its own; the website's dice.json preview uses it too.
- **Your preferences** (`js/prefs.js`): the same ones a dice.json carries (accent, text size, 12 or 24-hour clock, units and the rest), in from a dice.json and back out as one.
- **Dice Cloud PC** (`js/apps/cloudpc.js`): a computer of your own in the cloud (DiceOS's `cloudpc/` kit): its desktop, its room for Dice Cloud, its games.
- **More apps:** Terminal, Notes, Music (Dice Radio makes songs as it plays; add your own too), Calculator, Clock (with alarms that wake the TV), System Monitor and Settings.
- **Code** (`js/apps/code.js`): a code editor with tabs, line numbers, colours for JavaScript, Python, HTML, CSS, JSON, shell and Markdown, and a preview that runs web pages and JavaScript beside the code.
- **Channels, Weather, Photos and Sketch:** live pictures to leave on (a fireplace, an aquarium, rain, the northern lights, space, every world and city), the week's weather, your pictures with a slideshow, and pixel art.
- **TV remotes** (`js/remote.js`): Back, Home, Info, Guide, the colour buttons, channels, play, volume and numbers; an on-screen keyboard; on DiceOS the TV's own remote through HDMI-CEC.
- **Air mice** (`js/airmouse.js`): a big pointer that hides when still, scrolling at the edges, the right button for Back, the power button to sleep, and the zoom keys to fit the picture to the TV.
- **The desktop** (`js/deskplus.js`): snapping and snap layouts, four desktops, an overview, Alt + Tab, the Dice Bar (Ctrl + Space) for apps, files, emoji, sums, units, timers and Axiom tasks, widgets and clipboard history.
- **Lock screen and emoji** (`js/extras.js`): Super + L locks the screen (with a PIN if you set one in Settings, You); Super + . opens emoji and symbols.
- **For every day** (`js/tools.js`): Night light (a warmer screen at night), Do not disturb, a sleep timer, backups to one file and back, and a sheet of every keyboard shortcut (Ctrl + /). On DiceOS also Bluetooth and screenshots (Print Screen).
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
| Ctrl + / or ? | | Every keyboard shortcut |
| Print Screen | | A screenshot (DiceOS) |

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
- `js/apps/serenetab.js`, `js/apps/axiom.js`: the browser and the planner. SereneTab's weather comes from Open-Meteo (free, no key).
- `js/gfx.js`: the pixel art: app icons, the die, the mascots and the covers. `js/sound.js`: interface sounds and Dice Radio.
- `js/core.js`: settings, input, focus, notifications. `js/shell.js`: DiceTV. `js/tv.js`: DiceTV's Today and Watch rows and the ambient screen. `js/tools.js`: Night light, Do not disturb, the sleep timer, screenshots, backups, Bluetooth and the shortcuts sheet. `js/desk.js`: Desktop mode.
- `js/sys.js`, `js/vt.js`, `js/apps/realterm.js`: only switch on when Dice's helper serves the page (on a Pi or a PC running Dice).
- `js/emu.js`: a pretend Dice helper, for the emulator on the website (`/dice/try`). It only switches on when the emulator opens DiceWeb with `?emu=1`, and keeps its own storage.
- Everything DiceWeb remembers stays in your browser (localStorage, and your songs in IndexedDB).
