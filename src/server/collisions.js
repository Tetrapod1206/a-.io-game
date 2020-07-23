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
        part.parentID !== player.id &&
        player.distanceTo(part) <= Constants.PLAYER_RADIUS + Constants.BULLET_RADIUS
      ) {
        destroyedBullets.push(part);
        player.onSuckNewPart();
        break;
      }
    }
  }
  return destroyedBullets;
}

module.exports = applyCollisions;
