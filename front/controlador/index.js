import { jwtDecode } from "../node_modules/jwt-decode/build/esm/index.js";
import api from "../api/index.js";

/**
 * Carga un archivo CSS dinámicamente.
 * @param {string} href - La URL del archivo CSS.
 * @returns {Promise<void>} Una promesa que se resuelve cuando el archivo CSS se carga correctamente.
 */
export async function loadStyles(href) {
  try {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.type = "text/css";
    linkElement.href = href;
    document.head.appendChild(linkElement);
  } catch (error) {
    console.error("Error loading CSS stylesheet:", error);
  }
}

/**
 * Carga el contenido del pie de página desde una URL y lo inserta en el documento HTML.
 * @param {string} url - La URL del pie de página.
 * @returns {Promise<void>} Una promesa que se resuelve cuando se carga y se inserta el contenido del pie de página correctamente.
 */
export async function loadFooter(url) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((footerContent) => {
      var mainElement = document.querySelector("main");
      mainElement.insertAdjacentHTML("afterend", footerContent);
    })
    .catch((error) => {
      console.error("There was a problem fetching the footer:", error);
    });
}

/**
 * Carga el contenido del encabezado desde una URL y lo inserta en el elemento head del documento HTML.
 * @param {string} url - La URL del encabezado.
 * @returns {Promise<void>} Una promesa que se resuelve cuando se carga y se inserta el contenido del encabezado correctamente.
 */
export async function loadHead(url) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((headContent) => {
      var head = document.querySelector("head");
      head.insertAdjacentHTML("afterbegin", headContent);
    })
    .catch((error) => {
      console.error("There was a problem fetching the head content:", error);
    });
}

/**
 * Carga el contenido del encabezado desde una URL y lo inserta en el cuerpo del documento HTML.
 * @param {string} url - La URL del encabezado.
 * @returns {Promise<void>} Una promesa que se resuelve cuando se carga y se inserta el contenido del encabezado correctamente.
 */
