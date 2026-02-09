import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VENDOR } from '../../config/constants/constants';
import { showToastMessage } from '../../validations/common/toast';
import { validate } from '@/validations/vendor/vendorRegVal';
import { VendorFormValues } from '@/types/vendorTypes';
import { useSelector } from 'react-redux';
import VendorRootState from '@/redux/rootstate/VendorState';
import { vendorSignup } from '@/services/vendorAuthService';
 import axios from 'axios';


const images = [
  '/images/vendorimage1.jpg',
  '/images/vendorimage2.jpg',
  '/images/vendorimage3.jpg'
];


const initialValues: VendorFormValues = {
  email: "",
  password: "",
  name: "",
  city: '',
  contactinfo: "",
  confirmPassword: "",
  companyName: "",
  about: "",
};


export const useVendorSignup = () => {
  const vendor = useSelector((state: VendorRootState) => state.vendor.vendorData);
  const [formValues, setFormValues] = useState(initialValues)
  const [formErrors, setFormErrors] = useState<VendorFormValues>(initialValues);
  const [imageIndex, setImageIndex] = useState(0)
  const [activeStep, setActiveStep] = useState(0);
  const [isLastStep, setIsLastStep] = useState(false);
  const [isFirstStep, setIsFirstStep] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (vendor) {
      navigate(VENDOR.DASHBOARD)
    }
  }, [navigate, vendor])


  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [e.target.name]: e.target.value });

    const errors = validate({ ...formValues, [name]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, ...errors }));

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
      const response = await vendorSignup(formValues);

      if (response.data.email) {
        showToastMessage('Otp sent successfully', 'success');

        localStorage.setItem(
          'otpData',
          JSON.stringify({
            otpExpiry: response.data.otpExpiry,
            resendAvailableAt: response.data.resendAvailableAt,
            email: response.data.email,
          })
        );

        navigate(VENDOR.VERIFY);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          showToastMessage('Email already registered', 'error');
          setFormErrors((prev) => ({
            ...prev,
            email: 'Email already registered',
          }));
        } else {
          showToastMessage(
            error.response?.data?.message || 'An error occurred',
            'error'
          );
        }
      } else {
        showToastMessage('Unexpected error occurred', 'error');
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
  };


}
