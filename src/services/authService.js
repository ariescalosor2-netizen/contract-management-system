import api from "./api";


// ============================================================
// LOGIN USER
// ============================================================

export const loginUser = async (
  email,
  password
) => {
  const formData =
    new URLSearchParams();

  formData.append(
    "username",
    email
  );

  formData.append(
    "password",
    password
  );

  const response = await api.post(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};


// ============================================================
// LOGIN ALIAS
// ============================================================
//
// Kept for compatibility with any other
// component that may use `login` from this service.
//

export const login = loginUser;


// ============================================================
// GET CURRENT USER
// ============================================================

export const getCurrentUser =
  async (token) => {

    const config = {};

    // ----------------------------------------------------------
    // Use the token returned by login directly.
    // This is important because LoginForm calls:
    //
    // getCurrentUser(token)
    //
    // BEFORE AuthContext stores the token.
    // ----------------------------------------------------------

    if (token) {

      config.headers = {
        Authorization:
          `Bearer ${token}`,
      };

    }

    const response =
      await api.get(
        "/auth/me",
        config
      );

    return response.data;
  };


// ============================================================
// CHANGE PASSWORD
// ============================================================

export const changePassword =
  async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {

    const response =
      await api.post(
        "/auth/change-password",
        {
          current_password:
            currentPassword,

          new_password:
            newPassword,

          confirm_password:
            confirmPassword,
        }
      );

    return response.data;
  };