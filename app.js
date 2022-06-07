const express = require("express");
const app = express();
const port = 3000;
const pupateer = require("./components/pupateer");
const urls = require("./components/urls");

app.get("/carmella", (req, res) => {
  console.log("scanning carmella");
  try {
    pupateer.scanUrl(
      "carmella",
      urls.carmellaUrls,
      urls.carmellaPriceClass,
      urls.carmellaNameClass
    );
    res.send("200 OK");
  } catch {
    res.send("500");
  }
});

app.get("/shookit", (req, res) => {
  console.log("scanning shookit");
  try {
    pupateer.scanUrl(
      "shookit",
      urls.shookitUrls,
      urls.shookitPriceClass,
      urls.shookitNameClass
    );
    res.send("200 OK");
  } catch {
    res.send("500");
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
