document.addEventListener("DOMContentLoaded", () => {
  const yearSelect = document.getElementById("yearSelect");
  const trackSelect = document.getElementById("trackSelect");
  const findSessionBtn = document.getElementById("findSessionBtn");
  const selectionArea = document.getElementById("selectionArea");
  const sessionInfo = document.getElementById("sessionInfo");
  const carDataTable = document.getElementById("car-data-table");
  const speedControl = document.getElementById("speedControl");
  const speedValue = document.getElementById("speedValue");

  let updateInterval;
  let updateIntervalTime = parseInt(speedControl.value);

  const driverNumbers = [
    55, 1, 63, 81, 16, 20, 14, 11, 18, 44, 4, 77, 24, 31, 10, 22, 21, 23,
    2, 27,
  ];
  const tableBody = document
    .getElementById("car-data-table")
    .querySelector("tbody");
  const driverDataMap = {};
  const driverPositionMap = {};
  const driverLapDataMap = {};
  const driverIntervalMap = {};
  const driverPitMap = {};
  const driverCurrentIndex = {};
  const driverLapCount = {};
  const driverLastPositions = {};

  driverNumbers.forEach((driverNumber) => {
    const row = document.createElement("tr");
    row.id = `driver-${driverNumber}`;

    const cells = [
      "position",
      "driver-number",
      "date",
      "speed",
      "rpm",
      "throttle",
      "brake",
      "gear",
      "drs",
      "lap-time",
      "interval",
      "gap-to-leader",
      "sector-1",
      "sector-1-segments",
      "sector-2",
      "sector-2-segments",
      "sector-3",
      "sector-3-segments",
      "tyre-age",
      "lap-number",
    ];

    cells.forEach((cellClass) => {
      const cell = document.createElement("td");
      cell.className = cellClass;
      row.appendChild(cell);
    });

    tableBody.appendChild(row);

    driverDataMap[driverNumber] = [];
    driverPositionMap[driverNumber] = [];
    driverLapDataMap[driverNumber] = [];
    driverIntervalMap[driverNumber] = [];
    driverCurrentIndex[driverNumber] = 0;
    driverLapCount[driverNumber] = 0;
    driverLastPositions[driverNumber] = null;
  });

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchData(sessionKey) {
    for (let i = 0; i < driverNumbers.length; i++) {
      const driverNumber = driverNumbers[i];
      const carDataUrl = `https://api.openf1.org/v1/car_data?driver_number=${driverNumber}&session_key=${sessionKey}`;
      const positionDataUrl = `https://api.openf1.org/v1/position?session_key=${sessionKey}&driver_number=${driverNumber}`;
      const lapDataUrl = `https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=${driverNumber}`;
      const intervalDataUrl = `https://api.openf1.org/v1/intervals?session_key=${sessionKey}&driver_number=${driverNumber}`;
      const pitDataUrl = `https://api.openf1.org/v1/pit?session_key=${sessionKey}&driver_number=${driverNumber}`;

      try {
        const [
          carDataResponse,
          positionDataResponse,
          lapDataResponse,
          intervalDataResponse,
          pitDataResponse,
        ] = await Promise.all([
          fetch(carDataUrl),
          fetch(positionDataUrl),
          fetch(lapDataUrl),
          fetch(intervalDataUrl),
          fetch(pitDataUrl),
        ]);

        const carData = await carDataResponse.json();
        const positionData = await positionDataResponse.json();
        const lapData = await lapDataResponse.json();
        const intervalData = await intervalDataResponse.json();
        const pitData = await pitDataResponse.json();

        if (carData.length > 0) {
          const sessionStartTime = new Date(carData[0].date).getTime();
          const oneHourInMilliseconds = 3600 * 1000;
          const filteredCarData = carData.filter((entry) => {
            const entryTime = new Date(entry.date).getTime();
            return entryTime > sessionStartTime + oneHourInMilliseconds;
          });

          driverDataMap[driverNumber] = filteredCarData;
          console.log(
            `Filtered car data for driver ${driverNumber}:`,
            driverDataMap[driverNumber]
          );
        }
        if (positionData.length > 0) {
          driverPositionMap[driverNumber] = positionData;
          console.log(
            `Position data for driver ${driverNumber}:`,
            driverPositionMap[driverNumber]
          );
        }
        if (lapData.length > 0) {
          driverLapDataMap[driverNumber] = lapData;
          console.log(
            `Lap data for driver ${driverNumber}:`,
            driverLapDataMap[driverNumber]
          );
        }
        if (intervalData.length > 0) {
          driverIntervalMap[driverNumber] = intervalData;
          console.log(
            `Interval data for driver ${driverNumber}:`,
            driverIntervalMap[driverNumber]
          );
        }
        if (pitData.length > 0) {
          driverPitMap[driverNumber] = pitData;
          console.log(
            `Pit data for driver ${driverNumber}:`,
            driverPitMap[driverNumber]
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      await delay(50);
    }

    console.log("All data collected.");
    updateInterval = setInterval(updateTable, updateIntervalTime);
    carDataTable.classList.remove("hidden");
  }

  function findClosestPosition(entry, positions) {
    let closest = null;
    let minDiff = Infinity;
    const entryDate = new Date(entry.date).getTime();

    positions.forEach((position) => {
      const positionDate = new Date(position.date).getTime();
      const diff = Math.abs(entryDate - positionDate);
      if (diff < minDiff) {
        minDiff = diff;
        closest = position;
      }
    });

    return closest;
  }

  function findClosestLap(entry, laps) {
    let closest = null;
    let minDiff = Infinity;
    const entryDate = new Date(entry.date).getTime();

    laps.forEach((lap) => {
      const lapDate = new Date(lap.date_start).getTime();
      const diff = Math.abs(entryDate - lapDate);
      if (diff < minDiff) {
        minDiff = diff;
        closest = lap;
      }
    });

    return closest;
  }

  function findClosestInterval(entry, intervals) {
    let closest = null;
    let minDiff = Infinity;
    const entryDate = new Date(entry.date).getTime();

    intervals.forEach((interval) => {
      const intervalDate = new Date(interval.date).getTime();
      const diff = Math.abs(entryDate - intervalDate);
      if (diff < minDiff) {
        minDiff = diff;
        closest = interval;
      }
    });

    return closest;
  }

  function updateTable() {
    const rowsData = [];

    driverNumbers.forEach((driverNumber) => {
      const entries = driverDataMap[driverNumber];
      const positions = driverPositionMap[driverNumber];
      const laps = driverLapDataMap[driverNumber];
      const intervals = driverIntervalMap[driverNumber];
      const currentIndex = driverCurrentIndex[driverNumber];

      if (
        entries.length > 0 &&
        positions.length > 0 &&
        laps.length > 0 &&
        intervals.length > 0
      ) {
        const entry = entries[currentIndex];
        const position = findClosestPosition(entry, positions);
        const lap = findClosestLap(entry, laps);
        const interval = findClosestInterval(entry, intervals);

        if (entry && position && lap && interval) {
          const sectorSegments1 = lap.segments_sector_1 || [];
          const sectorSegments2 = lap.segments_sector_2 || [];
          const sectorSegments3 = lap.segments_sector_3 || [];

          const mapSegmentToColor = (value) => {
            switch (value) {
              case 2048:
                return "yellow";
              case 2049:
                return "green";
              case 2051:
                return "purple";
              default:
                return "transparent";
            }
          };

          const formatSegments = (segments) =>
            segments
              .map((segment) => {
                const color = mapSegmentToColor(segment);
                return `<span class="segment-square ${color}"></span>`;
              })
              .join("");

          const rowData = {
            position: position.position,
            driverNumber: driverNumber,
            date: entry.date,
            speed: entry.speed,
            rpm: entry.rpm,
            throttle: entry.throttle,
            brake: entry.brake,
            gear: entry.gear,
            drs: entry.drs,
            lapTime: lap.lap_duration,
            interval: interval.interval,
            gapToLeader: interval.gap_to_leader,
            sector1: lap.duration_sector_1 || "N/A",
            sector1Segments: formatSegments(sectorSegments1),
            sector2: lap.duration_sector_2 || "N/A",
            sector2Segments: formatSegments(sectorSegments2),
            sector3: lap.duration_sector_3 || "N/A",
            sector3Segments: formatSegments(sectorSegments3),
            tyreAge: lap.tire_age,
            lapNumber: lap.lap_number,
          };

          rowsData.push(rowData);

          driverCurrentIndex[driverNumber] =
            (currentIndex + 1) % entries.length;
        }
      }
    });

    rowsData.sort((a, b) => a.position - b.position);

    const tableBody = document
      .getElementById("car-data-table")
      .querySelector("tbody");
    tableBody.innerHTML = "";

    rowsData.forEach((rowData) => {
      const row = document.createElement("tr");
      row.id = `driver-${rowData.driverNumber}`;

      const cells = [
        rowData.position,
        rowData.driverNumber,
        rowData.date,
        rowData.speed,
        rowData.rpm,
        rowData.throttle,
        rowData.brake,
        rowData.gear,
        rowData.drs,
        rowData.lapTime,
        rowData.interval,
        rowData.gapToLeader,
        rowData.sector1,
        rowData.sector1Segments,
        rowData.sector2,
        rowData.sector2Segments,
        rowData.sector3,
        rowData.sector3Segments,
        rowData.tyreAge,
        rowData.lapNumber,
      ];

      cells.forEach((cellData, index) => {
        const cell = document.createElement("td");
        if (index === 13 || index === 15 || index === 17) {
          cell.innerHTML = cellData;
        } else {
          cell.textContent = cellData;
        }
        row.appendChild(cell);
      });

      const lastPosition = driverLastPositions[rowData.driverNumber];
      if (lastPosition !== null && lastPosition > rowData.position) {
        row.classList.add("flash");
        setTimeout(() => row.classList.remove("flash"), 1000);
      }

      driverLastPositions[rowData.driverNumber] = rowData.position;

      tableBody.appendChild(row);
    });
  }

  fetch("https://api.openf1.org/v1/meetings")
    .then((response) => response.json())
    .then((data) => {
      const years = [...new Set(data.map((meeting) => meeting.year))];
      populateSelect(yearSelect, years, "year");
    })
    .catch((error) => {
      console.error("Error fetching years:", error);
    });

  yearSelect.addEventListener("change", async () => {
    const selectedYear = yearSelect.value;
    fetch(`https://api.openf1.org/v1/meetings?year=${selectedYear}`)
      .then((response) => response.json())
      .then(async (data) => {
        const tracks = [
          ...new Set(data.map((meeting) => meeting.location)),
        ];
        await populateSelect(
          trackSelect,
          tracks,
          "location",
          selectedYear
        );
      })
      .catch((error) => {
        console.error("Error fetching tracks:", error);
      });
  });

  findSessionBtn.addEventListener("click", () => {
    const selectedYear = yearSelect.value;
    const selectedTrack = trackSelect.value;
    const sessionKey =
      trackSelect.options[trackSelect.selectedIndex].dataset.sessionKey ||
      "No session found";
    sessionInfo.textContent = `Session Key: ${sessionKey}`;

    if (sessionKey !== "No session found") {
      selectionArea.classList.add("hidden");
      fetchData(sessionKey);
    } else {
      console.error("Session key not found for the selected track");
    }
  });

  speedControl.addEventListener("input", () => {
    speedValue.textContent = speedControl.value;
  });

  speedControl.addEventListener("change", () => {
    updateIntervalTime = parseInt(speedControl.value);
    clearInterval(updateInterval);
    updateInterval = setInterval(updateTable, updateIntervalTime);
  });

  async function populateSelect(
    selectElement,
    options,
    type,
    selectedYear = ""
  ) {
    selectElement.innerHTML = "";
    for (const option of options) {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      if (type === "location") {
        const response = await fetch(
          `https://api.openf1.org/v1/sessions?year=${selectedYear}&location=${option}&session_type=Race`
        );

        const data = await response.json();
        if (data.length > 0) {
          const sessionKey = data[0].session_key;
          optionElement.dataset.sessionKey = sessionKey;
        }
        await delay(50);
      }
      optionElement.textContent = option;
      selectElement.appendChild(optionElement);
    }
  }
});