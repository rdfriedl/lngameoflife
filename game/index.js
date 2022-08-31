import "./components/app.js";
import { onGeneration, onInfo } from "./services/ws.js";
import { resize, updateFromBuffer } from "./services/world.js";

onGeneration.add((buffer) => {
  updateFromBuffer(buffer);
});
onInfo.add((info) => {
  resize(info.width, info.height);
});
