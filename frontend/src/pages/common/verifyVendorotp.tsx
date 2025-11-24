import { useEffect, useState } from "react";
import { Card,CardBody,Button } from "@nextui-org/react";
import { Formik,Form,Field, ErrorMessage } from "formik";
import * as Yup from 'yup'







const images = [
   '/images/otpimg4.jpg',
   './images/otpimg5.jpg',
   './images/otpimg6.jpg'
]


 


const VerifyEmailVendor = () => {



    const [imageIndex,setImageIndex] = useState(0)
    const [timeLeft,setTimeLeft] = useState<number | null>(null)
    const [isLoading,setIsLoading] = useState(false)
    const [resendDisabled,setResendDisabled] = useState(false)






useEffect(() => {
    const interval = setInterval(() => {
        setImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    },3000)
    return () => clearInterval(interval)
},[])


  const validationSchema = Yup.object().shape({
    otp: Yup.string()
      .required('OTP is required')
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(4, 'Must be exactly 4 digits')
      .max(4, 'Must be exactly 4 digits')
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

return (

    <div className="w-full h-screen flex flex-col md:flex-row items-start">
        <div 
        className={`${imageIndex % 2 === 0
          ? 'bg-gradient-to-r from-blue-600 to-indigo-900'
          : ''
          } w-full h-screen md:w-1/2 object-cover md:static absolute top-0 left-0 z-0 transition-all duration-1000 ease-in-out`}
        style={{
          backgroundImage: `url(${images[imageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
         <h1 className="animate-fadeIn text-4xl md:text-4xl text-white font-bold mt-20 mx-4 md:block hidden">
          Elevate Your Event Experience
        </h1>
        <p className="animate-slideIn text-xl md:text-2xl text-white font-normal mt-5 mx-4 md:block hidden">
          Find, Connect, and Collaborate with Top Event Planners
        </p>

        </div >


        <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center items-center min-h-screen relative z-10">
        <Card className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="w-full text-center mt-6 mb-4">
                <h2 className="text-3xl font-extrabold text-gray-900">
                    VERIFY OTP
                </h2>

            </div>

            <Formik 
            initialValues={{otp:''}}
            validationSchema={validationSchema}
            
            >

                <CardBody className="flex flex-col gap-4 px-4">
                    <Form className="space-y-4">
                        <div>
                            <Field
                            type="text"
                            name='otp'
                            placeholder="Enter OTP"
                            className="w-full px-3 py-2 border rounded-md"
                            

                           />
                           <ErrorMessage name="otp" component="div" className="text-red-500 text-sm mt-1"/>


                        </div>
                        {timeLeft !== null && (
  <span
    className="block text-center"
    style={{ color: timeLeft > 0 ? "blue" : "red" }}
  >
    {timeLeft > 0
      ? `Time remaining: ${formatTime(timeLeft)}`
      : "OTP has expired"}
  </span>
)}

<div className="flex justify-between gap-4">
    <Button
    type="button"
    color="gray"
    placeholder={undefined}


    
    
    >

    </Button>

</div>


                    </Form>

                </CardBody>

            </Formik>

            

        </Card>
        

        </div>

    </div>
)


}

export default VerifyEmailVendor;