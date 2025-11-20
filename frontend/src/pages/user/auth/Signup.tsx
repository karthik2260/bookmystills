
import { Eye, EyeOff } from 'lucide-react';
import { useUserSignup } from "../../../hooks/user/useUserSignup"


const Signup = () => {
    
   const {imageIndex,images,formErrors,showPassword,showPassword1,isLoading} = useUserSignup()
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

        <div className="w-full text-center mt-6 mb-4">
            <h2 className="text-3xl font-extrabold text-gray-900"style={{ fontFamily: 'Lemon, sans-serif' }}>
               SIGN UP
            </h2>
        </div>

        <form >
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mr-3">Name</label>
                
                id="name"
                type="text"
                placeholder="Name"
                name="name"
                size="md"
                                 
                autoComplete="name"
                
                
               {formErrors.name ? (
                    <p
                      className="text-sm"
                      style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                    >
                      {formErrors.name}
                    </p>
                  ) : null}
                
            </div>

                  <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>

                    id="email"
                    type="email"
                    placeholder="Email"
                    
                    
                    name="email"
                    size="md"
                    crossOrigin={undefined}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="email"
                  
                  {formErrors.email ? (
                    <p
                      className="text-sm"
                      style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                    >
                      {formErrors.email}
                    </p>
                  ) : null}
                </div>

                 <div>
                  <label htmlFor="contactinfo" className="block text-sm font-medium text-gray-700">Phone</label>
                  

                    id="contactinfo"
                    type="text"
                    placeholder="Phone"
                  
                    
                    name="contactinfo"
                    size="md"
                    crossOrigin={undefined}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="contactinfo"
                  {formErrors.contactinfo ? (
                    <p
                      className="text-sm"
                      style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                    >
                      {formErrors.contactinfo}
                    </p>
                  ) : null}
                </div>
                  <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      
                  
                      name="password"
                      size="md"
                      crossOrigin={undefined}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md pr-10"
                      autoComplete="new-password"
                
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      
                    >
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                   <div className="relative">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">

                      id="confirm-password"
                      type={showPassword1 ? "text" : "password"}
                      placeholder="••••••••"
                     
                      
                      name="confirmPassword"
                      size="md"
                      crossOrigin={undefined}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                      autoComplete="new-password"
                    
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      
                    >
                      {showPassword1 ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  {formErrors.confirmPassword ? (
                    <p
                      className="text-sm"
                      style={{ color: "red", marginBottom: -15, marginTop: 5 }}
                    >
                      {formErrors.confirmPassword}
                    </p>
                  ) : null}
                </div>

                 <div className="flex justify-center mt-2">
                  
                    type="submit"
                    variant="gradient"
                    className="bg-black text-white mt-1 rounded-md py-2 px-4 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 flex items-center justify-center"
                    disabled={isLoading}
                  
                    {isLoading ? (
                      <>
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                 
                </div>





        </form>


      

      </div>
    </div>



    )
}



export default Signup