// The terminal screen (js/vt.js), with a tiny stand-in for the page.
const test = require('node:test');
const assert = require('node:assert');
const el = () => ({ classList: { add() {}, toggle() {} }, innerHTML: '', children: [], appendChild(c) { this.children.push(c); }, get firstChild() { return this.children[0]; }, get lastChild() { return this.children[this.children.length - 1]; }, querySelector() { return el(); } });
global.document = { createElement: () => Object.assign(el(), { remove() {} }), documentElement: { getAttribute: () => 'light' } };
global.requestAnimationFrame = () => 0;
const VT = require('../js/vt.js');

function screen(cols = 20, rows = 5) { const v = new VT(el()); v.resize(cols, rows); return v; }

test('writes text and wraps at the edge', () => {
  const v = screen(10, 4);
  v.write('hello\r\nworld, this wraps');
  assert.deepStrictEqual(v.text().split('\n'), ['hello', 'world, thi', 's wraps', '']);
  assert.strictEqual(v.histCount, 0); // getting smaller doesn't fill the history with blank lines
});

test('moves the cursor and clears', () => {
  const v = screen();
  v.write('aaaa\r\nbbbb\x1b[1;2Hx\x1b[2;1H\x1b[K');
  assert.deepStrictEqual(v.text().split('\n').slice(0, 2), ['axaa', '']);
  v.write('\x1b[2J\x1b[H!');
  assert.strictEqual(v.text().split('\n')[0], '!');
});

test('scrolls old lines into the history', () => {
  const v = screen(10, 4);
  v.write('1\r\n2\r\n3\r\n4\r\n5');
  assert.deepStrictEqual(v.text().split('\n'), ['2', '3', '4', '5']);
  assert.strictEqual(v.histCount, 1);
});

test('colours and the alternate screen (nano, htop, less)', () => {
  const v = screen();
  v.write('\x1b[1;31mred\x1b[0m plain');
  assert.strictEqual(v.screen[0][0].fg, 1);
  assert.strictEqual(v.screen[0][0].b, 1);
  assert.strictEqual(v.screen[0][4].fg, null);
  v.write('\x1b[38;2;10;20;30mT\x1b[38;5;200mE');
  assert.strictEqual(v.screen[0][9].fg, '#0a141e');
  assert.strictEqual(v.screen[0][10].fg, 200);
  v.write('\x1b[?1049h\x1b[Hfull screen app');
  assert.strictEqual(v.text().split('\n')[0], 'full screen app');
  v.write('\x1b[?1049l');
  assert.match(v.text(), /red plain/);
});

test('answers questions programs ask, and knows its keys', () => {
  const v = screen();
  let said = '';
  v.opts.onReply = (s) => { said += s; };
  v.write('ab\x1b[6n');
  assert.strictEqual(said, '\x1b[1;3R');
  assert.strictEqual(v.keyBytes({ key: 'ArrowUp' }), '\x1b[A');
  v.write('\x1b[?1h');
  assert.strictEqual(v.keyBytes({ key: 'ArrowUp' }), '\x1bOA');
  assert.strictEqual(v.keyBytes({ key: 'c', ctrlKey: true }), '\x03');
  assert.strictEqual(v.keyBytes({ key: 'Enter' }), '\r');
  assert.strictEqual(v.keyBytes({ key: 'x' }), null); // ordinary letters come through typing
});

test('a scroll region only scrolls inside itself', () => {
  const v = screen(10, 4);
  v.write('top\r\n1\r\n2\r\nbottom\x1b[2;3r\x1b[3;1H\r\nnew');
  assert.deepStrictEqual(v.text().split('\n'), ['top', '2', 'new', 'bottom']);
});
