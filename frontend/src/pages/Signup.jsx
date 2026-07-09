import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../authSlice";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth,
  );

  const signupschema = z.object({
    firstName: z.string().min(3, "Minimum length is 3"),
    emailId: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password should contain at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        "Password must contain uppercase, lowercase, number and special character",
      ),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupschema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body p-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            Create Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* First Name */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">First Name</span>
              </label>

              <input
                {...register("firstName")}
                type="text"
                placeholder="Enter your name"
                className={`input input-bordered w-full ${
                  errors.firstName ? "input-error" : ""
                }`}
              />

              {errors.firstName && (
                <p className="text-error text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>

              <input
                {...register("emailId")}
                type="email"
                placeholder="Enter your email"
                className={`input input-bordered w-full ${
                  errors.emailId ? "input-error" : ""
                }`}
              />

              {errors.emailId && (
                <p className="text-error text-sm mt-1">
                  {errors.emailId.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>

              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`input input-bordered w-full pr-12 ${
                    errors.password ? "input-error" : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                >
                  {showPassword ? (
                    // Eye Off
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58M9.88 5.09A9.77 9.77 0 0112 5c5 0 9 7 9 7a17.6 17.6 0 01-4.17 4.95M6.23 6.23A17.38 17.38 0 003 12s4 7 9 7a8.9 8.9 0 003.77-.77"
                      />
                    </svg>
                  ) : (
                    // Eye
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-error text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-2">
              <span className="text-sm">
                Already a member?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="link link-primary font-semibold"
                >
                  Login
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
