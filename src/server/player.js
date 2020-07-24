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
    this.score = this.size - Constants.PLAYER_INIT_SIZE;
    this.boostStartTime = 0;
    this.originalSpeed = 0;
    this.isDuringBoost = false;
  }

  // Returns a newly created bullet, or null.
  update(dt) {
    super.update(dt);
    this.boostHandler();
    // Update score
    this.score = this.size - Constants.PLAYER_INIT_SIZE;

    // Make sure the player stays in bounds
    this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x));
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));
  }

  getHitbyOthers() {
    this.size -= Constants.HIT_DAMAGE;
  }

  onSuckNewPart() {
    this.size += Constants.SUCK_ADDITION;
  }
  toggleBoost(){
    if(!this.isDuringBoost){
      this.isDuringBoost = true;
      this.boostStartTime = Date.now();
      this.originalSpeed = this.speed;
      this.setSpeed(this.speed * Constants.PLAYER_BOOST_RATIO);
      this.size -= Constants.DROP_DECREASE;
    }
  }
  boostHandler(){
    if(this.isDuringBoost){
      if(Date.now() - this.boostStartTime > Constants.PLAYER_BOOST_DURATION){
        this.boostStartTime = 0;
        this.isDuringBoost = false;
        for(var i = this.originalSpeed*Constants.PLAYER_BOOST_RATIO;i>this.originalSpeed;i--){
          this.setSpeed(this.originalSpeed);
        }
      }
    }
  }
  serializeForUpdate() {
    var leftPercent = 0;
    if(this.isDuringBoost){
      leftPercent = ((Constants.PLAYER_BOOST_DURATION - (Date.now() - this.boostStartTime))/Constants.PLAYER_BOOST_DURATION)*100;
    }
    else{
      leftPercent = 0;
    }

    return {
      ...(super.serializeForUpdate()),
      direction: this.direction,
      size: this.size,
      leftBoost: leftPercent,
    };
  }
}

module.exports = Player;
