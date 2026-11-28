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

// ---- 2.4.0: sums, other places' time, countdowns, briefings, two things at once ----
const C = require('../js/deucecalc.js');

test('the calculator works sums and conversions out exactly', () => {
  const v = (s) => C.eval(s).value;
  assert.strictEqual(v('15% of 80'), 12);
  assert.strictEqual(v('what is (3 + 4) × 2'), 14);
  assert.strictEqual(v('whats 12 times 7'), 84);
  assert.strictEqual(v('square root of 81'), 9);
  assert.strictEqual(v('2 to the power of 10'), 1024);
  assert.strictEqual(v('200 + 10%'), 220);
  assert.strictEqual(v('what is 1,234 + 5,678'), 6912);
  assert.ok(Math.abs(v('5 miles in km') - 8.04672) < 1e-9);
  assert.ok(Math.abs(v('70 f to c') - 21.1111) < 1e-3);
  assert.strictEqual(v('-40 c in f'), -40);
  assert.strictEqual(C.eval('how many ounces in a pound').text, '1 pound is 16 ounces.');
  assert.strictEqual(C.eval('6 feet 2 inches in cm').text, '6 feet 2 inches is 187.96 cm.');
  assert.strictEqual(C.eval('3 meters in kg').ok, false); // they measure different things
  assert.strictEqual(C.eval('what is the capital of france'), null);
  assert.strictEqual(C.eval('process.exit()'), null); // its own parser: nothing runs
  for (const s of ['open netflix', 'volume 30', 'brightness 50%', 'play 1989 by taylor swift', 'remind me at 5:30 to leave', 'channel 7']) assert.strictEqual(C.looks(s), false, s);
});

test('Deuce works out sums, the time elsewhere, and how long until a day', () => {
  assert.deepStrictEqual([U('what is 15% of 80').kind, U('convert 5 miles to km').kind], ['calc', 'calc']);
  let r = U('what time is it in tokyo');
  assert.deepStrictEqual([r.kind, r.place, r.tz], ['time', 'Tokyo', 'Asia/Tokyo']);
  assert.strictEqual(U('time in london').tz, 'Europe/London');
  assert.strictEqual(U('what time is it').tz, undefined);
  r = U('how many days until christmas');
  assert.deepStrictEqual([r.kind, r.days], ['until', 29]);
  assert.strictEqual(U('how many days till thanksgiving', new Date(2026, 10, 20)).days, 6); // the 4th Thursday of November
  assert.strictEqual(U('how long until june 18').days, 204);
  assert.strictEqual(U('days until friday').days, 1);
  assert.strictEqual(U('good morning').kind, 'brief');
  assert.strictEqual(U('whats my day look like').kind, 'brief');
});

test('two things at once, when Deuce knows both', () => {
  assert.deepStrictEqual(B.split('turn on dark mode and play some music', NOV).map((x) => x.kind), ['setting', 'music']);
  assert.deepStrictEqual(B.split('open netflix then set a timer for 10 minutes', NOV).map((x) => x.kind), ['app', 'timer']);
  assert.strictEqual(B.split('what is the capital of france and why', NOV), null); // that's a question for the brain
  assert.strictEqual(B.split('rock and roll', NOV), null);
});

// ---- 2.5.0: Oops, Lookouts, Show me how, moment reminders, Roll for it, Float, fridge notes ----
test('Oops: "undo that" takes back the last change, and "what did I change" shows them', () => {
  for (const s of ['oops', 'undo that', 'take it back', 'put it back', 'change it back', 'I didn\'t mean that']) assert.deepStrictEqual([U(s).kind, U(s).act], ['oops', 'undo'], s);
  for (const s of ['what did I change', 'what changed', 'show my recent changes', 'what can I undo']) assert.deepStrictEqual([U(s).kind, U(s).act], ['oops', 'list'], s);
  assert.strictEqual(U('go back').kind, 'back'); // still the Back button
});

