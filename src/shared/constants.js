module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_INIT_SIZE: 50,
  PLAYER_MAX_SIZE: 300,
  PLAYER_INIT_SPEED: 200,
  PLAYER_BOOST_COOLDOWN: 0.25,
  PLAYER_BOOST_RATIO: 4,
  PLAYER_BOOST_DURATION: 1000,

  SUCK_ADDITION: 1,
  DROP_DECREASE: 5,
  HIT_DAMAGE: 10,
  BULLET_RADIUS: 10,

  SCORE_SUCK: 5,
  SCORE_PER_SECOND: 1,

  PART_GEN_CD: 5000,
  PART_AMOUNT_MAX: 60,

  MAP_SIZE: 3000,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    GAME_OVER: 'dead',
    TRIG_BOOST: 'trigger boost',
  },
});
