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

test('Roll: a one loses the turn, holding banks it, 50 wins', () => {
  let s = { turn: 0, scores: [0, 0], who: 0 };
  s = L.pigStep(s, 4); s = L.pigStep(s, 6);
  assert.deepStrictEqual([s.turn, s.who], [10, 0]);
  const bust = L.pigStep(s, 1);
  assert.deepStrictEqual([bust.turn, bust.who, bust.bust, bust.scores[0]], [0, 1, true, 0]);
  const held = L.pigHold(s);
  assert.deepStrictEqual([held.scores[0], held.who], [10, 1]);
  const near = { turn: 0, scores: [46, 0], who: 0 };
  const won = L.pigStep(near, 5);
  assert.strictEqual(won.won, 0);
  assert.strictEqual(won.scores[0], 51);
});

test('Roll: friends hold when brave enough, and always take the win', () => {
  assert.strictEqual(L.pigChoice('roomy', 12, 0, 0), 'hold'); // careful
  assert.strictEqual(L.pigChoice('flash', 12, 0, 0), 'roll'); // brave
  assert.strictEqual(L.pigChoice('flash', 5, 46, 0), 'hold'); // that's the game
  assert.strictEqual(L.pigChoice('roomy', 15, 10, 45), 'roll'); // you're nearly there: be brave
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

test('every achievement has a name, a how and a colour', () => {
  const ids = new Set();
  for (const a of L.ACHIEVEMENTS) {
    assert.ok(a.id && a.name && a.how && /^#[0-9a-f]{6}$/i.test(a.c));
    assert.ok(!ids.has(a.id)); ids.add(a.id);
  }
  assert.strictEqual(L.level(0), 1);
  assert.strictEqual(L.level(5), 3);
});

test('the page loads every script it needs, and they all exist', () => {
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.length >= 10);
  for (const s of srcs) assert.ok(fs.existsSync(path.join(__dirname, '..', s)), s);
  for (const css of [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1])) assert.ok(fs.existsSync(path.join(__dirname, '..', css)), css);
});
