// node --test   (no packages needed)
const test = require('node:test');
const assert = require('node:assert');
const L = require('../js/logic.js');

test('day and night follow the sun', () => {
  assert.strictEqual(L.clockNight(new Date(2026, 5, 21, 13, 0)), false); // a summer afternoon
  assert.strictEqual(L.clockNight(new Date(2026, 11, 21, 21, 0)), true); // a winter evening
  assert.strictEqual(L.clockNight(new Date(2026, 11, 21, 18, 0)), true); // winter: dark by six
  assert.strictEqual(L.clockNight(new Date(2026, 5, 21, 19, 0)), false); // summer: still light at seven
});

test('arrows move to the nearest thing in that direction', () => {
  const box = (x, y, w = 100, h = 150) => ({ x, y, w, h });
  const row = [0, 1, 2, 3].map((i) => ({ id: 'r' + i, r: box(i * 120, 0) }));
  const below = [{ id: 'b0', r: box(0, 300, 300, 80) }, { id: 'b1', r: box(320, 300, 300, 80) }];
  const all = row.concat(below);
  const from = row[1].r;
  assert.strictEqual(L.pickNext(from, all.filter((c) => c.id !== 'r1'), 'right').id, 'r2');
  assert.strictEqual(L.pickNext(from, all.filter((c) => c.id !== 'r1'), 'left').id, 'r0');
  assert.strictEqual(L.pickNext(from, all.filter((c) => c.id !== 'r1'), 'down').id, 'b0');
  assert.strictEqual(L.pickNext(row[3].r, all.filter((c) => c.id !== 'r3'), 'down').id, 'b1');
  assert.strictEqual(L.pickNext(from, all.filter((c) => c.id !== 'r1'), 'up'), null);
});

test('the pretend disk: folders, files, paths', () => {
  const d = L.newDisk('dhruv');
  assert.ok(L.walk(d, '/home/dhruv/readme.txt'));
  assert.strictEqual(L.resolve('/home/dhruv', '../x/./y', '/home/dhruv'), '/home/x/y');
  assert.strictEqual(L.resolve('/tmp', '~/notes', '/home/dhruv'), '/home/dhruv/notes');
  assert.strictEqual(L.makeDir(d, '/home/dhruv/stuff'), null);
  assert.strictEqual(L.writeFile(d, '/home/dhruv/stuff/a.txt', 'one'), null);
  assert.strictEqual(L.writeFile(d, '/home/dhruv/stuff/a.txt', 'two', true), null);
  assert.strictEqual(L.walk(d, '/home/dhruv/stuff/a.txt').text, 'one\ntwo');
  assert.match(L.remove(d, '/home/dhruv/stuff'), /rm -r/);
  assert.strictEqual(L.remove(d, '/home/dhruv/stuff', true), null);
  assert.strictEqual(L.walk(d, '/home/dhruv/stuff'), null);
  assert.strictEqual(L.writeFile(d, '/nope/x.txt', 'a'), 'No such folder');
});

