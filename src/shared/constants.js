module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_INIT_SIZE: 50,
  PLAYER_INIT_SPEED: 200,
  PLAYER_BOOST_COOLDOWN: 0.25,
  PLAYER_BOOST_AMOUNT: 50,

  SUCK_ADDITION: 10,
  HIT_DAMAGE: 10,
  BULLET_RADIUS: 3,

  SCORE_SUCK: 20,
  SCORE_PER_SECOND: 1,

  MAP_SIZE: 3000,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    GAME_OVER: 'dead',
    TRIG_BOOST: 'trigger boost',
  },
});
