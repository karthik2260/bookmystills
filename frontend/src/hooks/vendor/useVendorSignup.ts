import axios from "axios";
import type React from "react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { VENDOR } from "../../config/constants/constants";
import { showToastMessage } from "../../validations/common/toast";

import type VendorRootState from "@/redux/rootstate/VendorState";
import { vendorSignup } from "@/services/vendorAuthService";
import type { VendorFormErrorValues, VendorFormValues } from "@/types/vendorTypes";
import { validate } from "@/validations/vendor/vendorRegVal";


const images = [
  "/images/vendorimage1.jpg",
  "/images/vendorimage2.jpg",
  "/images/vendorimage3.jpg",
];

const initialValues: VendorFormValues = {
  email: "",
  password: "",
  name: "",
  city: "",
  contactinfo: "",
  confirmPassword: "",
  companyName: "",
  about: "",
  portfolioImages: [],
  aadharImages: [],
};

const initialErrorValues: VendorFormErrorValues = {
  email: "",
  password: "",
  name: "",
  city: "",
  contactinfo: "",
  confirmPassword: "",
  companyName: "",
  about: "",
  portfolioImages: "",
  aadharImages: "",
};

export const useVendorSignup = () => {
  const vendor = useSelector(
    (state: VendorRootState) => state.vendor.vendorData,
  );
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] =
    useState<VendorFormErrorValues>(initialErrorValues);
  const [imageIndex, setImageIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isLastStep, setIsLastStep] = useState(false);
  const [isFirstStep, setIsFirstStep] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (vendor) {
      navigate(VENDOR.DASHBOARD);
    }
  }, [navigate, vendor]);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [e.target.name]: e.target.value });

    const errors = validate({ ...formValues, [name]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, ...errors }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);

    const updated = [...formValues.portfolioImages, ...newFiles];

    const capped = updated.slice(0, 5);

    setFormValues((prev) => ({ ...prev, portfolioImages: capped }));

    const errors = validate({ ...formValues, portfolioImages: capped });
    setFormErrors((prev) => ({
      ...prev,
      portfolioImages: errors.portfolioImages,
    }));

    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const updated = formValues.portfolioImages.filter((_, i) => i !== index);
    setFormValues((prev) => ({ ...prev, portfolioImages: updated }));
    const errors = validate({ ...formValues, portfolioImages: updated });
    setFormErrors((prev) => ({
      ...prev,
      portfolioImages: errors.portfolioImages,
    }));
  };

  const handleAadharChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const updated = [...formValues.aadharImages];
    updated[side === "front" ? 0 : 1] = file;

    setFormValues((prev) => ({ ...prev, aadharImages: updated }));
    const errors = validate({ ...formValues, aadharImages: updated });
    setFormErrors((prev) => ({ ...prev, aadharImages: errors.aadharImages }));
    e.target.value = "";
  };

  const handleRemoveAadhar = (side: "front" | "back") => {
    const updated = [...formValues.aadharImages];
    updated[side === "front" ? 0 : 1] = undefined as unknown as File;
    const filtered = updated.filter(Boolean); // remove undefined slots
    setFormValues((prev) => ({ ...prev, aadharImages: filtered }));
    const errors = validate({ ...formValues, aadharImages: filtered });
    setFormErrors((prev) => ({ ...prev, aadharImages: errors.aadharImages }));
  };

  const handleNext = () => {
    if (activeStep < 1) {
      setActiveStep((cur) => cur + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((cur) => cur - 1);
    }
  };

  const submitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const errors = validate(formValues);
    setFormErrors(errors);

    if (Object.values(errors).every((error) => error === "")) {
      try {
        const formData = new FormData();

        formData.append("email", formValues.email);
        formData.append("password", formValues.password);
        formData.append("name", formValues.name);
        formData.append("city", formValues.city);
        formData.append("contactinfo", formValues.contactinfo);
        formData.append("companyName", formValues.companyName);
        formData.append("about", formValues.about);

        formValues.portfolioImages.forEach((file) => {
          formData.append("portfolioImages", file);
        });

        if (formValues.aadharImages[0])
          formData.append("aadharFront", formValues.aadharImages[0]);
        if (formValues.aadharImages[1])
          formData.append("aadharBack", formValues.aadharImages[1]);

        const response = await vendorSignup(formData);

        if (response.data.email) {
          showToastMessage("Otp sent successfully", "success");

          localStorage.setItem(
            "otpData",
            JSON.stringify({
              otpExpiry: response.data.otpExpiry,
              resendAvailableAt: response.data.resendAvailableAt,
              email: response.data.email,
            }),
          );

          navigate(VENDOR.VERIFY);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 409) {
            showToastMessage("Email already registered", "error");
            setFormErrors((prev) => ({
              ...prev,
              email: "Email already registered",
            }));
          } else {
            showToastMessage(
              error.response?.data?.message || "An error occurred",
              "error",
            );
          }
        } else {
          showToastMessage("Unexpected error occurred", "error");
        }
      }
    }
  };

  return {
    formValues,
    formErrors,
    imageIndex,
    images,
    handleChange,
    submitHandler,
    activeStep,
    handleNext,
    handlePrev,
    isLastStep,
    isFirstStep,
    setIsLastStep,
    setIsFirstStep,
    handleFileChange,
    handleRemoveImage,
    handleAadharChange,
    handleRemoveAadhar,
  };
};
