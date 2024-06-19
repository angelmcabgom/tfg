export const usuarios = {
  login: async function (username, password) {
    let data = new FormData();
    data.append("username", username);
    data.append("password", password);
    data.append("action", "login");

    return fetch("http://localhost/tfg/back/usuarios/", {
      method: "POST",
      body: data,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response not ok");
        }
        return response.json();
      })
      .then((data) => {
        const token = data.token;
        const imagen = data.imagen;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("imagen", imagen);
          return { success: true };
        } else {
          throw new Error("Token not found");
        }
      })
      .catch((error) => {
        console.error("There was a problem with the login:", error);
        return { success: false, message: error.message };
      });
  },
  register: async function (username, name, email, password, imagen) {
    let data = new FormData();
    data.append("action", "register");
    data.append("username", username);
    data.append("name", name);
    data.append("email", email);
    data.append("password", password);
    data.append("imagen", imagen);

    return fetch("http://localhost/tfg/back/usuarios/", {
      method: "POST",
      body: data,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response not ok");
        }
        return response.json();
      })
      .then((data) => {
        return { success: true, userId: data };
      })
      .catch((error) => {
        console.error("There was a problem with the registration:", error);
        return { success: false, message: error.message };
      });
  },
  uploadImage: async function (imageFile) {
    let data = new FormData();
    data.append("action", "uploadImage");
    data.append("imagen", imageFile);

    return fetch("http://localhost/tfg/back/usuarios/", {
      method: "POST",
      body: data,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response not ok");
        }
        return response.json();
      })
      .then((data) => {
        return { success: true, imagePath: data.imagePath };
      })
      .catch((error) => {
        console.error("There was a problem with uploading image:", error);
        return { success: false, message: error.message };
      });
  },
  verifyToken: async function (token) {
    let data = new FormData();
    data.append("action", "verifyToken");
    data.append("token", token);

    return fetch("http://localhost/tfg/back/usuarios/", {
      method: "POST",
      body: data,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.message === "valid") {
          return { success: true, data: data.data };
        } else {
          throw new Error(data.message);
        }
      })
      .catch((error) => {
        console.error("There was a problem with token verification:", error);
        return { success: false, message: error.message };
      });
  },
  toggleFavouriteDriver: async function (token, driver) {
    let checkData = new FormData();
    checkData.append("action", "checkFavouriteDriver");
    checkData.append("token", token);
    checkData.append("driver", driver);

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

     
      let actionData = new FormData();
      actionData.append("token", token);
      actionData.append("driver", driver);

      if (favourited) {
        
        actionData.append("action", "unfavouriteDriver");
      } else {
        
        actionData.append("action", "favouriteDriver");
      }

      let actionResponse = await fetch("http://localhost/tfg/back/usuarios/", {
        method: "POST",
        body: actionData,
      });

      if (!actionResponse.ok) {
        throw new Error("Network response not ok during action");
      }

      let actionResult = await actionResponse.json();
      return { success: true, message: actionResult.message };
    } catch (error) {
      console.error(
        "There was a problem with toggling favourite driver:",
        error
      );
      return { success: false, message: error.message };
    }
  },
};
