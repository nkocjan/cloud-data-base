const express = require("express");
module.exports = driver => {
  const router = express.Router();

  router.get("/movies", async (req, res) => {
    const session = driver.session();
    try {
      const result = await session.run(`
                MATCH (m:Movie)
                OPTIONAL MATCH (m)<-[:ACTED_IN]-(a:Actor)
                RETURN m.title AS title, m.year AS year, collect(a.name) AS actors
                ORDER BY m.year DESC
            `);

      const movies = result.records.map(record => ({
        title: record.get("title"),
        year: record.get("year").low,
        actors: record.get("actors"),
      }));

      res.json(movies);
    } catch (error) {
      console.error("Błąd przy pobieraniu filmów:", error);
      res.status(500).send({ message: "Błąd serwera." });
    } finally {
      await session.close();
    }
  });

  router.get("/actors", async (req, res) => {
    const session = driver.session();
    try {
      const result = await session.run(
        "MATCH (a:Actor) RETURN DISTINCT a.name AS name ORDER BY a.name ASC"
      );

      const actors = result.records.map(record => record.get("name"));

      res.json(actors);
    } catch (error) {
      console.error("Błąd przy pobieraniu aktorów:", error);
      res
        .status(500)
        .send({ message: "Błąd serwera przy komunikacji z bazą." });
    } finally {
      await session.close();
    }
  });

  router.get("/recommendations/:actorName", async (req, res) => {
    const actorName = req.params.actorName;
    const session = driver.session();

    try {
      const cypherQuery = `
                MATCH (a:Actor {name: $actorName})-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(otherActor:Actor)
                
                MATCH (otherActor)-[:ACTED_IN]->(recommendedMovie:Movie)
                
                WHERE NOT (a)-[:ACTED_IN]->(recommendedMovie) 
                
                RETURN recommendedMovie.title AS title, COUNT(recommendedMovie) AS coOccurrenceScore
                ORDER BY coOccurrenceScore DESC
                LIMIT 10
            `;

      const result = await session.run(cypherQuery, { actorName: actorName });

      const recommendations = result.records.map(record => ({
        title: record.get("title"),
        score: record.get("coOccurrenceScore").low,
      }));

      res.json(recommendations);
    } catch (error) {
      console.error(`Błąd przy rekomendacjach dla ${actorName}:`, error);
      res.status(500).send({ message: "Błąd serwera przy rekomendacjach." });
    } finally {
      await session.close();
    }
  });

  router.post("/actors", async (req, res) => {
    const { name } = req.body;
    const session = driver.session();
    try {
      await session.run("CREATE (a:Actor {name: $name}) RETURN a", { name });
      res.json({ message: `Dodano aktora: ${name}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    } finally {
      await session.close();
    }
  });

  router.post("/movies", async (req, res) => {
    const { title, year } = req.body;
    const session = driver.session();
    try {
      const yearInt = parseInt(year);
      await session.run(
        "CREATE (m:Movie {title: $title, year: $year}) RETURN m",
        { title, year: yearInt }
      );
      res.json({ message: `Dodano film: ${title}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    } finally {
      await session.close();
    }
  });

  router.post("/relationships", async (req, res) => {
    const { actorName, movieTitle } = req.body;
    const session = driver.session();
    try {
      await session.run(
        `
                MATCH (a:Actor {name: $actorName})
                MATCH (m:Movie {title: $movieTitle})
                MERGE (a)-[:ACTED_IN]->(m)
                RETURN a, m
            `,
        { actorName, movieTitle }
      );

      res.json({ message: `Przypisano ${actorName} do filmu ${movieTitle}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    } finally {
      await session.close();
    }
  });

  return router;
};