test('Terminal commands', () => {
  const disk = L.newDisk('dhruv');
  const env = { disk, cwd: '/home/dhruv', user: 'dhruv', apps: [{ id: 'roll', name: 'Roll', kind: 'game' }, { id: 'pca', name: 'pca', kind: 'suite' }],
    friends: { gossip: 'Pebble' }, rand: () => 0.5, now: Date.now(), started: Date.now() - 120000, history: [], look: 'day', screen: '800x600', version: '1.0.0' };
  const run = (line) => { const r = L.run(line, env); env.cwd = r.cwd; return r; };
  assert.match(run('ls').out[0].s.map((x) => x[0]).join(''), /notes\//);
  run('mkdir projects'); run('cd projects');
  assert.strictEqual(env.cwd, '/home/dhruv/projects');
  run('echo hello world > hi.txt');
  assert.deepStrictEqual(run('cat hi.txt').out, ['hello world']);
  run('cd ..');
  assert.strictEqual(env.cwd, '/home/dhruv');
  assert.match(run('cd readme.txt').out[0], /is a file/);
  assert.strictEqual(run('open roll').open, 'roll');
  assert.match(run('open nothing').out[0], /no app called/);
  const r = run('roll 2d6');
  assert.deepStrictEqual(r.rolled.rolls, [4, 4]);
  assert.strictEqual(run('look night').look, 'night');
  assert.strictEqual(run('say pebble hi').say, 'gossip');
  assert.ok(run('clear').clear);
  assert.ok(run('exit').exit);
  assert.match(run('rm ~').out[0], /won't remove/);
  assert.match(run('npm install').out[0], /can't run real programs/);
  assert.match(run('frobnicate').out[0], /not a command/);
  assert.deepStrictEqual(L.tokens('echo "two words" and \'more here\''), ['echo', 'two words', 'and', 'more here']);
});

test('search finds apps by name and by what they do', () => {
  const pigeon = { name: 'pigeon', words: 'files drive send share' };
  assert.ok(L.score('pig', pigeon) > L.score('send', pigeon));
  assert.ok(L.score('send', pigeon) > 0);
  assert.strictEqual(L.score('zebra', pigeon), 0);
});

test('the die: opposite sides add up to seven, and it rests showing 1, 2 and 3', () => {
  const D3 = require('../js/die3d.js');
  const F = D3.FACES;
  assert.strictEqual(F['+x'] + F['-x'], 7); assert.strictEqual(F['+y'] + F['-y'], 7); assert.strictEqual(F['+z'] + F['-z'], 7);
  // the tumble ends exactly at rest
  const end = D3.tumble(1);
  D3.REST.forEach((row, i) => row.forEach((v, j) => assert.ok(Math.abs(v - end[i][j]) < 1e-9)));
  // a 48-pixel die: see-through corners, a black body and light pips
  const img = D3.render(48, null, { ss: 2 });
  assert.strictEqual(img.data.length, 48 * 48 * 4);
  assert.strictEqual(img.data[3], 0);
  let dark = 0, light = 0;
  for (let i = 0; i < img.data.length; i += 4) if (img.data[i + 3]) { if (img.data[i] < 70) dark++; else if (img.data[i] > 140) light++; }
  assert.ok(dark > 600, 'mostly black: ' + dark);
  assert.ok(light > 20 && light < dark / 4, 'some white pips: ' + light);
  // the flat logo die: the hand-drawn 16 and the drawn bigger ones both have
  // see-through corners, three greys for the sides and light dots
  for (const n of [16, 24, 32]) {
    const d = D3.iso(n);
    assert.strictEqual(d.data.length, n * n * 4);
    assert.strictEqual(d.data[3], 0, 'corner is clear at ' + n);
    const greys = new Set(); let dots = 0;
    for (let i = 0; i < d.data.length; i += 4) if (d.data[i + 3]) { if (d.data[i] > 150) dots++; else greys.add(d.data[i]); }
    assert.ok(greys.size >= 3, 'three sides at ' + n);
    assert.ok(dots >= 6, 'six dots at ' + n + ': ' + dots);
  }
  assert.ok(D3.ISO16.every((r) => r.length === 16) && D3.ISO16.length === 16);
});

test('no games in DiceWeb', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(!/roll\.js|flight\.js|games\.js/.test(html));
  assert.ok(!fs.existsSync(path.join(__dirname, '..', 'games')));
  assert.strictEqual(L.pigStep, undefined);
});

test('Axiom sorts tasks into overdue, today, this week and tests, and keeps the old Calendar', () => {
  const t = [{ due: '2026-11-20', type: 'homework' }, { due: '2026-11-23', type: 'quiz', time: '09:00' }, { due: '2026-11-23', type: 'essay', time: '08:00' },
    { due: '2026-11-30', type: 'essay' }, { due: '2026-12-10', type: 'test' }, { due: '2026-11-22', type: 'test', done: true }];
  const b = L.planBuckets(t, '2026-11-23');
  assert.deepStrictEqual(b.overdue.map((x) => x.due), ['2026-11-20']);
  assert.deepStrictEqual(b.today.map((x) => x.type), ['essay', 'quiz'], 'earliest time first');
  assert.deepStrictEqual(b.week.map((x) => x.due), ['2026-11-30']);
  assert.deepStrictEqual(b.tests.map((x) => x.due), ['2026-11-23', '2026-12-10']);
  assert.strictEqual(L.addDays('2026-12-30', 3), '2027-01-02');
  const moved = L.eventsToTasks({ '2026-11-30': [{ text: 'Dentist', time: '15:30' }, { text: '' }] });
  assert.strictEqual(moved.length, 1);
  assert.deepStrictEqual([moved[0].title, moved[0].due, moved[0].time, moved[0].type], ['Dentist', '2026-11-30', '15:30', 'event']);
});

test('the page loads every script it needs, and they all exist', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.length >= 10);
  for (const s of srcs) assert.ok(fs.existsSync(path.join(__dirname, '..', s)), s);
  for (const css of [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1])) assert.ok(fs.existsSync(path.join(__dirname, '..', css)), css);
});

