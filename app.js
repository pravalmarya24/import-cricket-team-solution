let express = require("express");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");
let app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

let initializeDbAndServer = async function () {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, function () {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Returns a list of all players in the team
app.get("/players/", async function (request, response) {
  let returnPlayerQuery = `
        SELECT *
        FROM cricket_team;

    `;
  let returnsPlayerDb = await db.all(returnPlayerQuery);
  response.send(
    returnsPlayerDb.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Creates a new player in the team
app.post("/players/", async function (request, response) {
  let addNewPlayer = request.body;
  let { playerName, jerseyNumber, role } = addNewPlayer;
  let newPlayerQuery = `
        INSERT INTO
        cricket_team (player_name,jersey_number,role)
        VALUES
        (
            '${player_name}',
            ${jersey_number},
            '${role}'
        );`;

  let newPlayerUpdated = await db.run(newPlayerQuery);
  response.send("Player Added to Team");
});

//Returns a player based on a player ID
app.get("/players/:playerId/", async function (request, response) {
  let { playerId } = request.params;
  let returnPlayerQuery = `
        SELECT *
        FROM
         cricket_team
        WHERE
         player_id = ${playerId};
    `;
  let playerReturns = await db.get(returnPlayerQuery);
  response.send(convertDbObjectToResponseObject(playerReturns));
});

//Updates the details of a player in the team
app.put("/players/:playerId/", async function (request, response) {
  let { playerId } = request.params;
  let playersDetails = request.body;
  let { playerName, jerseyNumber, role } = playersDetails;
  let putPlayerQuery = `
        UPDATE
        cricket_team
        SET
        player_name= '${playerName}',
        jersey_number= '${jerseyNumber}',
        role= '${role}'
        WHERE
        player_id = ${playerId}
    `;
  await db.run(putPlayerQuery);
  response.send("Player Details Updated");
});

//Deletes a player from the team
app.delete("/players/:playerId/", async function (request, response) {
  let { playerId } = request.params;
  let deletePlayerQuery = `
        DELETE
        FROM 
        cricket_team
        WHERE
        player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
