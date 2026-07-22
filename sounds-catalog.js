const WORK_BELL_SOUNDS = [
  { name: 'School Bell', file: 'sounds/time-up/emg5991-school-bell.mp3' },
  { name: 'School Bell (Alt)', file: 'sounds/time-up/universfield-school-bell.mp3' },
  { name: 'Copper Bell Ding', file: 'sounds/break/floraphonic-copper-bell-ding-25.mp3' },
  { name: 'Casual Click Pop', file: 'sounds/break/floraphonic-casual-click-pop-ui-4.mp3' },
  { name: 'Short UI Break', file: 'sounds/break/pietix-short-ui-break-6.mp3' },
  { name: 'Slow Piano Pause', file: 'sounds/break/freesound_community-slow-piano-pause-sound.mp3' }
];

const BREAK_BELL_SOUNDS = [
  { name: 'Copper Bell Ding', file: 'sounds/break/floraphonic-copper-bell-ding-25.mp3' },
  { name: 'Casual Click Pop', file: 'sounds/break/floraphonic-casual-click-pop-ui-4.mp3' },
  { name: 'Short UI Break', file: 'sounds/break/pietix-short-ui-break-6.mp3' },
  { name: 'Slow Piano Pause', file: 'sounds/break/freesound_community-slow-piano-pause-sound.mp3' },
  { name: 'School Bell', file: 'sounds/time-up/emg5991-school-bell.mp3' },
  { name: 'School Bell (Alt)', file: 'sounds/time-up/universfield-school-bell.mp3' },
];

