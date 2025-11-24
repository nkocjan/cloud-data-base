require("dotenv").config();

const express = require("express");
const cors = require("cors");
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

driver
  .verifyConnectivity()
  .then(() => {
    console.log("Połączenie z Neo4j AuraDB jest aktywne!");
  })
  .catch(error => {
    console.error("Błąd połączenia z Neo4j AuraDB:", error);
  });

const routes = require("./routes");
app.use("/api", routes(driver));
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Serwer działa na porcie http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await driver.close();
  console.log("\nPołączenie z Neo4j zamknięte. Serwer wyłączony.");
  process.exit(0);
});
