const Constants = require('../shared/constants');

// Returns an array of bullets to be destroyed.
function applyCollisions(players, bullets) {
  const destroyedBullets = [];
  for (let i = 0; i < bullets.length; i++) {
    // Look for a player (who didn't create the part) to collide each part with.
    // As soon as we find one, break out of the loop to prevent double counting a part.
    for (let j = 0; j < players.length; j++) {
      const part = bullets[i];
      const player = players[j];
      if (
        player.distanceTo(part) <= player.size + Constants.BULLET_RADIUS
      ) {
        destroyedBullets.push(part);
        player.onSuckNewPart();
        break;
      }
    }
  }
  return destroyedBullets;
}

function applyPlayerCollisions(players){
  for(let i = 0; i < players.length ; i++){
    for (let j = 0; j < players.length; j++) {
      const playerI = players[i];
      const playerJ = players[j];
      if (
        playerI.distanceTo(playerJ) <= playerI.size + playerJ.size
      ) {
        console.log("contact!");
        console.log(playerI);
        console.log(playerJ);
      }
    }
  }
}

module.exports = applyCollisions;
