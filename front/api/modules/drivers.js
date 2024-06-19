export const drivers = {
  /**
   * Obtiene información detallada sobre un piloto de Fórmula 1.
   *
   * @param {string} driverId - El ID del piloto a consultar.
   * @returns {Promise<Object>} Una promesa que resuelve con un objeto que contiene información sobre el piloto, incluyendo:
   * - driverId: {string} - El ID del piloto.
   * - permanentNumber: {number} - El número permanente del piloto.
   * - givenName: {string} - El nombre del piloto.
   * - familyName: {string} - El apellido del piloto.
   * - dateOfBirth: {string} - La fecha de nacimiento del piloto, en formato YYYY-MM-DD.
   * - nationality: {string} - La nacionalidad del piloto.
   * - totalPoints: {number} - El total de puntos acumulados por el piloto.
   * - totalPodiums: {number} - El total de podios logrados por el piloto.
   * - totalRaces: {number} - El total de carreras en las que ha participado el piloto.
   * - totalChampionships: {number} - El total de campeonatos ganados por el piloto.
   * - totalWins: {number} - El total de carreras ganadas por el piloto.
   * - highestRaceFinish: {number|null} - La mejor posición de llegada en una carrera del piloto, o null si no hay datos.
   * - currentTeam: {string} - El equipo actual del piloto.
   * - constructorId: {string|null} - El ID del constructor del equipo actual del piloto, o null si no hay datos.
   */
  getDriverInfo: function (driverId) {
    return new Promise(async (resolve, reject) => {
      let totalPoints = 0;
      let totalPodiums = 0;
      let totalRaces = 0;
      let totalChampionships = 0;
      let totalWins = 0;
      let highestRaceFinish = null;
      let currentTeam = null;
      let driverDetails = {};
      let seasons = [];

      try {
        const driverResponse = await fetch(
          `https://ergast.com/api/f1/drivers/${driverId}.json`
        );
        const driverData = await driverResponse.json();
        driverDetails = driverData.MRData.DriverTable.Drivers[0];

        const response = await fetch(
          `https://ergast.com/api/f1/drivers/${driverId}/seasons.json`
        );
        const data = await response.json();
        seasons = data.MRData.SeasonTable.Seasons.map(
          (season) => season.season
        );

        for (let season of seasons) {
          const seasonResponse = await fetch(
            `https://ergast.com/api/f1/${season}/drivers/${driverId}/driverStandings.json`
          );
          const seasonData = await seasonResponse.json();
          const standings =
            seasonData.MRData.StandingsTable.StandingsLists[0]
              ?.DriverStandings[0];

          if (standings) {
            totalPoints += parseFloat(standings.points);
            if (standings.position === "1") {
              totalChampionships += 1;
            }
          }

          const raceResponse = await fetch(
            `https://ergast.com/api/f1/${season}/drivers/${driverId}/results.json`
          );
          const raceData = await raceResponse.json();
          const races = raceData.MRData.RaceTable.Races;

          totalRaces += races.length;

          const podiums = races.filter((race) =>
            ["1", "2", "3"].includes(race.Results[0].position)
          );
          totalPodiums += podiums.length;

          races.forEach((race) => {
            const position = parseInt(race.Results[0].position);
            if (highestRaceFinish === null || position < highestRaceFinish) {
              highestRaceFinish = position;
            }
            if (position === 1) {
              totalWins++;
            }
          });
        }

        const currentYear = new Date().getFullYear();
        const currentTeamResponse = await fetch(
          `https://ergast.com/api/f1/${currentYear}/drivers/${driverId}/constructors.json`
        );
        const currentTeamData = await currentTeamResponse.json();
        currentTeam =
          currentTeamData.MRData.ConstructorTable.Constructors[0]?.name ||
          "Unknown";
        const constructorId =
          currentTeamData.MRData.ConstructorTable.Constructors[0]
            ?.constructorId || null;

        resolve({
          driverId: driverDetails.driverId,
          permanentNumber: driverDetails.permanentNumber,
          givenName: driverDetails.givenName,
          familyName: driverDetails.familyName,
          dateOfBirth: driverDetails.dateOfBirth,
          nationality: driverDetails.nationality,
          totalPoints,
          totalPodiums,
          totalRaces,
          totalChampionships,
          totalWins,
          highestRaceFinish,
          currentTeam,
          constructorId,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        reject({
          driverId: driverId,
          permanentNumber: null,
          givenName: null,
          familyName: null,
          dateOfBirth: null,
          nationality: null,
          totalPoints: 0,
          totalPodiums: 0,
          totalRaces: 0,
          totalChampionships: 0,
          totalWins: 0,
          highestRaceFinish: null,
          currentTeam: "Unknown",
          constructorId: null,
        });
      }
    });
  },
};
