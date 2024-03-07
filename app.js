require("dotenv").config();
const express = require("express");
const app = express();

const cors = require("cors");
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

const connect = require("./lib/connect");
const { getProducts } = require("./controller/productController");
const {} = require("./controller/userController");

app.get("/", async (req, res) => {
  await connect();

  // return res.json(notes.map((note) => ({ ...note._doc, id: note._id })));
  return res.status(200).json({ message: "Hallo from project shopping basket!" });
});

app.get("/products", getProducts);

const server = app.listen(port, () => console.log(`Express app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