export async function loadNavbar(url) {
  const token = localStorage.getItem("token");
  let headerUrl = "";

  if (token) {
    try {
      const response = await api.usuarios.verifyToken(token);

      if (response.success) {
        const decodedToken = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedToken.exp > currentTime) {
          headerUrl = "../componentes/headerTrueLogin.html";
          console.log("token 1");
        } else {
          localStorage.removeItem("token");
          headerUrl = "../componentes/headerFalseLogin.html";
          console.log("token 0");
        }
      } else {
        localStorage.removeItem("token");
        console.log("token 2");
        headerUrl = "../componentes/headerFalseLogin.html";
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      console.log("token 0");
      localStorage.removeItem("token");
      headerUrl = "../componentes/headerFalseLogin.html";
    }
  } else {
    headerUrl = "../componentes/headerFalseLogin.html";
  }

  fetch(headerUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((headerContent) => {
      var body = document.querySelector("body");
      body.insertAdjacentHTML("afterbegin", headerContent);
      if (headerUrl === "../componentes/headerTrueLogin.html") {
        const imagenPefilContainer = document.querySelector("#imagenPerfil");
        const imagenPerfil = localStorage.getItem("imagen");
        imagenPefilContainer.src = `../../../back/assets/profileImg/${imagenPerfil}`;
      }
    })
    .catch((error) => {
      console.error("There was a problem fetching the header content:", error);
    });
}

/**
 * Verifica si hay un token de sesión almacenado y redirige a la página principal si el usuario ya ha iniciado sesión.
 * @returns {void} No devuelve nada.
 */
export async function checkLoginAndRedirect() {
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.includes("login");
  const token = localStorage.getItem("token");

  if (isLoginPage && token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (decodedToken.exp > currentTime) {
      window.location.href = "../main";
    } else {
      localStorage.removeItem("token");
    }
  }
}

/**
 * Carga el calendario de carreras y lo muestra en el documento.
 * @param {Array} races - Un array de objetos que representan las carreras.
 * @returns {Promise<void>} Una promesa que se resuelve cuando el calendario de carreras se carga correctamente.
 */
export async function loadRaceSchedule(races) {
  const gridContainer = document.querySelector(".grid-container");

  races.forEach((race) => {
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");
    gridItem.setAttribute("data-url", `../circuito?track=${race.circuitId}`);

    const h2 = document.createElement("h2");
    h2.textContent = `${race.raceName}`;
    h2.id = `track-schedule-h2`;

    const hr1 = document.createElement("hr");

    const h3 = document.createElement("h3");
    h3.textContent = race.raceDate;
    h3.id = `track-schedule-h3`;

    const hr2 = document.createElement("hr");

    const img = document.createElement("img");
    img.src = `../css/assets/images/tracks/${race.circuitId}.png`;
    img.alt = "IMAGEN CIRCUITO";
    img.id = `track-schedule-image`;

    gridItem.appendChild(h2);
    gridItem.appendChild(hr1);
    gridItem.appendChild(h3);
    gridItem.appendChild(hr2);
    gridItem.appendChild(img);

    gridContainer.appendChild(gridItem);
  });
}

/**
 * Maneja el evento de clic en los elementos de la cuadrícula.
 * @returns {void} No devuelve nada.
 */
export function clickEventHandler() {
  const gridItems = document.querySelectorAll(".grid-item");

  gridItems.forEach(function (item) {
    item.addEventListener("click", function () {
      const url = this.getAttribute("data-url");
      window.location.href = url;
    });
  });
}

/**
 * Carga las posiciones de los conductores y las muestra en el documento.
 * @param {Array} driverStandingsInfo - Un array de objetos que representan las posiciones de los conductores.
 * @returns {void} No devuelve nada.
 */
export function loadDriverStandings(driverStandingsInfo) {
  const container = document.querySelector(".grid-container");
  container.classList.add("grid-container");

  driverStandingsInfo.forEach((driver, index) => {
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");
    gridItem.dataset.url = `../driver/?driver=${driver.driverId}`;

    const pointsFlexWrapper = document.createElement("div");
    pointsFlexWrapper.classList.add("points-flex-wrapper");

    const position = document.createElement("div");
    position.id = "position";
    position.textContent = driver.position;
    pointsFlexWrapper.appendChild(position);

    const pointsCurrent = document.createElement("div");
    pointsCurrent.id = "points-current";
    const numberPts = document.createElement("span");
    numberPts.classList.add("number-pts");
    numberPts.textContent = driver.points;
    const pts = document.createElement("span");
    pts.classList.add("pts");
    pts.textContent = "PTS";
    pointsCurrent.appendChild(numberPts);
    pointsCurrent.appendChild(document.createElement("br"));
    pointsCurrent.appendChild(pts);
    pointsFlexWrapper.appendChild(pointsCurrent);

    gridItem.appendChild(pointsFlexWrapper);
    gridItem.appendChild(document.createElement("hr"));

    const driverGrid = document.createElement("div");
    driverGrid.classList.add("driver-grid");

    const driverFlexWrapper = document.createElement("div");
    driverFlexWrapper.classList.add("driver-flex-wrapper");

    const firstName = document.createElement("div");
    firstName.id = "first-name";
    firstName.textContent = driver.givenName;
    const lastName = document.createElement("div");
    lastName.id = "last-name";
    lastName.textContent = driver.familyName;
    driverFlexWrapper.appendChild(firstName);
    driverFlexWrapper.appendChild(lastName);

    const constructorImageWrapper = document.createElement("div");
    constructorImageWrapper.classList.add("constructor-image-wrapper");
    const constructorImage = document.createElement("img");
    constructorImage.src = `../css/assets/images/constructors/${driver.constructorId}.png`;
    constructorImage.alt = "";
    constructorImage.classList.add("constructor-image");
    constructorImageWrapper.appendChild(constructorImage);

    driverGrid.appendChild(driverFlexWrapper);
    driverGrid.appendChild(constructorImageWrapper);

    gridItem.appendChild(driverGrid);
    gridItem.appendChild(document.createElement("hr"));

    const driverImageGrid = document.createElement("div");
    driverImageGrid.classList.add("driver-image-grid");

    const numberImageWrapper = document.createElement("div");
    numberImageWrapper.classList.add("number-image-wrapper");
    const driverImageNumber = document.createElement("img");
    driverImageNumber.src = `../css/assets/images/drivers/${driver.permanentNumber}.png`;
    driverImageNumber.alt = "IMAGEN PILOTO";
    driverImageNumber.id = "driver-image-number";
    numberImageWrapper.appendChild(driverImageNumber);

    const driverImage = document.createElement("img");
    driverImage.src = `../css/assets/images/drivers/${driver.driverId}.png`;
    driverImage.alt = "IMAGEN CIRCUITO";
    driverImage.id = "driver-image";

    driverImageGrid.appendChild(numberImageWrapper);
    driverImageGrid.appendChild(driverImage);

    gridItem.appendChild(driverImageGrid);

    container.appendChild(gridItem);
  });
}

/**
 * Muestra el elemento de carga estableciendo su visibilidad como "visible".
 */
export function showLoad() {
  const load = document.querySelector(".load");
  load.style.visibility = "visible";
}

/**
 * Oculta el elemento de carga estableciendo su visibilidad como "hidden".
 */
export function hideLoad() {
  const load = document.querySelector(".load");
  load.style.visibility = "hidden";
}

/**
 * Carga la información de un conductor en la interfaz de usuario.
 *
 * @param {Object} driverObject - Objeto que contiene la información del conductor.
 * @param {string} driverObject.constructorId - ID del constructor del conductor.
 * @param {string} driverObject.driverId - ID del conductor.
 * @param {string} driverObject.permanentNumber - Número permanente del conductor.
 * @param {string} driverObject.givenName - Nombre del conductor.
 * @param {string} driverObject.familyName - Apellido del conductor.
 * @param {string} driverObject.currentTeam - Equipo actual del conductor.
 * @param {string} driverObject.nationality - Nacionalidad del conductor.
 * @param {number} driverObject.totalChampionships - Total de campeonatos ganados por el conductor.
 * @param {number} driverObject.totalWins - Total de victorias del conductor.
 * @param {number} driverObject.totalPodiums - Total de podios del conductor.
 * @param {number} driverObject.totalPoints - Total de puntos obtenidos por el conductor.
 * @param {number} driverObject.totalRaces - Total de carreras disputadas por el conductor.
 * @param {string} driverObject.highestRaceFinish - Mejor posición final en una carrera del conductor.
 * @param {string} driverObject.dateOfBirth - Fecha de nacimiento del conductor.
 */
export async function loadDriverInfo(driverObject) {
  const parentElement = document.querySelector(".driver-container");

  const container = document.createElement("div");
  container.classList.add("driver-image-nombre-container");

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("image-container");
  imageContainer.style.backgroundImage = `url('../css/assets/images/constructors/${driverObject.constructorId}.png')`;

  const driverImage = document.createElement("img");
  driverImage.classList.add("driver-image");
  driverImage.src = `../css/assets/images/drivers/${driverObject.driverId}.png`;
  driverImage.alt = "";

  imageContainer.appendChild(driverImage);

  const driverNameContainer = document.createElement("div");
  driverNameContainer.classList.add("driver-name");

  const driverNumberImage = document.createElement("img");
  driverNumberImage.src = `../css/assets/images/drivers/${driverObject.permanentNumber}.png`;
  driverNumberImage.alt = "";

  const driverNameSpan = document.createElement("span");
  driverNameSpan.textContent = `${driverObject.givenName} ${driverObject.familyName}`;

  const addFavouriteButton = document.createElement("button");
  addFavouriteButton.id = "add-favourite-btn";
  addFavouriteButton.classList.add("btn");
  addFavouriteButton.textContent = "Añadir a favoritos";

  driverNameContainer.appendChild(driverNumberImage);
  driverNameContainer.appendChild(driverNameSpan);
  driverNameContainer.appendChild(addFavouriteButton);

  container.appendChild(imageContainer);
  container.appendChild(driverNameContainer);

  parentElement.appendChild(container);

  const driverInfoContainer = document.createElement("div");
  driverInfoContainer.classList.add("driver-info");

  const driverInfoData = [
    { label: "Equipo", value: driverObject.currentTeam },
    { label: "Nacionalidad", value: driverObject.nationality },
    { label: "Mundiales", value: driverObject.totalChampionships },
    { label: "Victorias totales", value: driverObject.totalWins },
    { label: "Podios totales", value: driverObject.totalPodiums },
    { label: "Puntos totales", value: driverObject.totalPoints },
    { label: "Carreras totales", value: driverObject.totalRaces },
    { label: "Posicion más alta", value: driverObject.highestRaceFinish },
    { label: "Fecha", value: driverObject.dateOfBirth },
  ];

  driverInfoData.forEach((item) => {
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");

    const label = document.createElement("div");
    label.classList.add(item.label.toLowerCase().replace(/\s+/g, "-"));
    label.textContent = item.label;

    const value = document.createElement("div");
    value.classList.add(
      `${item.label.toLowerCase().replace(/\s+/g, "-")}-text`
    );
    value.textContent = item.value;

    gridItem.appendChild(label);
    gridItem.appendChild(value);

    driverInfoContainer.appendChild(gridItem);
  });

  parentElement.appendChild(driverInfoContainer);
}

export async function updateFavouriteButton(driverId) {
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }

  let checkData = new FormData();
  checkData.append("action", "checkFavouriteDriver");
  checkData.append("token", token);
  checkData.append("driver", driverId);

  try {
    let checkResponse = await fetch("http://localhost/tfg/back/usuarios/", {
      method: "POST",
      body: checkData,
    });

    if (!checkResponse.ok) {
      throw new Error("Network response not ok during check");
    }

    let checkResult = await checkResponse.json();
    let favourited = checkResult.favourited;

    const button = document.getElementById("add-favourite-btn");

    if (favourited) {
      button.textContent = "Quitar de favoritos";
      button.classList.add("btn-danger");
      button.classList.remove("btn-primary");
    } else {
      button.textContent = "Añadir a favoritos";
      button.classList.add("btn-primary");
      button.classList.remove("btn-danger");
    }

    const newButton = button.cloneNode(true);
    button.replaceWith(newButton);

    newButton.addEventListener(
      "click",
      async () => {
        await toggleFavouriteDriver(token, driverId);
        await updateFavouriteButton(driverId);
      },
      { once: true }
    );
  } catch (error) {
    console.error("There was a problem with checking favourite driver:", error);
  }
}

