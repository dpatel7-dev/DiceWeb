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

test('the old built-in games stay gone; Dhruv\'s own games are in Games, and load nothing from elsewhere', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(!/roll\.js|flight\.js/.test(html));
  assert.strictEqual(L.pigStep, undefined);
  const dir = path.join(__dirname, '..', 'games'), games = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
  assert.deepStrictEqual(games.sort(), ['algebradash.html', 'ballandwall.html', 'lunarlander.html', 'neonvoids.html']);
  for (const f of games) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    assert.ok(!/<script[^>]+src=/i.test(s), f + ' loads no outside scripts');
    assert.ok(!/fetch\(|XMLHttpRequest|WebSocket/.test(s), f + ' talks to nobody');
  }
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'apps', 'games.js'), 'utf8');
  for (const f of games) assert.ok(app.includes("'" + f.replace('.html', '') + "'"), f + ' is listed in the Games app');
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
  for (const f of ['scape.js', 'skyline.js', 'apps/calculator.js', 'apps/axiom.js', 'apps/serenetab.js', 'apps/games.js', 'apps/clock.js', 'apps/monitor.js']) assert.ok(at(f) > 0, f);
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
