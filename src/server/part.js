const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');
class Part extends ObjectClass {
  constructor(parentID,x, y, dir,size) {
    super(shortid(), x, y, dir, 0);
    this.parentID = parentID;
    this.size = size;
  }

  // Returns true if the bullet should be destroyed
  update(dt) {
    super.update(dt);
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
