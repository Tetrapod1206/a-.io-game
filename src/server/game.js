const Constants = require('../shared/constants');
const shortid = require('shortid');
const Player = require('./player');
const Part = require('./part');
const Collisions = require('./collisions');
const applyCollisions = Collisions.applyCollisions;
const applyPlayerCollisions = Collisions.applyPlayerCollisions;

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.parts = [];
    this.blocks = [];
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    this.randGenTimestamp = Date.now();
    this.lastDropTimestamp = Date.now();
    setInterval(this.update.bind(this), 1000 / 60);
    this.initParts();
  }

  initParts(){
    var randAmount = Math.floor(Math.random()*30)+30;
    for(var i = 0; i<randAmount; i++){
      var generatedPart = new Part("init",Math.floor(Math.random()*2900)+50 , Math.floor(Math.random()*2900)+50, 0,Math.floor(Math.random()*(Constants.MAX_PART_RATIO-1))+1);
      this.parts.push(generatedPart);
    }
  }
  randGenParts(){
    var regenRatio = 5*(1- (Math.abs(Constants.PART_AMOUNT_MAX - this.parts.length)/Constants.PART_AMOUNT_MAX));
    if(Date.now() - this.randGenTimestamp > Constants.PART_GEN_CD*regenRatio && this.parts.length <= Constants.PART_AMOUNT_MAX){
      this.randGenTimestamp = Date.now();
      var generatedPart = new Part("generator",Math.floor(Math.random()*2900)+50 , Math.floor(Math.random()*2900)+50, 0,Math.floor(Math.random()*(Constants.MAX_PART_RATIO-1))+1);
      this.parts.push(generatedPart);
    }
  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;
    // Generate a position to start this player at.
    const x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    this.players[socket.id] = new Player(socket.id, username, x, y);
  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  handleInput(socket, dir) {
    if (this.players[socket.id]) {
      if(this.players[socket.id].isDuringLostControl){
        dir = this.players[socket.id].direction;
      }
      this.players[socket.id].setDirection(dir);
    }
  }
  handleBoost(socket){
    if (this.players[socket.id] && this.players[socket.id].size >= (Constants.PLAYER_INIT_SIZE +Constants.DROP_DECREASE)) {
      var player = this.players[socket.id];
      var tempX = player.x;
      var tempY = player.y;
      var tempDir = player.direction;
      var boostCheck = this.players[socket.id].toggleBoost();
      if(boostCheck){
        const newPart = new Part(player.id, tempX+(Constants.BULLET_RADIUS+player.size+20)*Math.sin(tempDir+Math.PI), tempY-(Constants.BULLET_RADIUS+player.size+20)*Math.cos(tempDir+Math.PI), player.direction,Math.floor(Math.random()*(Constants.MAX_PART_RATIO-1))+1);
        this.parts.push(newPart);
      }
    }
  }
  handleCrashDrop(player){
    if(Date.now() - player.lastDropTimestamp > 5){
      player.lastDropTimestamp = Date.now();
      var dropAmount = Math.floor(Math.random()*(Constants.MAX_PART_RATIO-1))+1;
      const newPart = new Part(player.id, player.x+(Constants.BULLET_RADIUS+player.size+10)*Math.sin(player.direction+Math.PI), player.y+(Constants.BULLET_RADIUS+player.size+20)*Math.cos(player.direction+Math.PI), player.direction,dropAmount);
    console.log(newPart);
    this.parts.push(newPart);
    player.size -= dropAmount;
  }
  }

  update() {
    this.randGenParts();
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // Update each part
    const partsToRemove = [];
    this.parts.forEach(part => {
      if (part.update(dt)) {
        // Destroy this part
        partsToRemove.push(part);
      }
    });
    this.parts = this.parts.filter(part => !partsToRemove.includes(part));


    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      player.update(dt);
    });

    // Apply collisions, give players score for hitting parts
    var res = applyPlayerCollisions(Object.values(this.players));
    var isColl = res[0];
    if(isColl){
      this.handleCrashDrop(res[1]);
      this.handleCrashDrop(res[2]);
    }
    const destroyedParts = applyCollisions(Object.values(this.players), this.parts);

    this.parts = this.parts.filter(part => !destroyedParts.includes(part));

    // Check if any players are dead
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      if (player.size <= 0) {
        socket.emit(Constants.MSG_TYPES.GAME_OVER);
        this.removePlayer(socket);
      }
    });

    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      const leaderboard = this.getLeaderboard();
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, leaderboard));
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  getLeaderboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .slice(0, 5)
      .map(p => ({ username: p.username, score: Math.round(p.score) }));
  }

  createUpdate(player, leaderboard) {
    const nearbyPlayers = Object.values(this.players).filter(
      p => p !== player && p.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
    const nearbyBullets = this.parts.filter(
      b => b.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(o => o.serializeForUpdate()),
      parts: nearbyBullets.map(p => p.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
