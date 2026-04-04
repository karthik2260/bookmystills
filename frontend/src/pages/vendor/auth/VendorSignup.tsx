import { Stepper, Step } from "@material-tailwind/react";
import {
  Sparkles,
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  FileText,
  MapPin,
  Upload,
  X,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { USER, VENDOR } from "../../../config/constants/constants";
import { useVendorSignup } from "../../../hooks/vendor/useVendorSignup";

const VendorSignUp = () => {
  const {
    formValues,
    formErrors,
    images,
    imageIndex,
    handleChange,
    handleRemoveImage,
    submitHandler,
    activeStep,
    handleNext,
    handlePrev,
    isLastStep,
    isFirstStep,
    setIsLastStep,
    setIsFirstStep,
    handleFileChange,
    handleAadharChange, // ← add
    handleRemoveAadhar, // ← add
  } = useVendorSignup();

  const steps = ["Account Info", "Business Info"];

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
            Join as a<br />
            Trusted Vendor
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-xs">
            Showcase your services, attract clients, and grow your event
            business on our platform.
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
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-5">
          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
              Vendor Registration
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              Create your vendor account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete both steps to get started
            </p>
          </div>

          {/* Hidden Stepper */}
          <Stepper
            activeStep={activeStep}
            isLastStep={(value) => setIsLastStep(value)}
            isFirstStep={(value) => setIsFirstStep(value)}
            className="hidden pointer-events-none"
            placeholder={undefined}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            <Step
              placeholder={undefined}
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              1
            </Step>
            <Step
              placeholder={undefined}
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              2
            </Step>
          </Stepper>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                  ${i < activeStep ? "bg-blue-600 text-white" : i === activeStep ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-gray-200 text-gray-400"}`}
                >
                  {i < activeStep ? "✓" : i + 1}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${i === activeStep ? "text-blue-600" : "text-gray-400"}`}
                >
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px ${i < activeStep ? "bg-blue-600" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="space-y-4">
            {/* ── Step 0: Account Info ── */}
            {activeStep === 0 && (
              <>
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
                      className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs text-red-500">{formErrors.name}</p>
                  )}
                </div>

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
                      className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.email ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-red-500">{formErrors.email}</p>
                  )}
                </div>

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
                      className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.contactinfo ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  {formErrors.contactinfo && (
                    <p className="text-xs text-red-500">
                      {formErrors.contactinfo}
                    </p>
                  )}
                </div>

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
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      onChange={handleChange}
                      value={formValues.password}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.password ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-red-500">
                      {formErrors.password}
                    </p>
                  )}
                </div>

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
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      onChange={handleChange}
                      value={formValues.confirmPassword}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ── Step 1: Business Info ── */}
            {activeStep === 1 && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="companyName"
                      type="text"
                      name="companyName"
                      placeholder="Your Company"
                      autoComplete="organization"
                      onChange={handleChange}
                      value={formValues.companyName}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.companyName ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  {formErrors.companyName && (
                    <p className="text-xs text-red-500">
                      {formErrors.companyName}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    About
                  </label>
                  <div className="relative">
                    <FileText
                      size={16}
                      className="absolute left-3 top-3 text-gray-400 pointer-events-none"
                    />
                    <textarea
                      id="about"
                      name="about"
                      placeholder="Tell clients about your services…"
                      onChange={(e) =>
                        handleChange(
                          e as unknown as React.ChangeEvent<HTMLInputElement>,
                        )
                      }
                      value={formValues.about}
                      rows={3}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.about ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  {formErrors.about && (
                    <p className="text-xs text-red-500">{formErrors.about}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="city"
                      type="text"
                      name="city"
                      placeholder="e.g. Mumbai"
                      autoComplete="address-level2"
                      onChange={handleChange}
                      value={formValues.city}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm bg-white shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.city ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  {formErrors.city && (
                    <p className="text-xs text-red-500">{formErrors.city}</p>
                  )}
                </div>

                {/* ── Aadhaar Card ── */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Aadhaar Card
                      <span className="text-xs text-gray-400 ml-1 font-normal">
                        (Front & Back)
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">
                    Required for identity verification by admin. Images are kept
                    confidential.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Front */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Front Side
                      </label>
                      <label
                        htmlFor="aadharFront"
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition overflow-hidden
                          ${
                            formValues.aadharImages[0]
                              ? "border-blue-400 bg-blue-50"
                              : formErrors.aadharImages
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
                          }`}
                      >
                        {formValues.aadharImages[0] ? (
                          <img
                            src={URL.createObjectURL(
                              formValues.aadharImages[0],
                            )}
                            alt="Aadhaar Front"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <Upload size={18} className="text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">
                              Upload front
                            </span>
                          </>
                        )}
                        <input
                          id="aadharFront"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAadharChange(e, "front")}
                          className="hidden"
                        />
                      </label>
                      {formValues.aadharImages[0] && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAadhar("front")}
                          className="text-xs text-red-500 hover:underline flex items-center gap-1"
                        >
                          <X size={10} /> Remove
                        </button>
                      )}
                    </div>

                    {/* Back */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Back Side
                      </label>
                      <label
                        htmlFor="aadharBack"
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition overflow-hidden
                          ${
                            formValues.aadharImages[1]
                              ? "border-blue-400 bg-blue-50"
                              : formErrors.aadharImages
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
                          }`}
                      >
                        {formValues.aadharImages[1] ? (
                          <img
                            src={URL.createObjectURL(
                              formValues.aadharImages[1],
                            )}
                            alt="Aadhaar Back"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <Upload size={18} className="text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">
                              Upload back
                            </span>
                          </>
                        )}
                        <input
                          id="aadharBack"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAadharChange(e, "back")}
                          className="hidden"
                        />
                      </label>
                      {formValues.aadharImages[1] && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAadhar("back")}
                          className="text-xs text-red-500 hover:underline flex items-center gap-1"
                        >
                          <X size={10} /> Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Both uploaded success badge */}
                  {formValues.aadharImages[0] && formValues.aadharImages[1] ? (
                    <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                      <ShieldCheck size={12} /> Both sides uploaded — ready for
                      admin verification
                    </p>
                  ) : (
                    formErrors.aadharImages && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <X size={11} /> {formErrors.aadharImages}
                      </p>
                    )
                  )}
                </div>

                {/* ── Portfolio Images ── */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Portfolio Images
                    <span className="text-xs text-gray-400 ml-1 font-normal">
                      (Min 3, Max 5)
                    </span>
                  </label>
                  <label
                    htmlFor="portfolioImages"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <Upload size={20} className="text-gray-400 mb-1" />
                    <span className="text-sm text-gray-500">
                      Click to upload images
                    </span>
                    <span className="text-xs text-gray-400">
                      PNG, JPG, JPEG
                    </span>
                    <input
                      id="portfolioImages"
                      type="file"
                      name="portfolioImages"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {formValues.portfolioImages.length > 0 && (
                    <p className="text-xs text-gray-500">
                      ✅ {formValues.portfolioImages.length} / 5 image(s)
                      selected
                    </p>
                  )}

                  {formValues.portfolioImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {formValues.portfolioImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`preview-${index}`}
                            className="w-full h-16 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {formErrors.portfolioImages && (
                    <p className="text-xs text-red-500">
                      {formErrors.portfolioImages}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ── Navigation Buttons ── */}
            <div className="flex gap-3 pt-1">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  ← Previous
                </button>
              )}
              {!isLastStep ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition"
                >
                  Send OTP
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to={VENDOR.LOGIN}
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500 pb-6">
            Want to register as a user?{" "}
            <Link
              to={USER.SIGNUP}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorSignUp;
