import { CellMap } from "../../common/cell-map.js";
import { GameOfLife } from "../../common/game-of-life.js";
import { MAP_SIZE } from "../../common/size.js";
import { Emitter } from "../helpers/emitter.js";
import SparkMD5 from "spark-md5";
import { sendMessage } from "./ws.js";

export const onUpdate = new Emitter();

const game = new GameOfLife(MAP_SIZE.WIDTH, MAP_SIZE.HEIGHT);
const pending = new CellMap(MAP_SIZE.WIDTH, MAP_SIZE.HEIGHT);

export function getGame() {
  return game;
}
export function getPending() {
  return pending;
}

export function handlePartialUpdate(chunks, hash) {
  for (const [cx, cy, value] of chunks) {
    game.setChunk(cx, cy, value);
  }
  const gameHash = SparkMD5.ArrayBuffer.hash(game.buffer);
  if (gameHash !== hash) {
    console.log("Out of sync, requesting full update");
    sendMessage("request-full-update");
  }
  onUpdate.emit(game);
}

export function handleFullUpdate(buffer) {
  game.replaceBuffer(buffer);
  game.requestFullMapUpdate();
  onUpdate.emit(game);
}
