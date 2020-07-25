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
    this.lostControlStartTime = 0;
    this.vxdt = 0;
    this.vydt = 0;
    this.dt = 0;
    this.originalSpeed = Constants.PLAYER_INIT_SPEED;
    this.originalDir = 0;
    this.isDuringBoost = false;
    this.isDuringLostControl = false;
    this.mass = this.size;
  }

  // Returns a newly created bullet, or null.
  update(delta) {
    this.dt = delta;
    super.update(delta);
    this.boostHandler();
    this.lostControlHandler();
    // Update score
    this.score = this.size - Constants.PLAYER_INIT_SIZE;
    this.mass = this.size;

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
      this.setSpeed(this.speed * Constants.PLAYER_BOOST_RATIO);
      this.size -= Constants.DROP_DECREASE;
      return true;
    }
    return false;
  }
  boostHandler(){
    if(this.isDuringBoost){
      if(Date.now() - this.boostStartTime > Constants.PLAYER_BOOST_DURATION){
        this.boostStartTime = 0;
        this.isDuringBoost = false;
        for(var i = this.originalSpeed*Constants.PLAYER_BOOST_RATIO;i>this.originalSpeed;i--){
          this.setSpeed(i);
        }
      }
    }
  }
  collisionHandler(speed,dir){
    this.vxdt = speed*Math.sin(dir);
    this.vydt = speed*Math.cos(dir);
    console.log(this.vxdt);
    console.log(this.vydt);
    this.isDuringLostControl = true;
    this.isDuringBoost = false;
    this.lostControlStartTime = Date.now();
    this.originalDir = this.direction;
    this.setSpeed(0);

    //this.setDirection(dir);
  }
  lostControlHandler(){
    var progress = (Date.now() - this.lostControlStartTime)/Constants.PLAYER_LOST_CONTROL_DURATION;
    if(this.isDuringLostControl){
      if(Date.now() - this.lostControlStartTime >= Constants.PLAYER_LOST_CONTROL_DURATION){
        console.log('lostEND');
        this.lostControlStartTime = 0;
        this.isDuringLostControl = false;
        if(this.speed <= this.originalSpeed){
          for(var i = this.speed;i<this.originalSpeed;i++){
            this.setSpeed(i);
          }
        }
        else{
          if(this.speed > this.originalSpeed){
            for(var i = this.speed;i<this.originalSpeed;i--){
              this.setSpeed(i);
            }
          }
        }
        this.setDirection(this.originalDir);
      }
      else{
        this.setX(this.x + this.vxdt * (1-progress)*this.dt);
        this.setY(this.y + this.vydt * (1-progress)*this.dt);
        if(this.direction >= 2*Math.PI){
          this.setDirection(0);
        }
        else{

          //this.setDirection(this.direction+ (1-progress));
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
