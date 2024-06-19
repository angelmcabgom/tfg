export const circuit = {
  /**
   * Obtiene información detallada sobre un circuito de Fórmula 1.
   *
   * @param {string} circuitId - El ID del circuito a consultar.
   * @returns {Promise<Object>} Una promesa que resuelve con un objeto que contiene información sobre el circuito, incluyendo:
   * - circuitId: {string} - El ID del circuito.
   * - circuitName: {string} - El nombre del circuito.
   * - location: {Object} - Un objeto que contiene la latitud, longitud, localidad y país del circuito.
   *   - lat: {number} - La latitud del circuito.
   *   - long: {number} - La longitud del circuito.
   *   - locality: {string} - La localidad donde se encuentra el circuito.
   *   - country: {string} - El país donde se encuentra el circuito.
   * - numRaces: {number} - El número de carreras que se han realizado en el circuito.
   * - numDrivers: {number} - El número de pilotos que han competido en el circuito.
   * - firstRace: {string|null} - La fecha de la primera carrera en el circuito, en formato YYYY-MM-DD, o null si no hay carreras.
   * - lastRace: {string|null} - La fecha de la última carrera en el circuito, en formato YYYY-MM-DD, o null si no hay carreras.
   * - fastestLap: {string|null} - El tiempo de la vuelta más rápida en el circuito, o null si no hay datos.
   * - fastestLapHolder: {string|null} - El apellido del piloto que tiene la vuelta más rápida, o null si no hay datos.
   * - lastWinner: {string|null} - El apellido del piloto que ganó la última carrera en el circuito, o null si no hay datos.
   */
  getCircuitInfo: function (circuitId) {
    return new Promise(async (resolve, reject) => {
      let circuitDetails = {};
      let numRaces = 0;
      let numDrivers = 0;
      let firstRace = null;
      let lastRace = null;
      let fastestLap = null;
      let fastestLapHolder = null;
      let lastWinner = null;

      try {
        const circuitResponse = await fetch(
          `https://ergast.com/api/f1/circuits/${circuitId}.json`
        );
        const circuitData = await circuitResponse.json();
        circuitDetails = circuitData.MRData.CircuitTable.Circuits[0];

        const racesResponse = await fetch(
          `https://ergast.com/api/f1/circuits/${circuitId}/races.json?limit=1000`
        );
        const racesData = await racesResponse.json();
        const races = racesData.MRData.RaceTable.Races;

        numRaces = races.length;
        if (numRaces > 0) {
          firstRace = races[0].date;
          lastRace = races[numRaces - 2].date;

          const lastRaceSeason = races[numRaces - 2].season;
          const lastRaceRound = races[numRaces - 2].round;
          const lastRaceResultsResponse = await fetch(
            `https://ergast.com/api/f1/${lastRaceSeason}/${lastRaceRound}/results.json`
          );
          const lastRaceResultsData = await lastRaceResultsResponse.json();
          const lastRaceResults =
            lastRaceResultsData.MRData.RaceTable.Races[0].Results;
          lastWinner = lastRaceResults[0].Driver.familyName;
        }

        const driversResponse = await fetch(
          `https://ergast.com/api/f1/circuits/${circuitId}/drivers.json?limit=1000`
        );
        const driversData = await driversResponse.json();
        numDrivers = driversData.MRData.DriverTable.Drivers.length;

        const fastestLapResponse = await fetch(
          `https://ergast.com/api/f1/circuits/${circuitId}/fastest/1/results.json?limit=1000`
        );
        const fastestLapData = await fastestLapResponse.json();
        const fastestLapResults = fastestLapData.MRData.RaceTable.Races;

        fastestLapResults.forEach((race) => {
          race.Results.forEach((result) => {
            if (!fastestLap || result.FastestLap.Time.time < fastestLap) {
              fastestLap = result.FastestLap.Time.time;
              fastestLapHolder = result.Driver.familyName;
            }
          });
        });

        resolve({
          circuitId: circuitDetails.circuitId,
          circuitName: circuitDetails.circuitName,
          location: {
            lat: circuitDetails.Location.lat,
            long: circuitDetails.Location.long,
            locality: circuitDetails.Location.locality,
            country: circuitDetails.Location.country,
          },
          numRaces,
          numDrivers,
          firstRace,
          lastRace,
          fastestLap,
          fastestLapHolder,
          lastWinner,
        });
      } catch (error) {
        console.error("Error fetching circuit data:", error);
        reject({
          circuitId: circuitId,
          circuitName: null,
          location: {
            lat: null,
            long: null,
          },
          numRaces: 0,
          numDrivers: 0,
          firstRace: null,
          lastRace: null,
          fastestLap: null,
          fastestLapHolder: null,
          lastWinner: null,
        });
      }
    });
  },
};
