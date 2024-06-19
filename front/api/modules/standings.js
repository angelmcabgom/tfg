export const standings = {
  /**
   * Obtiene la clasificación actual de todos los pilotos de F1.
   *
   * @returns {Promise<DriverStanding[]>} Una promesa que resuelve con un objeto JSON que contiene la clasificación de los pilotos, incluyendo:
   * - position: {string} - La posición del piloto en la clasificación.
   * - points: {string} - Los puntos acumulados por el piloto.
   * - driverId: {string} - El ID del piloto.
   * - permanentNumber: {string} - El número permanente del piloto.
   * - givenName: {string} - El nombre del piloto.
   * - familyName: {string} - El apellido del piloto.
   * - constructorId: {string} - El ID del constructor del equipo del piloto.
   */
  allDriversStandings: async function () {
    return new Promise((resolve, reject) => {
      fetch("https://ergast.com/api/f1/current/driverStandings.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          const standings =
            data.MRData.StandingsTable.StandingsLists[0].DriverStandings.map(
              (driver) => ({
                position: driver.position,
                points: driver.points,
                driverId: driver.Driver.driverId,
                permanentNumber: driver.Driver.permanentNumber,
                givenName: driver.Driver.givenName,
                familyName: driver.Driver.familyName,
                constructorId: driver.Constructors[0].constructorId,
              })
            );
          resolve(standings);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};