test('Lookouts: games, the weather, web pages and the internet', () => {
  let r = U('Let me know when the Knicks game starts');
  assert.deepStrictEqual([r.kind, r.what, r.team, r.end], ['lookout', 'game', 'Knicks', false]);
  assert.strictEqual(U('tell me when the jets game is over').end, true);
  assert.strictEqual(U('keep an eye on the rangers').team, 'Rangers');
  assert.deepStrictEqual([U('tell me when it stops raining').what, U('tell me when it stops raining').cond], ['weather', 'dry']);
  assert.strictEqual(U('let me know if it snows').cond, 'snow');
  r = U('tell me when it gets above 60 degrees');
  assert.deepStrictEqual([r.cond, r.n], ['above', 60]);
  assert.strictEqual(U('warn me if it drops below freezing').cond, 'freezing');
  assert.strictEqual(U('tell me when it stops raining in new york').what, 'weather'); // a city isn't a team without a game
  r = U('Tell me when example.com mentions tickets');
  assert.deepStrictEqual([r.what, r.url, r.cond, r.words], ['page', 'https://example.com', 'says', 'tickets']);
  r = U('let me know when the price on this page drops below 50');
  assert.deepStrictEqual([r.url, r.cond, r.n], ['this', 'below', 50]);
  assert.strictEqual(U('let me know when this page changes').cond, 'change');
  assert.strictEqual(U('keep an eye on bestbuy.com/ps5').url, 'https://bestbuy.com/ps5');
  assert.strictEqual(U('tell me when the internet is back').what, 'online');
  assert.deepStrictEqual([U('tell me when pigs fly').kind, U('tell me when pigs fly').act], ['lookout', 'cant']);
  assert.strictEqual(U('what are you keeping an eye on').act, 'list');
  assert.deepStrictEqual([U('stop watching the knicks').act, U('stop watching the knicks').what], ['stop', 'the knicks']);
  assert.strictEqual(U('watch the knicks game').kind, 'game'); // watching a game is still watching it
});

test('Show me how: "how do I…" about Dice lights the way; anything else is a question', () => {
  const t = (s) => (U(s).kind === 'howto' ? U(s).topic : U(s).kind);
  assert.strictEqual(t('How do I change the wallpaper?'), 'world');
  assert.strictEqual(t('where do I turn on bluetooth'), 'bt');
  assert.strictEqual(t('show me how to make the text bigger'), 'text');
  assert.strictEqual(t('how do I pair my controller'), 'pad');
  assert.strictEqual(t('how do I make Deuce smarter'), 'brain');
  assert.strictEqual(t('how do I use my phone as a remote'), 'remote');
  assert.strictEqual(t('how do I undo'), 'oops');
  assert.strictEqual(t('how do i keep a window on top'), 'float');
  assert.strictEqual(t('how do I cook rice'), 'ask');
  assert.strictEqual(t('turn on bluetooth'), 'setting'); // asked to do it: it's done, not shown
});

test('reminders for a moment, not a time: "next time I open Netflix"', () => {
  let r = U('remind me to finish the show next time I open netflix');
  assert.deepStrictEqual([r.kind, r.what, r.at, r.on], ['remind', 'finish the show', null, { app: 'netflix' }]);
  r = U('remind me next time I open spotify to make a playlist');
  assert.deepStrictEqual([r.what, r.on], ['make a playlist', { app: 'spotify' }]);
  assert.deepStrictEqual(U('remind me to check email when I\'m on the desktop').on, { place: 'desk' });
  assert.deepStrictEqual(U('remind me to take out the trash when I turn on the tv').on, { place: 'tv' });
  assert.strictEqual(U('remind me to call mom at 6').on, undefined);
});

test('Roll for it, Float, and fridge notes', () => {
  assert.deepStrictEqual([U('roll for it').kind, U('roll for it').what], ['roll', 'any']);
  assert.strictEqual(U('what should I watch').what, 'watch');
  assert.strictEqual(U('what should i play tonight').what, 'play');
  assert.strictEqual(U('i cant decide what to listen to').what, 'listen');
  assert.strictEqual(U('surprise me').kind, 'roll');
  assert.deepStrictEqual([U('float this window').kind, U('float this window').on], ['float', true]);
  assert.strictEqual(U('keep this on top').on, true);
  assert.strictEqual(U('stop floating').on, false);
  assert.strictEqual(U('leave a note on the TV: Pizza in the fridge!').note, 'Pizza in the fridge!'); // as typed
  assert.strictEqual(U('leave a note for whoever is next saying back at 6').note, 'Back at 6');
  assert.strictEqual(U('fridge note feed the cat').note, 'Feed the cat');
  assert.strictEqual(U('clear the note').clear, true);
  assert.strictEqual(U('take a note buy milk').kind, 'note'); // a note for you is still a note in Notes
});
