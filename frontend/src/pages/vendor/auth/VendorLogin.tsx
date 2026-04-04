import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import type { AxiosError } from "axios";
import axios from "axios";
import { useFormik } from "formik";
import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { USER, VENDOR } from "../../../config/constants/constants";
import type { ErrorResponse} from "../../../hooks/user/useLoginUser";
import { useLoginUser } from "../../../hooks/user/useLoginUser";
import type VendorRootState from "../../../redux/rootstate/VendorState";
import {
  setVendorInfo,
  updateVendorStatus,
} from "../../../redux/slices/VendorSlice";
import { loginValidationSchema } from "../../../validations/common/loginValidate";
import { showToastMessage } from "../../../validations/common/toast";
import { validateEmail } from "../../../validations/user/userVal";


import {
  vendorForgotPassword,
  vendorLogin,
} from "@/services/vendorAuthService";
import type { IFormValues } from "@/utils/interface";
const initialValues: IFormValues = { email: "", password: "" };

const images = [
  "/images/vendorimage1.jpg",
  "/images/vendorimage2.jpg",
  "/images/vendorimage3.jpg",
];

const VendorLogin = () => {
  const vendor = useSelector(
    (state: VendorRootState) => state.vendor.vendorData,
  );
  const [imageIndex, setImageIndex] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [emailError, setEmailError] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showPassword, togglePasswordVisibility } = useLoginUser();

  useEffect(() => {
    if (vendor) navigate(VENDOR.DASHBOARD);
  }, [navigate, vendor]);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setForgotPasswordEmail(email);
    const errors = validateEmail({ email });
    setEmailError(errors.email);
  };

  const handleForgotPassword = async () => {
    try {
      if (!forgotPasswordEmail.trim()) {
        showToastMessage("Please enter a valid email address", "error");
        return;
      }
      if (emailError) {
        showToastMessage(emailError, "error");
        return;
      }
      setIsLoading(true);
      const response = await vendorForgotPassword(forgotPasswordEmail);
      showToastMessage(response.data.message, "success");
      onOpenChange();
      Swal.fire({
        title: "Reset Link Sent!",
        text: "A password reset link has been sent to your email. It will be active for the next 30 minutes.",
        icon: "success",
        timer: 5000,
        timerProgressBar: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          "An error occurred";
        showToastMessage(errorMessage, "error");
      } else {
        showToastMessage("An unexpected error occurred", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: loginValidationSchema,
   onSubmit: async (values) => {
  try {
    const response = await vendorLogin(values);
    const token = response.data.token;
    localStorage.setItem("vendorToken", token);

    dispatch(setVendorInfo(response.data.vendor));

    if (response.data.vendor.isAccepted) {
      dispatch(updateVendorStatus({
        isAccepted: response.data.vendor.isAccepted,
        rejectionReason: response.data.vendor.rejectionReason,
      }));
    }

    showToastMessage(response.data.message, "success");
    navigate(VENDOR.DASHBOARD);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      showToastMessage(
        error.response?.data?.message || "Login failed",
        "error",
      );
    } else {
      showToastMessage("Unexpected error occurred", "error");
    }
  }
},
  });

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
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-indigo-900/80" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">
            bookmystills
          </span>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Grow Your
            <br />
            Vendor Business
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-xs">
            Manage bookings, connect with clients, and scale your event services
            — all in one place.
          </p>
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
        <div className="w-full max-w-md space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
              Vendor Portal
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your credentials to continue
            </p>
          </div>

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
                <p className="text-xs text-red-500">{formik.errors.password}</p>
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
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-md shadow-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">
              vendor access only
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to={VENDOR.SIGNUP}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500">
            Are you a user?{" "}
            <Link
              to={USER.LOGIN}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
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
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
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

export default VendorLogin;
