const ObjectClass = require('./object');
const Constants = require('../shared/constants');
class Part extends ObjectClass {
  constructor(x, y, dir) {
    super(shortid(), x, y, dir, 0);
    this.parentID = parentID;
  }

  // Returns true if the bullet should be destroyed
  update(dt) {
    super.update(dt);
    return false;
  }
}

module.exports = Part;
