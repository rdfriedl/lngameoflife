import "./components/app.js";
import { onFullUpdate, onTick } from "./services/ws.js";
import { handleFullUpdate, handleTickUpdate } from "./services/world.js";

onFullUpdate.add((buffer) => {
  handleFullUpdate(buffer);
});
onTick.add((hash) => {
  handleTickUpdate(hash);
});
