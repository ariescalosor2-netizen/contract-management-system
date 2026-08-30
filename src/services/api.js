import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://127.0.0.1:8000/api/v1"
    : "/api/v1");


const api = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type":
      "application/json",

    Accept:
      "application/json",
  },
});


// ============================================================
// GET AUTH TOKEN
// ============================================================

function getAuthToken() {

  // ----------------------------------------------------------
  // ARGO authentication
  // ----------------------------------------------------------

  const argoToken =
    window.ARGO_AUTH?.token ||
    window.__ARGO_AUTH__?.token;

  if (argoToken) {
    return argoToken;
  }


  // ----------------------------------------------------------
  // LOCAL DEVELOPMENT AUTHENTICATION
  // ----------------------------------------------------------

  const localToken =
    localStorage.getItem(
      "argo_token"
    );

  if (localToken) {
    return localToken;
  }


  return null;
}


// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(

  (config) => {

    config.headers =
      config.headers || {};


    const token =
      getAuthToken();


    // --------------------------------------------------------
    // IMPORTANT
    // --------------------------------------------------------
    //
    // If the request already contains an Authorization header,
    // preserve it.
    //
    // This is required during login because LoginForm gets the
    // JWT first and calls:
    //
    // getCurrentUser(token)
    //
    // before AuthContext/localStorage has saved the token.
    // --------------------------------------------------------

    const existingAuthorization =
      config.headers.Authorization;


    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    } else if (
      existingAuthorization
    ) {

      // Keep the explicitly supplied
      // Authorization header.

      config.headers.Authorization =
        existingAuthorization;

    } else {

      delete config.headers.Authorization;

    }


    return config;
  },


  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(

  (response) => {
    return response;
  },


  (error) => {

    const status =
      error.response?.status;


    // --------------------------------------------------------
    // UNAUTHORIZED
    // --------------------------------------------------------

    if (status === 401) {

      console.error(
        "Authentication failed: JWT is missing, invalid, or expired."
      );


      window.dispatchEvent(
        new CustomEvent(
          "argo-auth-error"
        )
      );
    }


    // --------------------------------------------------------
    // FORBIDDEN
    // --------------------------------------------------------

    if (status === 403) {

      console.error(
        "Authorization denied: user does not have permission for this action."
      );
    }


    return Promise.reject(error);
  }
);


export default api;