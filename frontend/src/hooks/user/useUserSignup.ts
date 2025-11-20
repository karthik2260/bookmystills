import React, { useEffect, useState } from "react";







const initialValues : UserFormValues = {
    email : "",
    password : "",
    name : "",
    contactinfo : "",
    confirmPassword : ""
};

const images = [
    '/images/signuppageimage1.jpg',
    '/images/signuppageimage2.jpg',
    '/images/signuppageimage3.jpg'
]


export const useUserSignup = () => {
    const [formValues, setFormValues] = useState(initialValues);
    const [formErrors, setFormErrors] = useState<UserFormValues>(initialValues);
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [imageIndex, setImageIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(false);


























return {
      formValues,
        formErrors,
        images,
        imageIndex,
        isLoading,
        showPassword,
        showPassword1,
        showPassword2,
       
        
}
}