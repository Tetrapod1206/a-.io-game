const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');
const constants = require('../shared/constants');
class Part extends ObjectClass {

  constructor(parentID,x, y, dir,size,crashPart) {
    var speed = 0;
    if(crashPart){
      speed = constants.PART_FLY_SPEED;
    }
    super(shortid(), x, y, dir, speed);
    this.parentID = parentID;
    this.size = size;
    this.generateTime = Date.now();
    this.isHot = crashPart;
  }

  // Returns true if the bullet should be destroyed
  update(dt) {
    super.update(dt);
    if(this.isHot){
      if(Date.now() - this.generateTime > constants.PART_COOLDOWN_TIME * this.size){
        this.isHot = false;
        this.setSpeed(0);
      }
      else{
        this.setSpeed( (Date.now() - this.generateTime)/constants.PART_COOLDOWN_TIME * constants.PART_FLY_SPEED )
      }
    }
    return this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE;
  }
  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      size: this.size,
    };
  }
}

module.exports = Part;