test('the calculator works sums out itself, the way people write them', () => {
  const sum = (s) => L.calcText(L.calc(s));
  assert.strictEqual(sum('2+3×4'), '14');
  assert.strictEqual(sum('(2+3)×4'), '20');
  assert.strictEqual(sum('10÷4'), '2.5');
  assert.strictEqual(sum('−5+2'), '-3');
  assert.strictEqual(sum('50%'), '0.5');
  assert.strictEqual(sum('0.1+0.2'), '0.3');
  assert.strictEqual(sum('1234567×10'), '12,345,670');
  assert.strictEqual(sum('1÷0'), 'Can\'t divide by zero');
  assert.throws(() => L.calc('2×'));
  assert.throws(() => L.calc('alert(1)'));
});

test('the calendar shows six weeks, Sunday first, around the month', () => {
  const g = L.monthGrid(2026, 10); // November 2026 starts on a Sunday
  assert.strictEqual(g.length, 42);
  assert.strictEqual(g[0].key, '2026-11-01');
  assert.strictEqual(g.filter((c) => c.inMonth).length, 30);
  const feb = L.monthGrid(2027, 1); // February 2027 starts on a Monday
  assert.strictEqual(feb[0].key, '2027-01-31');
  assert.strictEqual(feb[1].key, '2027-02-01');
});

test('the emulator\'s pretend computer loads before DiceWeb looks for a real one', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const at = (f) => html.indexOf('js/' + f);
  assert.ok(at('emu.js') > 0 && at('emu.js') < at('core.js') && at('core.js') < at('sys.js'));
  for (const f of ['scape.js', 'skyline.js', 'apps/calculator.js', 'apps/axiom.js', 'apps/serenetab.js', 'apps/clock.js', 'apps/monitor.js']) assert.ok(at(f) > 0, f);
  const emu = fs.readFileSync(path.join(__dirname, '..', 'js', 'emu.js'), 'utf8');
  assert.match(emu, /if \(!\/\[\?&\]emu=1/); // it does nothing unless the emulator opened it
});

test('SereneTab: the sun and moon over a city', () => {
  const L = require('../js/logic.js');
  // New York at solar noon on the longest day: the sun is due south, 90 - 40.7 + 23.4 degrees up
  const noon = L.sunPos(new Date('2026-06-21T16:58:00Z'), 40.71, -74.01);
  assert.ok(Math.abs(noon.alt - 72.7) < 1, 'noon height ' + noon.alt);
  assert.ok(Math.abs(noon.az - 180) < 3, 'due south ' + noon.az);
  // sunset in New York on 23 November is about 4:31 pm
  assert.ok(Math.abs(L.sunPos(new Date('2026-11-23T21:31:00Z'), 40.71, -74.01).alt) < 1.5);
  // the same moment it's the middle of the night in Dubai
  assert.ok(L.sunPos(new Date('2026-11-23T21:31:00Z'), 25.2, 55.27).alt < -40);
  const m = L.moonPos(new Date('2026-11-24T05:00:00Z'), 40.71, -74.01);
  assert.ok(m.lit >= 0 && m.lit <= 1 && typeof m.waxing === 'boolean');
  assert.match(L.cityTime(new Date('2026-11-23T21:30:00Z'), 'Europe/London'), /^9:30 pm$/);
});

