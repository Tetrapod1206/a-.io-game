// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
//CHECKED
import { updateDirection } from './networking';
import { triggerBoost } from './networking';

function onMouseInput(e) {
  handleInput(e.clientX, e.clientY);
}

function onTouchInput(e) {
  const touch = e.touches[0];
  handleInput(touch.clientX, touch.clientY);
}
function onKeyInput(e){
  if(e.keyCode == 32){
    triggerBoost();
  }
}

var mylatesttap;
function doubleTap(e) {

   var now = new Date().getTime();
   var timesince = now - mylatesttap;
   if((timesince < 600) && (timesince > 0)){

    triggerBoost();

   }
   else{
      onTouchInput(e);
  }

   mylatesttap = new Date().getTime();

}

function handleInput(x, y) {
  const dir = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
  updateDirection(dir);
}

export function startCapturingInput() {
  window.addEventListener('mousemove', onMouseInput);
  window.addEventListener('click', onMouseInput);
  window.addEventListener('touchstart', doubleTap);
  window.addEventListener('touchmove', onTouchInput);
  window.addEventListener('keypress', onKeyInput);
}

export function stopCapturingInput() {
  window.removeEventListener('mousemove', onMouseInput);
  window.removeEventListener('click', onMouseInput);
  window.removeEventListener('touchstart', doubleTap);
  window.removeEventListener('touchmove', onTouchInput);
  window.removeEventListener('keypress', onKeyInput);
}
