// Deuce's brain: what it understands from what you say
const test = require('node:test');
const assert = require('node:assert');
const B = require('../js/deucebrain.js');

const NOV = new Date(2026, 10, 26, 18, 0); // a November evening: basketball, football and hockey
const U = (s, now) => B.understand(s, now || NOV);

test('games: the teams, the leagues and what you want', () => {
  let r = U('Put on the Knicks game');
  assert.strictEqual(r.kind, 'game');
  assert.deepStrictEqual(r.teams.map((t) => t.league + ':' + t.nick), ['nba:Knicks']);
  assert.strictEqual(r.want, 'watch');
  assert.strictEqual(U('hey deuce, put on the knicks').kind, 'game');
  assert.strictEqual(U('watch the Devils').teams[0].nick, 'Devils');
  assert.strictEqual(U('Where can I watch the Jets game?').teams.length, 2); // the NFL Jets and the NHL Jets, both playing in November
  assert.deepStrictEqual(U('new york giants game').teams.map((t) => t.league), ['nfl']);
  // in November, the Rangers are hockey's; in July, baseball's
  assert.strictEqual(U('rangers game').teams[0].league, 'nhl');
  assert.strictEqual(U('rangers game', new Date(2026, 6, 4)).teams[0].league, 'mlb');
  assert.strictEqual(U('whats the score of the celtics game').want, 'score');
  assert.strictEqual(U('who won the eagles game').want, 'score');
  assert.strictEqual(U('when do the sixers play').want, 'when');
  assert.strictEqual(U('is there a yankees game tonight', new Date(2026, 4, 1)).want, 'when');
  assert.strictEqual(U('put on the niners game').teams[0].nick, '49ers');
  assert.deepStrictEqual(U('the boston game').teams.map((t) => t.nick), ['Celtics', 'Bruins']); // (the Red Sox are off till spring)
  // "play jazz" is music, not Utah's basketball team
  assert.strictEqual(U('play jazz').kind, 'search');
  assert.strictEqual(U('play some jazz music').q, 'jazz');
});

test('channels: by name or number', () => {
  assert.deepStrictEqual([U('put on MSG').kind, U('put on MSG').id], ['channel', 'msg']);
  assert.strictEqual(U('watch NBC').id, 'nbc');
  assert.strictEqual(U('turn on cbs').id, 'cbs');
  assert.strictEqual(U('abc').id, 'abc');
  assert.strictEqual(U('go to the fox channel').id, 'fox');
  assert.strictEqual(U('MSG Sportsnet').id, 'msgsn');
  assert.strictEqual(U('put on espn').kind, 'channel');
  assert.deepStrictEqual([U('channel 7').kind, U('channel 7').num], ['channel', '7']);
  assert.strictEqual(U('channel seven').num, '7');
  assert.strictEqual(U('channel 4.1').num, '4.1');
});

test('apps, and searching inside them', () => {
  assert.deepStrictEqual([U('open Netflix').kind, U('open Netflix').id], ['app', 'netflix']);
  assert.strictEqual(U('youtube').id, 'youtube');
  assert.strictEqual(U('launch the disney plus app').id, 'disney');
  assert.strictEqual(U('open settings').id, 'dice:settings');
  assert.strictEqual(U('show me my photos').id, 'dice:photos');
  assert.strictEqual(U('open youtube tv').id, 'ytv');
  let r = U('play stranger things on netflix');
  assert.deepStrictEqual([r.kind, r.app, r.q], ['search', 'netflix', 'stranger things']);
  r = U('search youtube for lofi beats');
  assert.deepStrictEqual([r.kind, r.app, r.q], ['search', 'youtube', 'lofi beats']);
  r = U('play taylor swift on spotify');
  assert.deepStrictEqual([r.app, r.q], ['spotify', 'taylor swift']);
  assert.strictEqual(U('play some music').kind, 'music');
});

test('switching HDMI inputs', () => {
  assert.deepStrictEqual([U('switch to the PlayStation').kind, U('switch to the PlayStation').name], ['input', 'playstation']);
  assert.strictEqual(U('change the input to xbox').name, 'xbox');
  assert.strictEqual(U('switch to hdmi 2').port, 2);
  assert.strictEqual(U('go to hdmi two').port, 2);
  assert.strictEqual(U('switch inputs').kind, 'inputs');
  assert.strictEqual(U('switch to the cable box').name, 'cable box');
  assert.strictEqual(U('back to dice').dice, true);
  // but "switch to netflix" is the app
  assert.strictEqual(U('switch to netflix').kind, 'app');
  // a PC's screen: its other inputs, and names you gave them
  assert.strictEqual(U('switch to my work laptop').name, 'work laptop');
  assert.strictEqual(U('switch the screen to displayport').name, 'displayport');
  assert.strictEqual(U('switch to usb c').name, 'usb c');
  assert.deepStrictEqual([B.understand('switch to the kitchen one', NOV, { inputs: ['Kitchen one'] }).kind, B.understand('switch to the kitchen one', NOV, { inputs: ['Kitchen one'] }).name], ['input', 'kitchen one']);
  assert.notStrictEqual(U('switch to the kitchen one').kind, 'input');
});

