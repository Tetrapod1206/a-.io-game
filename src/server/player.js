// Done Modification. jc-hiroto 07/23 21:30.
const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');

class Player extends ObjectClass {
  constructor(id, username, x, y) {
    super(id, x, y, Math.random() * 2 * Math.PI, Constants.PLAYER_INIT_SPEED);
    this.username = username;
    this.size = Constants.PLAYER_INIT_SIZE;
    this.boostCooldown = 0;
    this.score = 0;
  }

  // Returns a newly created bullet, or null.
  update(dt) {
    super.update(dt);

    // Update score
    this.score += dt * Constants.SCORE_PER_SECOND;

    // Make sure the player stays in bounds
    this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x));
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));

    // Fire a bullet, if needed
    this.boostCooldown -= dt;
    if (this.boostCooldown <= 0) {
      this.boostCooldown += Constants.PLAYER_BOOST_COOLDOWN;
      // speed boost code here.
      return new Bullet(this.id, this.x, this.y, this.direction);
    }

    return null;
  }

  getHitbyOthers() {
    this.size -= Constants.HIT_DAMAGE;
  }

  onSuckNewPart() {
    this.size += Constants.SUCK_ADDITION;
    this.score += Constants.SCORE_SUCK;
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      direction: this.direction,
      size: this.size,
    };
  }
}

module.exports = Player;