export async function toggleFavouriteDriver(token, driver) {
  await api.usuarios.toggleFavouriteDriver(token, driver);
}

/**
 * Obtiene el código de un país a través del reverse geocoding de OpenCage y genera
 * una imagen vectorial con la proyección del país especificado.
 *
 * @param {number} latitude - Latitud de la ubicación.
 * @param {number} longitude - Longitud de la ubicación.
 * @param {string} circuitName - Nombre del circuito.
 * @returns {Promise<void>} Una promesa que se resuelve cuando se carga y se renderiza el mapa correctamente.
 */
export async function loadCountryMapAndRender(
  latitude,
  longitude,
  circuitName
) {
  const url = `http://localhost/tfg/back/api/?latitude=${latitude}&longitude=${longitude}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.countryCode) {
        const countryCode = data.countryCode;
        am4core.ready(function () {
          am4core.useTheme(am4themes_animated);

          const chart = am4core.create("chartdiv", am4maps.MapChart);

          // Map configurations (low resolution and Mercator)
          chart.geodata = am4geodata_worldLow;
          chart.projection = new am4maps.projections.Mercator();
          chart.seriesContainer.draggable = false;
          chart.seriesContainer.resizable = false;

          const polygonSeries = chart.series.push(
            new am4maps.MapPolygonSeries()
          );
          polygonSeries.useGeodata = true;
          polygonSeries.include = [countryCode];

          const polygonTemplate = polygonSeries.mapPolygons.template;
          polygonTemplate.fill = am4core.color("#FFFFFF");
          polygonTemplate.stroke = am4core.color("#000000");
          polygonTemplate.strokeWidth = 1;

          polygonTemplate.events.on("over", function (event) {
            event.target.fill = am4core.color("#FF0000");
          });

          polygonTemplate.events.on("out", function (event) {
            event.target.fill = am4core.color("#FFFFFF");
          });

          polygonSeries.events.once("inited", function () {
            const polygon = polygonSeries.getPolygonById(countryCode);
            if (polygon) {
              chart.zoomToMapObject(polygon);
              polygon.isActive = true;

              const imageSeries = chart.series.push(
                new am4maps.MapImageSeries()
              );
              const imageSeriesTemplate = imageSeries.mapImages.template;

              const circle = imageSeriesTemplate.createChild(am4core.Circle);
              circle.radius = 10;
              circle.fill = am4core.color("#000000");
              circle.stroke = am4core.color("#FFFFFF");
              circle.strokeWidth = 2;
              circle.nonScaling = true;
              circle.tooltipText = `${circuitName}`;

              imageSeriesTemplate.propertyFields.latitude = "latitude";
              imageSeriesTemplate.propertyFields.longitude = "longitude";

              const lat = parseFloat(latitude);
              const lon = parseFloat(longitude);

              imageSeries.data = [
                {
                  latitude: lat,
                  longitude: lon,
                },
              ];

              imageSeries.validateData();
            }
          });

          polygonSeries.validateData();
        });
      } else {
        console.error("No country found for the provided coordinates.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      console.error("Failed to fetch country data.");
    });
}

/**
 * Carga la información de un circuito en la interfaz de usuario.
 *
 * @param {Object} data - Objeto que contiene la información del circuito.
 * @param {string} data.circuitName - Nombre del circuito.
 * @param {Object} data.location - Ubicación del circuito.
 * @param {string} data.location.locality - Localidad del circuito.
 * @param {string} data.location.country - País del circuito.
 * @param {number} data.numRaces - Número de carreras celebradas en el circuito.
 * @param {number} data.numDrivers - Número de pilotos que han competido en el circuito.
 * @param {string} data.fastestLap - Vuelta más rápida en el circuito.
 * @param {string} data.fastestLapHolder - Piloto que tiene la vuelta más rápida.
 * @param {string} data.lastWinner - Último ganador en el circuito.
 * @param {string} data.firstRace - Fecha de la primera carrera en el circuito.
 * @param {string} data.lastRace - Fecha de la última carrera en el circuito.
 * @returns {Promise<void>} Promesa que se resuelve cuando la información del circuito se ha cargado en la interfaz.
 */
export async function loadCircuitInfo(data) {
  const mainContent = document.querySelector("main.flex-grow-1.min-vh-100");

  const locationMapContainer = document.createElement("div");
  locationMapContainer.className = "location-map-container";

  const locationContainer = document.createElement("div");
  locationContainer.className = "location-container";

  const trackName = document.createElement("div");
  trackName.className = "track-name";
  trackName.textContent = data.circuitName;

  const trackLocation = document.createElement("div");
  trackLocation.className = "track-location";
  trackLocation.textContent = `${data.location.locality}, ${data.location.country}`;

  const numberDriversRaces = document.createElement("div");
  numberDriversRaces.className = "number-drivers-races";

  const numberRaces = document.createElement("div");
  numberRaces.className = "number-races";
  const numberRacesLabel = document.createElement("div");
  numberRacesLabel.textContent = "Carreras";
  const numRacesContent = document.createElement("div");
  numRacesContent.className = "num-content";
  numRacesContent.textContent = data.numRaces;

  numberRaces.appendChild(numberRacesLabel);
  numberRaces.appendChild(numRacesContent);

  const numberDrivers = document.createElement("div");
  numberDrivers.className = "number-drivers";
  const numberDriversLabel = document.createElement("div");
  numberDriversLabel.textContent = "Pilotos";
  const numDriversContent = document.createElement("div");
  numDriversContent.className = "num-content";
  numDriversContent.textContent = data.numDrivers;

  numberDrivers.appendChild(numberDriversLabel);
  numberDrivers.appendChild(numDriversContent);

  numberDriversRaces.appendChild(numberRaces);
  numberDriversRaces.appendChild(numberDrivers);

  locationContainer.appendChild(trackName);
  locationContainer.appendChild(trackLocation);
  locationContainer.appendChild(numberDriversRaces);

  const chartDiv = document.createElement("div");
  chartDiv.className = "chartdiv";

  locationMapContainer.appendChild(locationContainer);
  locationMapContainer.appendChild(chartDiv);

  const circuitInfoContainer = document.createElement("div");
  circuitInfoContainer.className = "circuit-info-container";

  const trackMapContainer = document.createElement("div");
  trackMapContainer.className = "track-map-container";
  const trackMapImage = document.createElement("img");
  trackMapImage.src = "../css/assets/images/tracks/villeneuve.png";
  trackMapImage.alt = "";

  trackMapContainer.appendChild(trackMapImage);

  const trackInfoGrid = document.createElement("div");
  trackInfoGrid.className = "track-info-grid";

  const createGridItem = (title, content) => {
    const gridItem = document.createElement("div");
    gridItem.className = "grid-item";

    const gridItemTitle = document.createElement("div");
    gridItemTitle.className = "grid-item-title";
    gridItemTitle.textContent = title;

    const gridItemContent = document.createElement("div");
    gridItemContent.className = "grid-item-content";
    gridItemContent.innerHTML = content;

    gridItem.appendChild(gridItemTitle);
    gridItem.appendChild(gridItemContent);

    return gridItem;
  };

  trackInfoGrid.appendChild(
    createGridItem(
      "Record",
      `${data.fastestLap} <span class="fastest-lap-holder">${data.fastestLapHolder}</span>`
    )
  );
  trackInfoGrid.appendChild(createGridItem("Último ganador", data.lastWinner));
  trackInfoGrid.appendChild(createGridItem("Primera carrera", data.firstRace));
  trackInfoGrid.appendChild(createGridItem("Última carrera", data.lastRace));

  circuitInfoContainer.appendChild(trackMapContainer);
  circuitInfoContainer.appendChild(trackInfoGrid);

  mainContent.appendChild(locationMapContainer);
  mainContent.appendChild(circuitInfoContainer);
}

export async function checkInvalidTokenAndRedirect() {
  const token = localStorage.getItem("token");

  try {
    if (token) {
      console.log("Token found in localStorage:", token);

      const tokenVerificationResult = await api.usuarios.verifyToken(token);

      console.log("Token verification result:", tokenVerificationResult);

      if (!tokenVerificationResult.success) {
        localStorage.removeItem("token");
        window.location.href = "../login";
        console.log("Token verification failed, redirecting to login");
        console.error(
          "Token verification failed:",
          tokenVerificationResult.message
        );
        return;
      }

      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken);

      const currentTime = Math.floor(Date.now() / 1000);
      console.log(
        "Current time:",
        currentTime,
        "Token expiration time:",
        decodedToken.exp
      );

      if (decodedToken.exp < currentTime) {
        console.log("Token has expired, redirecting to login");
        localStorage.removeItem("token");
        window.location.href = "../login";
        return;
      }

    } else {
      console.log("No token found, redirecting to login");
      window.location.href = "../login";
    }
  } catch (error) {
    console.log("Error occurred during token check:", error);
    console.error("Error in token authentication:", error);
    window.location.href = "../login";
  }
}

export async function checkValidTokenAndRedirect() {
  const token = localStorage.getItem("token");

  try {
    if (token) {
      const tokenVerificationResult = await api.usuarios.verifyToken(token);

      if (tokenVerificationResult.success) {
        window.location.href = "../main";
        return;
      }

      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        console.error("Token has expired");
      }
    } else {
      console.error("No token found");
    }
  } catch (error) {
    console.error("Error in token authentication:", error);
  }
}
