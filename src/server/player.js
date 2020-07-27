// Done Modification. jc-hiroto 07/23 21:30.
const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');

class Player extends ObjectClass {
  constructor(id, username, x, y) {
    super(id, x, y, Math.random() * 2 * Math.PI, Constants.PLAYER_INIT_SPEED);
    if(username){
      this.username = username;
    }
    else{
      this.username = "Annoymous";
    }
    this.size = Constants.PLAYER_INIT_SIZE;
    this.boostCooldown = 0;
    this.score = 0;
    this.boostStartTime = 0;
    this.lostControlStartTime = 0;
    this.lastDropTimestamp = Date.now();
    this.vxdt = 0;
    this.vydt = 0;
    this.dt = 0;
    this.originalSpeed = Constants.PLAYER_INIT_SPEED;
    this.originalDir = 0;
    this.isDuringBoost = false;
    this.isDuringLostControl = false;
    this.mass = Math.pow(this.size,2);
  }

  // Returns a newly created bullet, or null.
  update(delta) {
    this.dt = delta;
    if(!this.isDuringBoost && !this.isDuringLostControl){
      this.speed = Constants.PLAYER_INIT_SPEED - this.size;
    }
    super.update(delta);
    this.boostHandler();
    this.lostControlHandler();
    // Update score
    this.size = this.score + Constants.PLAYER_INIT_SIZE;
    this.mass = Math.pow(this.size,2);

    // Make sure the player stays in bounds
    this.x = Math.max(0+this.size, Math.min(Constants.MAP_SIZE-this.size, this.x));
    this.y = Math.max(0+this.size, Math.min(Constants.MAP_SIZE-this.size, this.y));
  }

  getHitbyOthers() {
    this.score -= Constants.HIT_DAMAGE;
  }

  onSuckNewPart(part) {
      this.score += Constants.SUCK_ADDITION*part.size;
  }
  toggleBoost(){
    if(!this.isDuringBoost){
      this.isDuringBoost = true;
      this.boostStartTime = Date.now();
      this.setSpeed(this.speed + Constants.PLAYER_INIT_SIZE/this.size *Constants.PLAYER_BOOST_RATIO);
      this.score -= Constants.DROP_DECREASE;
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
    this.isDuringLostControl = true;
    this.isDuringBoost = false;
    this.lostControlStartTime = Date.now();
    this.originalDir = this.direction;
    //this.setSpeed(50);
  }
  lostControlHandler(){
    var progress = (Date.now() - this.lostControlStartTime)/Constants.PLAYER_LOST_CONTROL_DURATION;
    if(this.isDuringLostControl){
      if(Date.now() - this.lostControlStartTime >= Constants.PLAYER_LOST_CONTROL_DURATION){
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

          this.setDirection(this.direction+ (1-progress)*0.2);
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
      username: this.username,
      direction: this.direction,
      size: this.size,
      leftBoost: leftPercent,
    };
  }
}

module.exports = Player;
