import { CellMap } from "../../common/cell-map.js";
import { Emitter } from "../helpers/emitter.js";

export const onUpdate = new Emitter();

let pending = null;
let map = null;
export function resize(width, height) {
  map = new CellMap(width, height);
  pending = new CellMap(width, height);
}
export function getMap() {
  return map;
}
export function getPending() {
  return pending;
}

export function updateFromBuffer(buffer) {
  if (map) {
    map.replaceBuffer(buffer);
    onUpdate.emit(map);
  }
}
