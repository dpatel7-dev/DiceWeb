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
});

test('no games are left in DiceWeb', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(!/roll\.js|flight\.js/.test(html));
  assert.strictEqual(L.pigStep, undefined);
});

test('the page loads every script it needs, and they all exist', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.length >= 10);
  for (const s of srcs) assert.ok(fs.existsSync(path.join(__dirname, '..', s)), s);
  for (const css of [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1])) assert.ok(fs.existsSync(path.join(__dirname, '..', css)), css);
});
