import { Card, CardBody, Input, Button, CardFooter } from "@nextui-org/react";
import { useUserSignup } from "../../../hooks/user/useUserSignup";

const Signup = () => {
  const {imageIndex,images,handleChange} = useUserSignup()
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
        {/* Animated text */}
        <h1 className="animate-fadeIn text-4xl md:text-4xl text-white font-bold mt-20 mx-4 md:block hidden">
          Elevate Your Event Experience
        </h1>
        <p className="animate-slideIn text-xl md:text-2xl text-white font-normal mt-5 mx-4 md:block hidden">
          Find, Connect, and Collaborate
        </p>
      </div>
      <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center items-center min-h-screen relative z-10">
        <Card className="w-full max-w-md overflow-hidden" shadow="none">
          <div className="w-full text-center mt-6 mb-4">
            <h2 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
              SIGN UP
            </h2>
<p className="text-sm text-gray-600 mt-2">Create your account to get started</p>
          </div>

          <form>
            <CardBody className="flex flex-col gap-4 px-4 pb-0">
             <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                            <Input
                              id="name"
                              type="text"
                              placeholder="Name"
                              onChange={handleChange}
                              name="name"
                              size="lg"
                              autoComplete="name"
                              className="w-full"
                              classNames={{
                                input: "bg-gray-50",
                                inputWrapper: "bg-gray-50 border-0"
                              }}
                            />
                          </div>

              <div>
                             <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                             <Input
                               id="email"
                               type="email"
                               placeholder="Email"
                               name="email"
                               size="lg"
                               autoComplete="email"
                               className="w-full"
                               classNames={{
                                 input: "bg-gray-50",
                                 inputWrapper: "bg-gray-50 border-0"
                               }}
                             />
                           </div>

               <div>
                              <label htmlFor="contactinfo" className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                              <Input
                                id="contactinfo"
                                type="text"
                                placeholder="Phone"
                                name="contactinfo"
                                size="lg"
                                autoComplete="new-contactinfo"
                                className="w-full"
                                classNames={{
                                  input: "bg-gray-50",
                                  inputWrapper: "bg-gray-50 border-0"
                                }}
                              />
                            </div>

              <div>
                              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                              <Input
                                id="password"
                                type="text"
                                placeholder="••••••••"
                                name="password"
                                size="lg"
                                autoComplete="new-password"
                                className="w-full"
                                classNames={{
                                  input: "bg-gray-50",
                                  inputWrapper: "bg-gray-50 border-0"
                                }}
                              />
                            </div>

                <div>
                              <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                              <Input
                                id="confirm-password"
                                type="text"
                                placeholder="••••••••"
                                name="confirmPassword"
                                size="lg"
                                autoComplete="new-password"
                                className="w-full"
                                classNames={{
                                  input: "bg-gray-50",
                                  inputWrapper: "bg-gray-50 border-0"
                                }}
                              />
                            </div>
               <div className="flex justify-center mt-2">
                              <Button
                                type="submit"
                                size="lg"
                                className="w-full bg-black text-white rounded-lg py-3 hover:bg-gray-800 font-semibold"
                              >
                                Send OTP
                              </Button>
                            </div>
            </CardBody>
          </form>

     <CardFooter className="pt-4 pb-6 flex flex-col items-center gap-2">
                <p className="text-gray-700 text-sm text-center">
                 Already have an account?
                  <span className="ml-1 font-bold text-black cursor-pointer hover:underline">Login</span>
                </p>
    
                <p className="text-gray-700 text-sm text-center">
                  Would you like to be a vendor?
                  <span className="ml-1 font-bold text-black cursor-pointer hover:underline">Signup here</span>
                </p>
              </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;