const FOCUS_MUSIC_TRACKS = [
  // { name: 'Lofi Music', file: 'sounds/focus-music/Lofi Music.webm' },
  // { name: 'Lofi Music 2', file: 'sounds/focus-music/lofi 2.webm' },
  { name: 'Lofi beat', file: 'sounds/focus-music/mirostar-lofi-beats-531504.mp3' },
  { name: 'Alex Morgan Corporate Lofi Flute Presentation', file: 'sounds/focus-music/alex-morgan-corporate-lofi-flute-presentation-560069.mp3' },
  { name: 'Alex Morgan Corporate Lofi Groove Advertising', file: 'sounds/focus-music/alex-morgan-corporate-lofi-groove-advertising-560068.mp3' },
  { name: 'Alex Morgan Lofi Cocktail Bar', file: 'sounds/focus-music/alex-morgan-lofi-cocktail-bar-568153.mp3' },
  { name: 'Alex Morgan Lofi Coffee Shop', file: 'sounds/focus-music/alex-morgan-lofi-coffee-shop-568150.mp3' },
  { name: 'Alex Morgan Lofi Hip Hop Funky Midnight Club', file: 'sounds/focus-music/alex-morgan-lofi-hip-hop-funky-midnight-club-560062.mp3' },
  { name: 'Alex Morgan Lofi Hip Hop Rhythm Rainy Night', file: 'sounds/focus-music/alex-morgan-lofi-hip-hop-rhythm-rainy-night-560050.mp3' },
  { name: 'Alex Morgan Lofi Jazz Melody Restaurant', file: 'sounds/focus-music/alex-morgan-lofi-jazz-melody-restaurant-560048.mp3' },
  { name: 'Alex Morgan Lofi Jazz Soulful Midnight Club', file: 'sounds/focus-music/alex-morgan-lofi-jazz-soulful-midnight-club-560063.mp3' },
  { name: 'Alex Morgan Lofi Jazz Trio Sunny Cafe', file: 'sounds/focus-music/alex-morgan-lofi-jazz-trio-sunny-cafe-560051.mp3' },
  { name: 'Alex Morgan Lofi Midnight Club', file: 'sounds/focus-music/alex-morgan-lofi-midnight-club-568164.mp3' },
  { name: 'Alex Morgan Lofi Restaurant', file: 'sounds/focus-music/alex-morgan-lofi-restaurant-568157.mp3' },
  { name: 'Alex Morgan Lofi Study Session', file: 'sounds/focus-music/alex-morgan-lofi-study-session-568160.mp3' },
  { name: 'Alex Morgan Lofi Sunny Cafe', file: 'sounds/focus-music/alex-morgan-lofi-sunny-cafe-568156.mp3' },
  { name: 'Apalonbeats Lofi Background Music', file: 'sounds/focus-music/apalonbeats-lofi-background-music-560408.mp3' },
  { name: 'Apalonbeats Lofi Beats Study', file: 'sounds/focus-music/apalonbeats-lofi-beats-lofi-study-560413.mp3' },
  { name: 'Apalonbeats Lofi Hiphop', file: 'sounds/focus-music/apalonbeats-lofi-hiphop-560424.mp3' },
  { name: 'Apalonbeats Lofi Music 2', file: 'sounds/focus-music/apalonbeats-lofi-lofi-music-2-566602.mp3' },
  { name: 'Apalonbeats Lofi Music', file: 'sounds/focus-music/apalonbeats-lofi-lofi-music-549425.mp3' },
  { name: 'Apalonbeats Lofi Music', file: 'sounds/focus-music/apalonbeats-lofi-lofi-music-549461.mp3' },
  { name: 'Apalonbeats Lofi Music Chill 2', file: 'sounds/focus-music/apalonbeats-lofi-lofi-music-lofi-chill-2-560425.mp3' },
  { name: 'Apalonbeats Sad Lofi', file: 'sounds/focus-music/apalonbeats-sad-lofi-560422.mp3' },
  { name: 'Arpmedia Lofi Hiphop', file: 'sounds/focus-music/arpmedia-lofi-hiphop-561568.mp3' },
  { name: 'Arpmedia Lofi Hiphop', file: 'sounds/focus-music/arpmedia-lofi-hiphop-561587.mp3' },
  { name: 'Arpmedia Lofi Music 2', file: 'sounds/focus-music/arpmedia-lofi-lofi-music-2-569464.mp3' },
  { name: 'Fassounds Good Night Lofi Cozy Chill Music', file: 'sounds/focus-music/fassounds-good-night-lofi-cozy-chill-music-160166.mp3' },
  { name: 'Fassounds Lofi Study Calm Peaceful Chill Hop', file: 'sounds/focus-music/fassounds-lofi-study-calm-peaceful-chill-hop-112191.mp3' },
  { name: 'Leberch Lofi Hip Hop', file: 'sounds/focus-music/leberch-lofi-hip-hop-519408.mp3' },
  { name: 'Mirostar Lofi Girl Chill 2', file: 'sounds/focus-music/mirostar-lofi-lofi-girl-lofi-chill-2-531491.mp3' },
  { name: 'Mirostar Lofi Girl Chill 2', file: 'sounds/focus-music/mirostar-lofi-lofi-girl-lofi-chill-2-560285.mp3' },
  { name: 'Mirostar Lofi Music 2', file: 'sounds/focus-music/mirostar-lofi-lofi-music-2-560297.mp3' },
  { name: 'Mirostar Lofi Music', file: 'sounds/focus-music/mirostar-lofi-lofi-music-531487.mp3' },
  { name: 'Mirostar Lofi Music Chill', file: 'sounds/focus-music/mirostar-lofi-lofi-music-lofi-chill-560327.mp3' },
  { name: 'Mirostar Sad Lofi', file: 'sounds/focus-music/mirostar-sad-lofi-560303.mp3' },
  { name: 'Mirostar Study Lofi Music', file: 'sounds/focus-music/mirostar-study-lofi-music-560307.mp3' },
  { name: 'Mondamusic Lofi Chill', file: 'sounds/focus-music/mondamusic-lofi-chill-chill-560146.mp3' },
  { name: 'Mondamusic Lofi Girl Music', file: 'sounds/focus-music/mondamusic-lofi-lofi-girl-lofi-music-529555.mp3' },
  { name: 'Mondamusic Lofi Music', file: 'sounds/focus-music/mondamusic-lofi-lofi-music-529554.mp3' },
  { name: 'Mondamusic Lofi Music Chill', file: 'sounds/focus-music/mondamusic-lofi-lofi-music-lofi-chill-529558.mp3' },
  { name: 'Mondamusic Lofi Music Chill', file: 'sounds/focus-music/mondamusic-lofi-lofi-music-lofi-chill-560155.mp3' },
  { name: 'Prettyjohn1 Lofi Beats', file: 'sounds/focus-music/prettyjohn1-lofi-beats-524251.mp3' },
  { name: 'Prettyjohn1 Lofi Girl Music', file: 'sounds/focus-music/prettyjohn1-lofi-lofi-girl-lofi-music-533424.mp3' },
  { name: 'Prettyjohn1 Lofi Music', file: 'sounds/focus-music/prettyjohn1-lofi-lofi-music-523178.mp3' },
  { name: 'Prettyjohn1 Lofi Music', file: 'sounds/focus-music/prettyjohn1-lofi-lofi-music-525021.mp3' },
  { name: 'Prettyjohn1 Lofi Music', file: 'sounds/focus-music/prettyjohn1-lofi-lofi-music-533423.mp3' },
  { name: 'Pulsebox Lofi Night', file: 'sounds/focus-music/pulsebox-lofi-night-522890.mp3' },
  { name: 'Pulsebox Lofi Production', file: 'sounds/focus-music/pulsebox-lofi-production-522875.mp3' },
  { name: 'Solarflex Lofi Beats 2', file: 'sounds/focus-music/solarflex-lofi-beats-2-569541.mp3' },
  { name: 'Solarflex Lofi Beats', file: 'sounds/focus-music/solarflex-lofi-beats-541528.mp3' },
  { name: 'Solarflex Lofi Beats', file: 'sounds/focus-music/solarflex-lofi-beats-569580.mp3' },
  { name: 'Solarflex Lofi Hiphop', file: 'sounds/focus-music/solarflex-lofi-hiphop-569546.mp3' },
  { name: 'Solarflex Lofi Girl Chill 2', file: 'sounds/focus-music/solarflex-lofi-lofi-girl-lofi-chill-2-569524.mp3' },
  { name: 'Solarflex Lofi Girl Music', file: 'sounds/focus-music/solarflex-lofi-lofi-girl-lofi-music-541527.mp3' },
  { name: 'Solarflex Lofi Music Chill', file: 'sounds/focus-music/solarflex-lofi-lofi-music-lofi-chill-569582.mp3' },
  { name: 'The Mountain Lofi', file: 'sounds/focus-music/the_mountain-lofi-513863.mp3' },
  { name: 'The Mountain Lofi Beats', file: 'sounds/focus-music/the_mountain-lofi-beats-567433.mp3' },
  { name: 'The Mountain Lofi Music', file: 'sounds/focus-music/the_mountain-lofi-lofi-music-496553.mp3' },
  { name: 'Watermello Lofi Chill Girl', file: 'sounds/focus-music/watermello-lofi-chill-lofi-girl-lofi-488388.mp3' },
  { name: 'Watermello Lofi Girl Chill', file: 'sounds/focus-music/watermello-lofi-lofi-girl-lofi-chill-484610.mp3' }
];

const DEFAULT_WORK_BELL = WORK_BELL_SOUNDS[0].file;
const DEFAULT_BREAK_BELL = BREAK_BELL_SOUNDS[0].file;
const DEFAULT_FOCUS_MUSIC_ENABLED = true;
const DEFAULT_FOCUS_MUSIC_VOLUME = 0.5;

function soundUrl(path) {
  return chrome.runtime.getURL(path.split('/').map(encodeURIComponent).join('/'));
}