test('the TV itself: sound, playing, power', () => {
  assert.strictEqual(U('turn it up').delta, 0.1);
  assert.strictEqual(U('turn the volume down').delta, -0.1);
  assert.strictEqual(U('louder').kind, 'volume');
  assert.strictEqual(U('set the volume to 30').level, 0.3);
  assert.strictEqual(U('volume five').level, 0.5);
  assert.strictEqual(U('mute').mute, true);
  assert.strictEqual(U('unmute').mute, false);
  assert.strictEqual(U('pause').act, 'pause');
  assert.strictEqual(U('next song').act, 'next');
  assert.strictEqual(U('turn off the tv').act, 'standby');
  assert.strictEqual(U('good night').act, 'standby');
  assert.strictEqual(U('go home').kind, 'home');
  assert.strictEqual(U('go back').kind, 'back');
  assert.strictEqual(U('never mind').kind, 'cancel');
});

test('timers, alarms and the sleep timer', () => {
  assert.strictEqual(U('set a timer for 10 minutes').ms, 600000);
  assert.strictEqual(U('timer for ten minutes').ms, 600000);
  assert.strictEqual(U('set a five minute timer').ms, 300000);
  assert.strictEqual(U('timer for twenty five seconds').ms, 25000);
  assert.strictEqual(U('timer for an hour and a half').ms, 5400000);
  assert.strictEqual(U('set a timer for half an hour').ms, 1800000);
  assert.strictEqual(U('cancel the timer').ms, 0);
  assert.strictEqual(U('turn off in 30 minutes').mins, 30);
  assert.strictEqual(U('sleep timer one hour').mins, 60);
  let r = U('set an alarm for 7 am');
  assert.deepStrictEqual([r.kind, r.time], ['alarm', '07:00']);
  r = U('wake me up at 6:30 every day');
  assert.deepStrictEqual([r.time, r.days.length], ['06:30', 7]);
  assert.strictEqual(U('set an alarm for seven thirty pm').time, '19:30');
  assert.deepStrictEqual(U('alarm at 6 in the morning on weekdays').days, [1, 2, 3, 4, 5]);
});

test('questions, files and what it doesn\'t know', () => {
  assert.strictEqual(U('what time is it').kind, 'time');
  assert.strictEqual(U('what day is it').kind, 'date');
  assert.strictEqual(U('whats the weather').kind, 'weather');
  assert.strictEqual(U('is it going to rain tomorrow').tomorrow, true);
  assert.deepStrictEqual([U('find my history essay').kind, U('find my history essay').q], ['files', 'history essay']);
  assert.strictEqual(U('what can you do').kind, 'help');
  assert.strictEqual(U('blorp the zibble').kind, 'unknown');
});

test('a game from ESPN\'s scoreboard: which one, and where it\'s on', () => {
  const knicks = { league: 'nba', sport: 'basketball', nick: 'Knicks', full: 'New York Knicks' };
  assert.match(B.scoreboardUrl(knicks, NOV), /basketball\/nba\/scoreboard\?dates=20261125-20261203/);
  const ev = (id, date, state, home, away, broadcasts, geo) => ({ id, date, name: away + ' at ' + home, status: { type: { state, shortDetail: state === 'in' ? 'Q3 4:12' : '7:30 PM' } },
    competitions: [{ competitors: [{ homeAway: 'home', score: '70', team: { name: home.split(' ').pop(), displayName: home, shortDisplayName: home.split(' ').pop() } }, { homeAway: 'away', score: '66', team: { name: away.split(' ').pop(), displayName: away, shortDisplayName: away.split(' ').pop() } }], broadcasts, geoBroadcasts: geo }] });
  const events = [
    ev('1', '2026-11-25T00:30Z', 'post', 'Boston Celtics', 'New York Knicks', [], []),
    ev('2', '2026-11-27T00:30Z', 'pre', 'New York Knicks', 'Miami Heat', [{ market: 'home', names: ['MSG'] }, { market: 'away', names: ['FDSSUN'] }], []),
    ev('3', '2026-11-29T01:00Z', 'pre', 'Chicago Bulls', 'New York Knicks', [{ market: 'national', names: ['ESPN'] }], [{ type: { shortName: 'TV' }, market: { type: 'Away' }, media: { shortName: 'MSG' } }]),
  ];
  let g = B.pickGame(events, knicks, NOV);
  assert.strictEqual(g.id, '2');
  assert.strictEqual(g.home, true);
  assert.deepStrictEqual(g.networks.map((n) => n.name), ['MSG', 'FDSSUN']);
  assert.strictEqual(g.networks[0].id, 'msg');
  // the one on now wins
  events[2].status.type.state = 'in';
  g = B.pickGame(events, knicks, NOV);
  assert.strictEqual(g.id, '3');
  assert.deepStrictEqual(g.networks.map((n) => [n.name, n.where]), [['ESPN', 'national'], ['MSG', 'away']]);
  assert.strictEqual(g.us, 'Knicks');
  assert.strictEqual(B.pickGame(events, { nick: 'Lakers', full: 'Los Angeles Lakers' }), null);
  assert.strictEqual(B.netOf('ESPN2'), 'espn');
  assert.strictEqual(B.netOf('MSG2'), 'msgsn');
  assert.strictEqual(B.netOf('Prime Video'), 'prime');
  assert.strictEqual(B.netOf('TNT'), 'tnt');
  assert.strictEqual(B.netOf('Peacock'), 'peacock');
});

