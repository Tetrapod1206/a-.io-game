const Constants = require('../shared/constants');
const Game = require('./game');

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
        player.distanceTo(part) <= player.size + Constants.BULLET_RADIUS*part.size*0.5 - player.size/4) {
        destroyedBullets.push(part);
        player.onSuckNewPart(part);
        break;
      }
    }
  }
  return destroyedBullets;
}

function applyPlayerCollisions(players){
  for(let i = 0; i < players.length ; i++){
    for (let j = i+1; j < players.length; j++) {
      const playerI = players[i];
      const playerJ = players[j];
      if (
        playerI.distanceTo(playerJ) <= playerI.size + playerJ.size
      ) {
        collisionComp(playerI,playerJ);
        return [true,playerI,playerJ];
      }

    }
  }
  return [false,null,null];
}

function collisionComp(playerI , playerJ){
  if(playerI.isDuringLostControl == false || playerJ.isDuringLostControl == false){
    xSpeeds = oneDimensionCollision(playerI.speed * Math.sin(playerI.direction) , playerI.mass , playerJ.speed * Math.sin(playerJ.direction) , playerJ.mass );
    ySpeeds = oneDimensionCollision(playerI.speed * Math.cos(playerI.direction) , playerI.mass , playerJ.speed * Math.cos(playerJ.direction) , playerJ.mass );
    playerI.collisionHandler(Math.sqrt(Math.pow(xSpeeds[0],2)+Math.pow(ySpeeds[0],2)),Math.atan2(xSpeeds[0],ySpeeds[0]));
    playerJ.collisionHandler(Math.sqrt(Math.pow(xSpeeds[1],2)+Math.pow(ySpeeds[1],2)),Math.atan2(xSpeeds[1],ySpeeds[1]));
  }

}

function oneDimensionCollision(speedI,massI,speedJ,massJ){
  console.log(massI);
  return [(speedI * (massI - massJ) + 2 * massJ * speedJ) / (massI + massJ) , (speedJ * (massJ - massI) + 2 * massI * speedI) / (massI + massJ)]
}

module.exports = {applyCollisions,applyPlayerCollisions};
