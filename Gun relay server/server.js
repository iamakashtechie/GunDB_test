import http from "http";
import Gun from "gun";

const server = http.createServer();
Gun({ web: server });

server.listen(process.env.PORT || 8765, () => {
  console.log("Gun relay running on http://localhost:" + (process.env.PORT || 8765) + "/gun");
});
export default server;