test('Deuce on a PC: reminders, the Notebook, the computer and questions', () => {
  const FRI = new Date(2026, 10, 27, 13, 30); // a Friday afternoon
  const at = (s) => { const r = U(s, FRI); return r.at ? new Date(r.at) : null; };
  let r = U('remind me to call mom at 6', FRI);
  assert.strictEqual(r.kind, 'remind');
  assert.strictEqual(r.what, 'call mom');
  assert.strictEqual(at('remind me to call mom at 6').getHours(), 18);   // 6 in the morning has gone: this evening
  assert.strictEqual(at('remind me at 9 am to call mom').getDate(), 28);  // tomorrow morning
  assert.strictEqual(at('remind me in 20 minutes to check the oven') - FRI, 20 * 60000);
  assert.strictEqual(U('remind me in 20 minutes to check the oven', FRI).what, 'check the oven');
  assert.strictEqual(at('remind me tomorrow at 9 to take out the trash').getDate(), 28);
  assert.strictEqual(U('remind me tonight to pack my bag', FRI).what, 'pack my bag');
  assert.strictEqual(at('remind me tonight to pack my bag').getHours(), 20);
  assert.strictEqual(at('remind me to study on monday').getDay(), 1);
  assert.strictEqual(U('remind me to drink water', FRI).at, null);        // Deuce asks when
  // the Notebook
  assert.strictEqual(U('remember that my locker is 42').fact, 'my locker is 42');
  assert.strictEqual(U('remember my password is hunter2').secret, true); // passwords aren't kept
  assert.strictEqual(U('what do you know about me').kind, 'notebook');
  assert.strictEqual(U('forget that my locker is 42').fact, 'my locker is 42');
  assert.strictEqual(U('forget everything').fact, '');
  assert.strictEqual(U('my name is dhruv').name, 'Dhruv');
  assert.strictEqual(U('note buy milk').note, 'buy milk');
  // the computer
  assert.deepStrictEqual([U('turn on dark mode').what, U('turn on dark mode').value], ['look', 'night']);
  assert.strictEqual(U('night light off').value, false);
  assert.deepStrictEqual([U('turn on traced mode').what, U('turn on traced mode').value], ['looks', true]);
  assert.deepStrictEqual([U('traced mode off').what, U('traced mode off').value], ['looks', false]);
  assert.strictEqual(U('turn on heavenly looks').what, 'looks'); // its old name
  assert.strictEqual(U('start traced mode').what, 'looks'); // not a mode called Traced
  assert.strictEqual(U('set brightness to 50').value, 0.5);
  assert.strictEqual(U('do not disturb on').what, 'quiet');
  assert.strictEqual(U('start focus mode').name, 'focus');
  assert.strictEqual(U('time to study').name, 'school');
  assert.strictEqual(U('end focus mode').off, true);
  assert.strictEqual(U('end focus mode').name, 'focus');
  assert.strictEqual(U('dark mode').kind, 'setting');                    // not a mode called "dark"
  assert.strictEqual(U('how many ads did you block today').act, 'count');
  assert.strictEqual(U('turn off the ad blocker').act, 'off');
  assert.strictEqual(U('take a screenshot').kind, 'shot');
  assert.strictEqual(U('how was my week').kind, 'week');
  // the web
  assert.strictEqual(U('open github.com').url, 'https://github.com');
  assert.strictEqual(U('open youtube').kind, 'app');                     // the app, not a website
  assert.strictEqual(U('search the web for best pizza in newark').q, 'best pizza in newark');
  assert.strictEqual(U('search youtube for cats').kind, 'search');       // still YouTube's search
  assert.strictEqual(U('why is the sky blue').kind, 'ask');
  assert.strictEqual(U('who wrote hamlet?').q, 'who wrote hamlet?');
  assert.strictEqual(U('whats the weather').kind, 'weather');            // Deuce knows that one itself
  assert.strictEqual(U('blorp').kind, 'unknown');
});
