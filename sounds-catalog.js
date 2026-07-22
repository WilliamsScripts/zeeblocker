const WORK_BELL_SOUNDS = [
  { name: 'School Bell', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696362/zeeblocker/time-up/universfield-school-bell_fkqc6e.mp3' },
  { name: 'School Bell (Alt)', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696362/zeeblocker/time-up/universfield-school-bell_fkqc6e.mp3' },
  { name: 'Copper Bell Ding', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696396/zeeblocker/break/pietix-short-ui-break-6_eejm4j.mp3' },
  { name: 'Casual Click Pop', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696395/zeeblocker/break/freesound_community-slow-piano-pause-sound_cirny1.mp3' },
  { name: 'Short UI Break', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696395/zeeblocker/break/floraphonic-copper-bell-ding-25_uelqst.mp3' },
  { name: 'Slow Piano Pause', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696394/zeeblocker/break/floraphonic-casual-click-pop-ui-4_iixc88.mp3' },
];

const BREAK_BELL_SOUNDS = [
  { name: 'Copper Bell Ding', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696396/zeeblocker/break/pietix-short-ui-break-6_eejm4j.mp3' },
  { name: 'Casual Click Pop', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696395/zeeblocker/break/freesound_community-slow-piano-pause-sound_cirny1.mp3' },
  { name: 'Short UI Break', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696395/zeeblocker/break/floraphonic-copper-bell-ding-25_uelqst.mp3' },
  { name: 'Slow Piano Pause', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696394/zeeblocker/break/floraphonic-casual-click-pop-ui-4_iixc88.mp3' },
  { name: 'School Bell', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696362/zeeblocker/time-up/universfield-school-bell_fkqc6e.mp3' },
  { name: 'School Bell (Alt)', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784696362/zeeblocker/time-up/universfield-school-bell_fkqc6e.mp3' },
];

// All bell sounds in one deduplicated list (by file), for pickers that aren't
// specifically "work" or "break" — e.g. the idle alert.
const IDLE_ALERT_SOUNDS = [...WORK_BELL_SOUNDS, ...BREAK_BELL_SOUNDS].filter(
  (sound, index, all) => all.findIndex(s => s.file === sound.file) === index
);

const FOCUS_MUSIC_TRACKS = [
  // { name: 'Lofi Music', file: 'sounds/focus-music/Lofi Music.webm' },
  // { name: 'Lofi Music 2', file: 'sounds/focus-music/lofi 2.webm' },
  { name: 'Lofi beat', file: 'sounds/focus-music/mirostar-lofi-beats-531504.mp3' },
  { name: 'Alex Morgan Corporate Lofi Flute Presentation', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698488/zeeblocker/focus-music/alex-morgan-corporate-lofi-flute-presentation-560069_amsfqy.mp3' },
  { name: 'Alex Morgan Corporate Lofi Groove Advertising', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698498/zeeblocker/focus-music/alex-morgan-corporate-lofi-groove-advertising-560068_ntbc17.mp3' },
  { name: 'Alex Morgan Lofi Cocktail Bar', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698490/zeeblocker/focus-music/alex-morgan-lofi-cocktail-bar-568153_sqeh6d.mp3' },
  { name: 'Alex Morgan Lofi Coffee Shop', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698492/zeeblocker/focus-music/alex-morgan-lofi-coffee-shop-568150_qtlzfc.mp3' },
  { name: 'Alex Morgan Lofi Hip Hop Funky Midnight Club', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698495/zeeblocker/focus-music/alex-morgan-lofi-hip-hop-funky-midnight-club-560062_qfl7s2.mp3' },
  { name: 'Alex Morgan Lofi Hip Hop Rhythm Rainy Night', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698492/zeeblocker/focus-music/alex-morgan-lofi-hip-hop-rhythm-rainy-night-560050_odqnvd.mp3' },
  { name: 'Alex Morgan Lofi Jazz Melody Restaurant', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698495/zeeblocker/focus-music/alex-morgan-lofi-jazz-melody-restaurant-560048_jlcudf.mp3' },
  { name: 'Alex Morgan Lofi Jazz Soulful Midnight Club', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698496/zeeblocker/focus-music/alex-morgan-lofi-jazz-soulful-midnight-club-560063_vnpmoc.mp3' },
  { name: 'Alex Morgan Lofi Jazz Trio Sunny Cafe', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698497/zeeblocker/focus-music/alex-morgan-lofi-jazz-trio-sunny-cafe-560051_t7ht4t.mp3' },
  { name: 'Alex Morgan Lofi Midnight Club', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698499/zeeblocker/focus-music/alex-morgan-lofi-midnight-club-568164_ndhvrp.mp3' },
  { name: 'Alex Morgan Lofi Restaurant', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698498/zeeblocker/focus-music/alex-morgan-lofi-restaurant-568157_knhi8w.mp3' },
  { name: 'Alex Morgan Lofi Study Session', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698501/zeeblocker/focus-music/alex-morgan-lofi-study-session-568160_gphkbb.mp3' },
  { name: 'Alex Morgan Lofi Sunny Cafe', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698500/zeeblocker/focus-music/alex-morgan-lofi-sunny-cafe-568156_xsx0w9.mp3' },
  { name: 'Apalonbeats Lofi Background Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698507/zeeblocker/focus-music/apalonbeats-lofi-background-music-560408_ssjehq.mp3' },
  { name: 'Apalonbeats Lofi Beats Study', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698505/zeeblocker/focus-music/apalonbeats-lofi-beats-lofi-study-560413_dfppru.mp3' },
  { name: 'Apalonbeats Lofi Hiphop', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698503/zeeblocker/focus-music/apalonbeats-lofi-hiphop-560424_wj3mkq.mp3' },
  { name: 'Apalonbeats Lofi Music 2', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698507/zeeblocker/focus-music/apalonbeats-lofi-lofi-music-2-566602_xukx1c.mp3' },
  { name: 'Apalonbeats Lofi Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698506/zeeblocker/focus-music/apalonbeats-lofi-lofi-music-549425_zebjik.mp3' },
  { name: 'Apalonbeats Lofi Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698508/zeeblocker/focus-music/apalonbeats-lofi-lofi-music-549461_lb05ok.mp3' },
  { name: 'Apalonbeats Lofi Music Chill 2', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698508/zeeblocker/focus-music/apalonbeats-lofi-lofi-music-lofi-chill-2-560425_e86yqr.mp3' },
  { name: 'Apalonbeats Sad Lofi', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698509/zeeblocker/focus-music/apalonbeats-sad-lofi-560422_q82owk.mp3' },
  { name: 'Arpmedia Lofi Hiphop', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698510/zeeblocker/focus-music/arpmedia-lofi-hiphop-561568_rcxw3l.mp3' },
  { name: 'Arpmedia Lofi Hiphop', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698511/zeeblocker/focus-music/arpmedia-lofi-hiphop-561587_rwvj3v.mp3' },
  { name: 'Arpmedia Lofi Music 2', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698513/zeeblocker/focus-music/arpmedia-lofi-lofi-music-2-569464_r4f8yz.mp3' },
  { name: 'Fassounds Good Night Lofi Cozy Chill Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698514/zeeblocker/focus-music/fassounds-good-night-lofi-cozy-chill-music-160166_1_pip9jc.mp3' },
  { name: 'Fassounds Lofi Study Calm Peaceful Chill Hop', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698517/zeeblocker/focus-music/fassounds-lofi-study-calm-peaceful-chill-hop-112191_dym82i.mp3' },
  { name: 'Leberch Lofi Hip Hop', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698517/zeeblocker/focus-music/leberch-lofi-hip-hop-519408_e7lepe.mp3' },
  { name: 'Mirostar Lofi Girl Chill 2', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698519/zeeblocker/focus-music/mirostar-lofi-lofi-girl-lofi-chill-2-531491_hdam9s.mp3' },
  { name: 'Mirostar Lofi Girl Chill 2', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698520/zeeblocker/focus-music/mirostar-lofi-lofi-girl-lofi-chill-2-560285_alxbhi.mp3' },
  { name: 'Mirostar Lofi Music 2', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698524/zeeblocker/focus-music/mirostar-lofi-lofi-music-2-560297_p9e2ho.mp3' },
  { name: 'Mirostar Lofi Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698522/zeeblocker/focus-music/mirostar-lofi-lofi-music-531487_tmbi6u.mp3' },
  { name: 'Mirostar Lofi Music Chill', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698524/zeeblocker/focus-music/mirostar-lofi-lofi-music-lofi-chill-560327_keriz1.mp3' },
  { name: 'Mirostar Sad Lofi', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698524/zeeblocker/focus-music/mirostar-sad-lofi-560303_so5tfj.mp3' },
  { name: 'Mirostar Study Lofi Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698526/zeeblocker/focus-music/mirostar-study-lofi-music-560307_tyyevj.mp3' },
  { name: 'Mondamusic Lofi Chill', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698527/zeeblocker/focus-music/mondamusic-lofi-chill-chill-560146_rdjgfo.mp3' },
  { name: 'Mondamusic Lofi Girl Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698528/zeeblocker/focus-music/mondamusic-lofi-lofi-girl-lofi-music-529555_htzhuy.mp3' },
  { name: 'Mondamusic Lofi Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698529/zeeblocker/focus-music/mondamusic-lofi-lofi-music-529554_dmtsr8.mp3' },
  { name: 'Mondamusic Lofi Music Chill', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698532/zeeblocker/focus-music/mondamusic-lofi-lofi-music-lofi-chill-529558_fst6sd.mp3' },
  { name: 'Mondamusic Lofi Music Chill', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698532/zeeblocker/focus-music/mondamusic-lofi-lofi-music-lofi-chill-560155_o5bxgx.mp3' },
  { name: 'Prettyjohn1 Lofi Beats', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698534/zeeblocker/focus-music/prettyjohn1-lofi-beats-524251_pj2rfx.mp3' },
  { name: 'Prettyjohn1 Lofi Girl Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698534/zeeblocker/focus-music/prettyjohn1-lofi-lofi-girl-lofi-music-533424_sl78xd.mp3' },
  { name: 'Prettyjohn1 Lofi Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698535/zeeblocker/focus-music/prettyjohn1-lofi-lofi-music-523178_aisw0g.mp3' },
  { name: 'Prettyjohn1 Lofi Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698537/zeeblocker/focus-music/prettyjohn1-lofi-lofi-music-525021_nhaq2o.mp3' },
  { name: 'Prettyjohn1 Lofi Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698537/zeeblocker/focus-music/prettyjohn1-lofi-lofi-music-533423_b66ip5.mp3' },
  { name: 'Pulsebox Lofi Night', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698539/zeeblocker/focus-music/pulsebox-lofi-night-522890_pvv8ow.mp3' },
  { name: 'Pulsebox Lofi Production', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698539/zeeblocker/focus-music/pulsebox-lofi-production-522875_d4hnfp.mp3' },
  { name: 'Solarflex Lofi Beats 2', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698541/zeeblocker/focus-music/solarflex-lofi-beats-2-569541_mpvkdu.mp3' },
  { name: 'Solarflex Lofi Beats', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698542/zeeblocker/focus-music/solarflex-lofi-beats-541528_cfpfgl.mp3' },
  { name: 'Solarflex Lofi Beats', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698543/zeeblocker/focus-music/solarflex-lofi-beats-569580_tl7qjj.mp3' },
  { name: 'Solarflex Lofi Hiphop', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698544/zeeblocker/focus-music/solarflex-lofi-hiphop-569546_uxo0ae.mp3' },
  { name: 'Solarflex Lofi Girl Chill 2', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698546/zeeblocker/focus-music/solarflex-lofi-lofi-girl-lofi-chill-2-569524_brq0sn.mp3' },
  { name: 'Solarflex Lofi Girl Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698548/zeeblocker/focus-music/solarflex-lofi-lofi-music-lofi-chill-569582_tc3jmi.mp3' },
  { name: 'Solarflex Lofi Music Chill', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698548/zeeblocker/focus-music/solarflex-lofi-lofi-music-lofi-chill-569582_tc3jmi.mp3' },
  { name: 'The Mountain Lofi', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698549/zeeblocker/focus-music/the_mountain-lofi-513863_reluoh.mp3' },
  { name: 'The Mountain Lofi Beats', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698551/zeeblocker/focus-music/the_mountain-lofi-beats-567433_uzvsit.mp3' },
  { name: 'The Mountain Lofi Music', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698552/zeeblocker/focus-music/the_mountain-lofi-lofi-music-496553_mykbol.mp3' },
  { name: 'Watermello Lofi Chill Girl', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698553/zeeblocker/focus-music/watermello-lofi-chill-lofi-girl-lofi-488388_ifnrbx.mp3' },
  { name: 'Watermello Lofi Girl Chill', file: 'https://res.cloudinary.com/dggkilsor/video/upload/v1784698554/zeeblocker/focus-music/watermello-lofi-lofi-girl-lofi-chill-484610_r4uy6x.mp3' }
];

const DEFAULT_WORK_BELL = WORK_BELL_SOUNDS[0].file;
const DEFAULT_BREAK_BELL = BREAK_BELL_SOUNDS[0].file;
const DEFAULT_FOCUS_MUSIC_ENABLED = true;
const DEFAULT_FOCUS_MUSIC_VOLUME = 0.5;
const DEFAULT_IDLE_ALERT_BELL_MODE = 'continuous';
// Defaults to the same sound as the focus/"time's up" bell.
const DEFAULT_IDLE_ALERT_SOUND = DEFAULT_WORK_BELL;

function soundUrl(path) {
  // Some tracks now point straight at a CDN (https://...) instead of a bundled local
  // file — chrome.runtime.getURL() doesn't recognize absolute URLs, it just tacks the
  // extension origin on the front, so those must be returned as-is.
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return chrome.runtime.getURL(path.split('/').map(encodeURIComponent).join('/'));
}
