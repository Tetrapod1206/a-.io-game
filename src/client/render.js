// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { debounce } from 'throttle-debounce';
import { getAsset } from './assets';
import { getCurrentState } from './state';

const Constants = require('../shared/constants');

const { PLAYER_RADIUS, PLAYER_MAX_HP, BULLET_RADIUS, MAP_SIZE } = Constants;

// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
var targetCanvasRatio = 0;
var currentCanvasRatio = 0;
var scaleRatio = 0;
initCanvasDimensions();

function initCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  scaleRatio = Math.max(1, 800 / window.innerWidth);
  targetCanvasRatio = scaleRatio;
  currentCanvasRatio = scaleRatio;
  console.log(scaleRatio);
  canvas.width = scaleRatio * window.innerWidth;
  canvas.height = scaleRatio * window.innerHeight;
}

function setCanvasDimensions(scaleRatio){
  currentCanvasRatio = scaleRatio;
  console.log(scaleRatio);
  canvas.width = scaleRatio * window.innerWidth;
  canvas.height = scaleRatio * window.innerHeight;
}

window.addEventListener('resize', debounce(40, initCanvasDimensions));

function render() {
  const { me, others, parts } = getCurrentState();
  if (!me) {
    return;
  }

  //resize accroding to player size
  targetCanvasRatio = Math.max(1, (800+1000*(Math.floor(me.size/Constants.CANVAS_ENLARGE_SIZE)))/window.innerWidth);
  if(targetCanvasRatio > currentCanvasRatio + Constants.CANVAS_ENLARGE_SPEED){
    setCanvasDimensions(currentCanvasRatio + Constants.CANVAS_ENLARGE_SPEED);
  }
  else if(targetCanvasRatio < currentCanvasRatio - Constants.CANVAS_ENLARGE_SPEED){
    setCanvasDimensions(currentCanvasRatio - Constants.CANVAS_ENLARGE_SPEED);
  }

  // Draw background
  renderBackground(me.x, me.y);

  // Draw boundaries
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(canvas.width / 2 - me.x, canvas.height / 2 - me.y, MAP_SIZE, MAP_SIZE);

  // Draw all bullets
  parts.forEach(renderPart.bind(null, me));

  // Draw all players
  renderPlayer(me, me);
  others.forEach(renderPlayer.bind(null, me));
  others.forEach(renderArrow.bind(null, me));
}



function renderBackground(x, y) {
  const backgroundX = MAP_SIZE / 2 - x + canvas.width / 2;
  const backgroundY = MAP_SIZE / 2 - y + canvas.height / 2;
  const backgroundGradient = context.createRadialGradient(
    backgroundX,
    backgroundY,
    MAP_SIZE / 10,
    backgroundX,
    backgroundY,
    MAP_SIZE / 2,
  );
  backgroundGradient.addColorStop(0, 'white');
  backgroundGradient.addColorStop(1, 'gray');
  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function renderArrow(me, player){
  const { x, y} = player;
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;
    context.translate(0,0);
    if(me.y > player.y && me.y - player.y > canvas.height / 2){
      context.drawImage(
      getAsset('arrow_up.svg'),
      -(me.x - player.x)/(scaleRatio*5) + canvasX ,
      10,
      20,
      20,
    );
    }
    if(me.y < player.y && player.y - me.y > canvas.height / 2){
      context.save();
      context.drawImage(
      getAsset('arrow_down.svg'),
      -(player.x- me.x)/(scaleRatio*5) + canvasX ,
      canvas.height - 30,
      20,
      20,
    );
    }
    if(me.x > player.x && me.x - player.x > canvas.width / 2){
      context.save();
      context.drawImage(
      getAsset('arrow_left.svg'),
      10,
      -(me.y- player.y)/(scaleRatio*5) + canvasY,
      20,
      20,
    );
    }
    if(me.x < player.x && player.x - me.x > canvas.width / 2){
      context.save();
      context.drawImage(
      getAsset('arrow_right.svg'),
      canvas.width -30,
      -(player.y- me.y)/(scaleRatio*5) + canvasY,
      20,
      20,
    );
    }

  context.restore();
}
// Renders a ship at the given coordinates
function renderPlayer(me, player) {
  const { x, y, username, direction,size,leftBoost} = player;
  var dispName = username.slice(0, username.length-3);
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;
  // Draw ship
  context.save();
  context.translate(canvasX, canvasY);
  context.rotate(direction);
  context.drawImage(
    getAsset('car_new.svg'),
    -size,
    -size,
    size*2,
    size*2,
  );
  context.restore();

  // Draw boost duration bar.
  context.fillStyle = 'black';
  context.font = "16px Arial";
  context.fillText(dispName, canvasX-4*(dispName.length), canvasY - size - 16);
  if(leftBoost != 0){
    context.fillStyle = 'grey';
    context.fillRect(
      canvasX - size,
      canvasY + size + 16,
      size*2,
      4,
    );
    context.fillStyle = 'white';
    context.fillRect(
      canvasX - size,
      canvasY + size + 16,
      size*2  * leftBoost/100,
      4,
    );
  }
}

function renderPart(me, bullet) {
  const { x, y,size} = bullet;
  context.drawImage(
    getAsset('part.svg'),
    canvas.width / 2 + x - me.x - BULLET_RADIUS*size*0.5,
    canvas.height / 2 + y - me.y - BULLET_RADIUS*size*0.5,
    BULLET_RADIUS  * size,
    BULLET_RADIUS  * size,
  );
}

function renderMainMenu() {
  const t = Date.now() / 7500;
  const x = MAP_SIZE / 2 + 800 * Math.cos(t);
  const y = MAP_SIZE / 2 + 800 * Math.sin(t);
  renderBackground(x, y);
}

let renderInterval = setInterval(renderMainMenu, 1000 / 60);

// Replaces main menu rendering with game rendering.
export function startRendering() {
  clearInterval(renderInterval);
  renderInterval = setInterval(render, 1000 / 60);
}

// Replaces game rendering with main menu rendering.
export function stopRendering() {
  clearInterval(renderInterval);
  renderInterval = setInterval(renderMainMenu, 1000 / 60);
}
