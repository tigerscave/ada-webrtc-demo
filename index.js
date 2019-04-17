const express = require("express");
const http = require("http");
const PORT = process.env.PORT || 5355;
const app = express();
app.use(express.static("src"));
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log("listening on PORT :", PORT);
});