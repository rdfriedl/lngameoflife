import "./components/app.js";
import { onFullUpdate, onPartialUpdate } from "./services/ws.js";
import { handleFullUpdate, handlePartialUpdate } from "./services/world.js";

onFullUpdate.add((buffer) => {
  handleFullUpdate(buffer);
});
onPartialUpdate.add(({ chunks, hash }) => {
  handlePartialUpdate(chunks, hash);
});
