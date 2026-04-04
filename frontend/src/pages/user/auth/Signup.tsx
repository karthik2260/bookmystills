import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Mail, Lock, Phone, User } from "lucide-react";
import { Link } from "react-router-dom";

import { USER, VENDOR } from "../../../config/constants/constants";
import { showToastMessage } from "../../../validations/common/toast";

import { useUserSignUp } from "@/hooks/user/useUserSignup";

const client_id = import.meta.env.VITE_CLIENT_ID || "";

const SignUp = () => {
  const {
    formValues,
    formErrors,
    imageIndex,
    images,
    isLoading,
    showPassword,
    showPassword1,
    handleChange,
    submitHandler,
    handleGoogleSuccess,
    togglePasswordVisibility,
    togglePasswordVisibility1,
  } = useUserSignUp();

  return (
    <div className="w-full h-screen flex overflow-hidden">
      {/* ── LEFT: Image / Brand Panel ── */}
      <div
        className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage: images[imageIndex]
            ? `url(${images[imageIndex]})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-indigo-900/80" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mb-3">
            <div className="w-5 h-5 rounded-sm bg-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">
            bookmystills
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Every Moment Deserves a Frame <br />
            Start Booking Now
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-xs">
            A trusted platform bringing creative photographers and meaningful
            moments together.{" "}
          </p>
          {/* Stat pills */}
          <div className="flex gap-3 pt-2">
            {[
              ["500+", "Vendors"],
              ["10k+", "Events"],
              ["98%", "Satisfaction"],
            ].map(([num, label]) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-center"
              >
                <p className="text-white font-bold text-sm">{num}</p>
                <p className="text-blue-200 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-8 overflow-y-auto">
        <GoogleOAuthProvider clientId={client_id}>
          <div className="w-full max-w-md space-y-5">
            {/* Header */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
                Get started
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                Create your account
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in your details to join EventPro
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submitHandler} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    autoComplete="name"
                    onChange={handleChange}
                    value={formValues.name}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${formErrors.name ? "border-red-400" : "border-gray-200"}`}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    onChange={handleChange}
                    value={formValues.email}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${formErrors.email ? "border-red-400" : "border-gray-200"}`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="contactinfo"
                    type="text"
                    name="contactinfo"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    onChange={handleChange}
                    value={formValues.contactinfo}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${formErrors.contactinfo ? "border-red-400" : "border-gray-200"}`}
                  />
                </div>
                {formErrors.contactinfo && (
                  <p className="text-xs text-red-500">
                    {formErrors.contactinfo}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    onChange={handleChange}
                    value={formValues.password}
                    className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${formErrors.password ? "border-red-400" : "border-gray-200"}`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-xs text-red-500">{formErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    type={showPassword1 ? "text" : "password"}
                    placeholder="••••••••"
                    onChange={handleChange}
                    value={formValues.confirmPassword}
                    className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${formErrors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword1 ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-md shadow-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending OTP…
                  </span>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">
                or continue with
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <div className="flex justify-center">
              <GoogleLogin
                type="standard"
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  showToastMessage("Google signup failed", "error")
                }
              />
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to={USER.LOGIN}
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
            <p className="text-center text-sm text-gray-500 pb-4">
              Would you like to be a vendor?{" "}
              <Link
                to={VENDOR.SIGNUP}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default SignUp;
