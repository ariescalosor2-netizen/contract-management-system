import { useState } from "react";
import { BiHide, BiShow } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  loginUser,
  getCurrentUser,
} from "../../services/authService";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await loginUser(
        formData.email,
        formData.password
      );

      const token = response.access_token;

      if (!token) {
        throw new Error(
          "No access token returned by server."
        );
      }

      const user =
        await getCurrentUser(token);

      login(user, token);

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md"
    >
      <h2 className="text-3xl font-bold mb-2">
        Sign In
      </h2>

      <p className="text-gray-500 mb-8">
        Welcome back! Please sign in to
        continue.
      </p>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Email */}
      <div className="mb-5">
        <label className="block mb-2 font-medium">
          Email Address
        </label>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Password */}
      <div className="mb-5">
        <label className="block mb-2 font-medium">
          Password
        </label>

        <div className="relative">
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="w-full border rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-500"
          >
            {showPassword ? (
              <BiHide />
            ) : (
              <BiShow />
            )}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center justify-between mb-8">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="remember"
            checked={
              formData.remember
            }
            onChange={handleChange}
          />

          Remember me
        </label>

        <button
          type="button"
          className="text-blue-600 hover:underline text-sm"
        >
          Forgot Password?
        </button>
      </div>

      {/* Login */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition text-white py-3 rounded-lg font-semibold"
      >
        {loading
          ? "Signing In..."
          : "Sign In"}
      </button>

      <p className="text-center text-gray-400 mt-8 text-sm">
        Version 1.0.0
      </p>
    </form>
  );
}

export default LoginForm;