test('SereneTab: the address bar and where pages open', () => {
  const L = require('../js/logic.js');
  assert.deepStrictEqual(L.omni('wikipedia.org', 'ddg'), { url: 'https://wikipedia.org', search: false });
  assert.deepStrictEqual(L.omni('localhost:8123', 'ddg'), { url: 'http://localhost:8123', search: false });
  assert.deepStrictEqual(L.omni('homeassistant.local:8123', 'ddg'), { url: 'http://homeassistant.local:8123', search: false });
  assert.strictEqual(L.omni('how tall is the burj khalifa', 'wiki').url, 'https://en.wikipedia.org/w/index.php?search=how%20tall%20is%20the%20burj%20khalifa');
  assert.ok(L.omni('javascript:alert(1)', 'ddg').search, 'other kinds of address are just searched for');
  assert.strictEqual(L.omni('   ', 'ddg'), null);
  const here = 'https://djp7.pythonanywhere.com/diceweb/';
  assert.strictEqual(L.howToShow('https://github.com/dpatel7-dev', here).how, 'window');
  assert.strictEqual(L.howToShow('https://en.wikipedia.org/wiki/Dice', here).how, 'frame');
  assert.strictEqual(L.howToShow('https://djp7.pythonanywhere.com/dice', here).how, 'frame');
  assert.strictEqual(L.howToShow('http://192.168.1.4:8123', here).how, 'window', 'a secure page cannot show an insecure one');
  assert.strictEqual(L.howToShow('http://192.168.1.4:8123', 'http://localhost:8123/').how, 'frame');
  const yt = L.howToShow('https://www.youtube.com/watch?v=dQw4w9WgXcQ', here);
  assert.deepStrictEqual([yt.how, yt.url], ['frame', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ']);
  assert.strictEqual(L.weatherWords(0).kind, 'clear');
  assert.strictEqual(L.weatherWords(63).kind, 'rain');
  assert.strictEqual(L.weatherWords(75).kind, 'snow');
  assert.strictEqual(L.weatherWords(95).text, 'Thunderstorm');
});

test('SereneTab remembers each site once, newest first, and suggests while you type', () => {
  const L = require('../js/logic.js');
  let h = [];
  h = L.remember(h, { url: 'https://a.com', title: 'A', at: 1 });
  h = L.remember(h, { url: 'https://en.wikipedia.org/wiki/Dice', title: 'Dice - Wikipedia', at: 2 });
  h = L.remember(h, { url: 'https://a.com', title: 'A again', at: 3 });
  assert.deepStrictEqual(h.map((x) => x.title), ['A again', 'Dice - Wikipedia']);
  for (let i = 0; i < 20; i++) h = L.remember(h, { url: 'https://x.com/' + i, at: i }, 10);
  assert.strictEqual(h.length, 10);
  const s = L.suggest('wiki', [{ name: 'Wikipedia', url: 'https://en.wikipedia.org' }], [{ url: 'https://en.wikipedia.org/wiki/Dice', title: 'Dice - Wikipedia' }], 'ddg');
  assert.deepStrictEqual(s.map((x) => x.kind), ['search', 'shortcut', 'history']);
  assert.strictEqual(L.suggest('example.com', [], [], 'ddg')[0].kind, 'go');
  assert.deepStrictEqual(L.suggest('  ', [], [], 'ddg'), []);
});

test('Dice Home, Dice Cloud and the product marks are all loaded', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  for (const f of ['js/home.js', 'js/cloud.js', 'css/home.css']) assert.ok(html.includes(f), f);
  const cloud = fs.readFileSync(path.join(__dirname, '..', 'js', 'cloud.js'), 'utf8');
  assert.match(cloud, /AES-GCM/); // locked before it leaves
  assert.ok(!/fetch\([^)]*JSON\.stringify\(remote\)/.test(cloud), 'never sends the unlocked data');
  const gfx = fs.readFileSync(path.join(__dirname, '..', 'js', 'gfx.js'), 'utf8');
  for (const p of ['os', 'web', 'tv', 'home', 'cloud', 'emulator']) assert.match(gfx, new RegExp('\\b' + p + ": '#"));
});

test('DiceTV: Watch tiles, web addresses, the sleep timer and backups', () => {
  assert.strictEqual(L.monogram('Netflix'), 'N');
  assert.strictEqual(L.monogram('Disney+'), 'D+');
  assert.strictEqual(L.monogram('Prime Video'), 'PV');
  assert.strictEqual(L.cleanUrl('crunchyroll.com'), 'https://crunchyroll.com/');
  assert.strictEqual(L.cleanUrl('https://www.twitch.tv/directory'), 'https://www.twitch.tv/directory');
  for (const bad of ['', 'hello', 'javascript:alert(1)', 'file:///etc/passwd', 'two words.com']) assert.strictEqual(L.cleanUrl(bad), null, bad);
  assert.deepStrictEqual([0, 15, 30, 60, 90].map(L.nextSleep), [15, 30, 60, 90, 0]);
  assert.ok(L.readBackup(JSON.stringify({ kind: 'dice-backup', v: 1, state: { name: 'Dhruv' } })));
  for (const bad of ['nope', '{}', JSON.stringify({ kind: 'dice-backup', state: [] }), JSON.stringify({ kind: 'other', state: {} })]) assert.strictEqual(L.readBackup(bad), null);
});

test('DiceTV keeps to this screen: no friends, no store, no performance tab', () => {
  const fs = require('fs'), path = require('path');
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const html = read('index.html'), shell = read('js/shell.js'), core = read('js/core.js');
  for (const f of ['js/tools.js', 'js/tv.js']) assert.ok(html.includes(f), f);
  assert.ok(html.indexOf('js/tv.js') < html.indexOf('Dice.shell.start()'), 'tv.js loads before DiceTV starts');
  assert.ok(!/tb-friends|\['friends', 'friends'|\['perf', 'chart'|\['store', 'Store', 'store'/.test(shell));
  assert.ok(!/For your computer/.test(shell));
  assert.match(shell, /D\.tv\.rows\(page\.querySelector\('\.tvb-ground'\)\)/);
  assert.match(core, /!Dice\.state\.dnd \|\| n\.urgent/); // Do not disturb keeps pop-ups away
  const tv = read('js/tv.js');
  // Watch tiles show each site's own icon, fetched from the internet as they appear: no logo is drawn or kept here
  assert.ok(!/logo\.(png|svg)|data:image\/(png|svg)/i.test(tv), 'no logos kept in DiceWeb');
  assert.ok(/s2\/favicons\?domain=/.test(tv), 'icons come from the sites');
});

test('Watch can open things on your own network too', () => {
  assert.strictEqual(L.cleanUrl('192.168.1.20:32400/web'), 'http://192.168.1.20:32400/web');
  assert.strictEqual(L.cleanUrl('jellyfin.local:8096'), 'http://jellyfin.local:8096/');
});

test('the Dice Bar: units, timers and quick tasks', () => {
  assert.strictEqual(L.convert('5 km in miles').text, '5 km = 3.10686 mi');
  assert.strictEqual(L.convert('72 f to c').text, '72 °F = 22.2222 °C');
  assert.strictEqual(Math.round(L.convert('3 cups in ml').value), 710);
  assert.strictEqual(L.convert('2 gb in mb').value, 2000);
  assert.strictEqual(L.convert('5 km in pounds'), null); // can't
  assert.strictEqual(L.convert('hello'), null);
  assert.strictEqual(L.parseTimer('timer 10'), 600000);
  assert.strictEqual(L.parseTimer('set a timer for 90 seconds'), 90000);
  assert.strictEqual(L.parseTimer('timer 1.5 hours'), 5400000);
  assert.strictEqual(L.parseTimer('timer'), 0);
  // 2026-11-24 is a Tuesday
  assert.deepStrictEqual(L.parseTask('todo read chapter 7 friday', '2026-11-24'), { title: 'Read chapter 7', due: '2026-11-27' });
  assert.deepStrictEqual(L.parseTask('task lab report tomorrow', '2026-11-24'), { title: 'Lab report', due: '2026-11-25' });
  assert.deepStrictEqual(L.parseTask('remind me to email Ms. Lee', '2026-11-24'), { title: 'Email Ms. Lee', due: '2026-11-24' });
  assert.deepStrictEqual(L.parseTask('todo quiz review tuesday', '2026-11-24'), { title: 'Quiz review', due: '2026-12-01' }); // next Tuesday, not today
  assert.strictEqual(L.parseTask('just words', '2026-11-24'), null);
});

test('Axiom: when classes meet, and study time', () => {
  const C = [{ id: 'b', name: 'Biology', days: [1, 2, 4], start: '09:00', end: '09:50' }, { id: 'h', name: 'History', days: [2], start: '08:00', end: '08:50' }, { id: 'x', name: 'No times' }];
  assert.deepStrictEqual(L.classesOn(C, '2026-11-24').map((s) => s.cls.id), ['h', 'b']); // Tuesday
  assert.deepStrictEqual(L.classesOn(C, '2026-11-25').map((s) => s.cls.id), []); // Wednesday
  const n = L.classNow(C, new Date(2026, 10, 24, 8, 30));
  assert.strictEqual(n.now.cls.id, 'h'); assert.strictEqual(n.next.cls.id, 'b');
  const w = L.studyWeek([{ day: '2026-11-24', mins: 25, classId: 'b' }, { day: '2026-11-20', mins: 50, classId: 'b' }, { day: '2026-11-01', mins: 99 }], '2026-11-24');
  assert.strictEqual(w.total, 75); assert.strictEqual(w.by.b, 75);
});

test('the desktop: snapping windows and the overview grid', () => {
  const area = { w: 1600, h: 900 };
  assert.deepStrictEqual(L.snapRect('left', area, 0), { x: 0, y: 0, w: 800, h: 900 });
  assert.deepStrictEqual(L.snapRect('br', area, 0), { x: 800, y: 450, w: 800, h: 450 });
  assert.deepStrictEqual(L.snapRect('r23', area, 0), { x: 533, y: 0, w: 1067, h: 900 });
  assert.strictEqual(L.edgeZone(3, 400, area), 'left');
  assert.strictEqual(L.edgeZone(1597, 880, area), 'br');
  assert.strictEqual(L.edgeZone(800, 2, area), 'top');
  assert.strictEqual(L.edgeZone(800, 400, area), null);
  const g = L.fitGrid(5, 1600, 800);
  assert.strictEqual(g.length, 5);
  g.forEach((c) => { assert.ok(c.x >= 0 && c.y >= 0 && c.x + c.w <= 1600 && c.y + c.h <= 800); });
});

test('TV remotes: their keys become DiceTV buttons', () => {
  assert.strictEqual(L.remoteKey('BrowserBack'), 'b');
  assert.strictEqual(L.remoteKey('MediaPlayPause'), 'play');
  assert.strictEqual(L.remoteKey('ColorF0Red'), 'red');
  assert.strictEqual(L.remoteKey('ChannelUp'), 'rb');
  assert.strictEqual(L.remoteKey('a'), null);
});

test('1.6: remotes, Channels, Weather, Photos, Sketch and the desktop extras are all loaded', () => {
  const fs = require('fs'), path = require('path');
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const html = read('index.html'), cat = read('js/catalog.js'), css = read('css/dice.css');
  for (const f of ['js/remote.js', 'js/deskplus.js', 'js/apps/channels.js', 'js/apps/weather.js', 'js/apps/photos.js', 'js/apps/sketch.js']) assert.ok(html.includes(f), f);
  assert.ok(html.indexOf('js/remote.js') < html.indexOf('Dice.shell.start()'));
  for (const id of ['channels', 'weather', 'photos', 'sketch']) { assert.ok(cat.includes("id: '" + id + "'"), id); assert.ok(read('js/apps/' + id + '.js').includes("id: '" + id + "'"), id + ' registers'); }
  // numbers read clearly: the digits font sits in front of the pixel font
  assert.match(css, /@font-face \{ font-family: "Dice Numbers";[^}]*unicode-range: U\+0030-0039/);
  assert.match(css, /--pixel: "Dice Numbers", "Pixelify Sans"/);
});

test('1.7: air mice: power, search and the rest of their keys', () => {
  assert.strictEqual(L.remoteKey('Power'), 'power');
  assert.strictEqual(L.remoteKey('PowerOff'), 'power');
  assert.strictEqual(L.remoteKey('BrowserHome'), 'home');
  assert.strictEqual(L.remoteKey('ContextMenu'), 'menu');
  assert.strictEqual(L.remoteKey('BrowserSearch'), 'search');
  assert.strictEqual(L.remoteKey('AudioVolumeUp'), 'volup');
});

test('1.7: Dice Cloud, Code and the air mouse are loaded, and nothing clashes', () => {
  const fs = require('fs'), path = require('path');
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const html = read('index.html'), cat = read('js/catalog.js');
  for (const f of ['js/airmouse.js', 'js/cloud.js', 'js/apps/cloudapp.js', 'js/apps/code.js']) assert.ok(html.includes(f), f);
  assert.ok(html.indexOf('js/apps/files.js') < html.indexOf('js/apps/code.js'), 'Code uses the file source Files shares');
  for (const id of ['cloud', 'code']) assert.ok(cat.includes("id: '" + id + "'"), id);
  assert.ok(read('js/apps/cloudapp.js').includes("id: 'cloud'"));
  assert.ok(read('js/apps/code.js').includes("id: 'code'"));
  // every script on the page parses
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) assert.doesNotThrow(() => new Function(read(m[1])), m[1]);
});

test('1.8: news channels are real YouTube channel IDs, and the new Home is loaded', () => {
  const fs = require('fs'), path = require('path');
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const ch = read('js/apps/channels.js');
  const ids = [...ch.matchAll(/yt: '([^']+)'/g)].map((m) => m[1]);
  assert.ok(ids.length >= 8, 'at least eight news channels');
  ids.forEach((id) => assert.match(id, /^UC[\w-]{22}$/, id));
  assert.strictEqual(new Set(ids).size, ids.length, 'no channel twice');
  assert.ok(ch.includes('embed/live_stream?channel='), 'played in YouTube\'s own player');
  const shell = read('js/shell.js'), tv = read('js/tv.js');
  assert.ok(shell.includes('tvb-board') && tv.includes('TV.now = function') && tv.includes('function newsRow'));
  assert.ok(read('js/remote.js').includes('D.keyFirst.push'), 'a real keyboard puts the on-screen one away');
});

test('1.9: the ground strip, small motions that respect Less motion, and the lock screen', () => {
  const fs = require('fs'), path = require('path');
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const css = read('css/dice.css'), shell = read('js/shell.js'), tv = read('js/tv.js'), ex = read('js/extras.js');
  assert.ok(shell.includes('tvb-strip') && tv.includes('TV.strip = function'), 'the ground is its own strip');
  // every new keyframe is used only inside the motion guard
  for (const k of ['dpress', 'dblockin', 'dchan', 'dshake']) {
    assert.ok(css.includes('@keyframes ' + k), k);
    const uses = css.split('\n').filter((l) => l.includes(k) && !l.includes('@keyframes'));
    assert.ok(uses.length > 0, k + ' is used');
    uses.forEach((l) => assert.ok(l.includes('html:not([data-motion=less])'), k + ' respects Less motion'));
    const at = css.indexOf(uses[0].trim()), open = css.lastIndexOf('@media (prefers-reduced-motion: no-preference)', at);
    assert.ok(uses[0].includes('prefers-reduced-motion: no-preference') || open >= 0 && css.slice(open, at).split('{').length - css.slice(open, at).split('}').length >= 1, k + ' is inside the reduced-motion guard');
  }
  // nothing new bounces up and down
  const kf = css.match(/@keyframes (dpress|dblockin|dfade|dtick|doskin|dchan|dbarin|dpipin|dshake|demin)[^}]*\}[^}]*\}/g) || [];
  kf.forEach((k) => assert.ok(!/translateY\(-/.test(k), 'no bouncing up: ' + k.slice(0, 30)));
  assert.ok(ex.includes('D.lock = ') && ex.includes('hasPin'), 'the lock screen');
  assert.ok(!/localStorage\.setItem\([^)]*pin/i.test(ex), 'the PIN is not kept as plain text');
  assert.ok(read('index.html').includes('js/extras.js'));
  assert.ok(read('js/apps/channels.js').includes("a === 'yellow'"), 'last channel');
});
