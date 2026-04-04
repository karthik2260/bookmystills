import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import Loader from "../../../components/common/Loader";
import { USER, VENDOR } from "../../../config/constants/constants";
import { useLoginUser } from "../../../hooks/user/useLoginUser";
import { showToastMessage } from "../../../validations/common/toast";

const client_id = import.meta.env.VITE_CLIENT_ID || "";

const UserLogin: React.FC = () => {
  const {
    user,
    imageIndex,
    images,
    isLoading,
    formik,
    forgotPasswordEmail,
    emailError,
    isOpen,
    showPassword,
    onOpen,
    onOpenChange,
    togglePasswordVisibility,
    handleEmailChange,
    handleForgotPassword,
    handleGoogleSuccess,
  } = useLoginUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(USER.HOME);
  }, [navigate, user]);

  if (isLoading) return <Loader />;

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
            Elevate Your
            <br />
            Event Experience
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
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-10">
        <GoogleOAuthProvider clientId={client_id}>
          <div className="w-full max-w-md space-y-6">
            {/* Header */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
                Welcome back
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                Sign in to your account
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your credentials to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="space-y-4">
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
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition
                                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                            ${formik.touched.email && formik.errors.email ? "border-red-400" : "border-gray-200"}`}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-red-500">{formik.errors.email}</p>
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
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition
                                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                            ${formik.touched.password && formik.errors.password ? "border-red-400" : "border-gray-200"}`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs text-red-500">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Forgot */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onOpen}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  "Sign In"
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
                text="signin_with"
                shape="rectangular"
                onSuccess={handleGoogleSuccess}
                onError={() => showToastMessage("Google login failed", "error")}
              />
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to={USER.SIGNUP}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
            <p className="text-center text-sm text-gray-500">
              Are you a vendor?{" "}
              <Link
                to={VENDOR.LOGIN}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </GoogleOAuthProvider>
      </div>

      {/* ── Forgot Password Modal ── */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        size="sm"
        classNames={{
          base: "bg-white rounded-2xl shadow-xl",
          header: "border-b border-gray-100",
          closeButton: "hidden",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <ModalHeader className="text-lg font-bold text-gray-900">
                Reset Password
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={forgotPasswordEmail}
                      onChange={handleEmailChange}
                      autoComplete="email"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500">{emailError}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    We'll send a reset link to this address.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50"
                >
                  {isLoading ? "Sending…" : "Send Reset Link"}
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserLogin;
