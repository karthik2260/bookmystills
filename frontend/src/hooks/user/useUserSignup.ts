import { useEffect, useState } from "react"
import type { UserFormValues } from "../../types/userTypes"



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


    useEffect(() => {
        const interval = setInterval(() => {
            setImageIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 3000)
        return () => clearInterval(interval)
    },[])


    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const {name,value} = e.target;
        setFormValues({...formValues,[e.target.name]:e.target.value})
        
    }


    return {
        imageIndex,
        images,
        formValues,
        handleChange
    }
}