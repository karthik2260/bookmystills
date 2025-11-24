import { useEffect, useState } from "react"
import type { UserFormValues } from "../../types/userTypes"
import { validate } from "../../validations/user/userVal"



const initialValues:UserFormValues = {
    email:"",
    password:"",
    name:"",
    contactinfo:"",
    confirmPassword:""
}



const images = [
    '/images/signuppageimage1.jpg',
    '/images/signuppageimage2.jpg',
    '/images/signuppageimage3.jpg'
]





export const useUserSignup = () => {
    const [imageIndex,setImageIndex] = useState(0)
    const[formValues,setFormValues] = useState(initialValues)
    const [formErrors,setFormErrors] = useState<UserFormValues>(initialValues)
    const[showPassword,setShowPassword] = useState(false);
    const [showPassword1,setShowPassword1] = useState(false);
    const[showPassword2,setShowPassword2] = useState(false);


    useEffect(() => {
        const interval = setInterval(() => {
            setImageIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 3000)
        return () => clearInterval(interval)
    },[])


    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const {name,value} = e.target;
        setFormValues({...formValues,[e.target.name]:e.target.value})
        
    

    const errors = validate({...formValues,[name]:value});
    setFormErrors((prevErrors) => ({...prevErrors, ...errors}));
    }

    const togglepasswordVisibility = () => {
        setShowPassword(!showPassword)
    }
     const togglePasswordVisibility1 = () => {
        setShowPassword1(!showPassword1);
      };
      const togglePasswordVisibility2 = () => {
        setShowPassword2(!showPassword2);
      };

    return {
        imageIndex,
        images,
        formValues,
        handleChange,
        formErrors,
        togglepasswordVisibility,
        togglePasswordVisibility1,
        togglePasswordVisibility2,
        showPassword,
        showPassword1,
        showPassword2
    }
}