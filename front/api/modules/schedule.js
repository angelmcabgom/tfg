export const schedule = {
  nextRace: async function () {
    fetch("https://ergast.com/api/f1/current.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        let closestRaceName = "";
        let closestTimeDifference = Infinity;
        let closestCircuitId = "";

        data.MRData.RaceTable.Races.forEach((race) => {
          const raceDate = new Date(`${race.date}T${race.time}`);
          const raceId = race.Circuit.circuitId;
          raceDate.setHours(0, 0, 0, 0);
          const timeDifference = raceDate - currentDate;
          if (timeDifference > 0 && timeDifference < closestTimeDifference) {
            closestRaceName = race.raceName;
            closestTimeDifference = timeDifference;
            closestCircuitId = raceId;
          }
        });

        const daysLeft = Math.ceil(
          closestTimeDifference / (1000 * 60 * 60 * 24)
        );

        const result = {
          raceName: closestRaceName,
          daysLeft: daysLeft,
        };

        const nextRaceTextElement = document.querySelector(".next-race-text");
        const nextRaceTrackTextElement = document.querySelector(
          ".next-race-text-track"
        );
        const nextRaceElement = document.querySelector(".next-race");
        const nextRaceElementImg = document.querySelector("#race-track");

        nextRaceElement.style.backgroundImage = `url('../css/assets/images/${closestCircuitId}.png')`;
        nextRaceTextElement.textContent = `PRÓXIMA CARRERA EN ${result.daysLeft} DIAS`;
        nextRaceTrackTextElement.textContent = result.raceName;
        nextRaceElementImg.src = `../css/assets/images/tracks/${closestCircuitId}.png`;
      })
      .catch((error) => {
        console.error("There was a problem fetching the data:", error);
      });
  },
  allRaces: async function () {
    return new Promise((resolve, reject) => {
      fetch("https://ergast.com/api/f1/current.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          const racesInfo = data.MRData.RaceTable.Races.map((race) => {
            const raceDate = new Date(`${race.date}T${race.time}`);
            const formattedDate = new Intl.DateTimeFormat("es-ES", {
              month: "short",
              day: "2-digit",
            }).format(raceDate);
            return {
              raceName: race.raceName,
              raceDate: formattedDate,
              circuitId: race.Circuit.circuitId,
            };
          });
          resolve(racesInfo); 
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};
