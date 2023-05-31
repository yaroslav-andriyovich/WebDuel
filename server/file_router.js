const express = require("express");
const app = express();
const path = require("path");
const port = 3000;

app.use(express.static(path.join(__dirname + "/../client/")));

app.get("/", (req, res) =>
{
  res.sendFile(path.join(__dirname + "/../client/html/index.html"));
});

app.listen(port, () =>
{
  console.log(`Router started and listening on port ${port}.`);
});