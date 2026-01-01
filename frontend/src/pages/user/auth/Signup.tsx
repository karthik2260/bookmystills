import {
  CardBody,
  CardFooter,
  Typography,
  Input,
  Button,
  Spinner,
  Card
} from "@material-tailwind/react";
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { USER, VENDOR } from '../../../config/constants/constants';
import { showToastMessage } from '../../../validations/common/toast';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useUserSignUp } from "@/hooks/user/useUserSignup";

const client_id = import.meta.env.VITE_CLIENT_ID || '';

const SignUp = () => {
  const { 
    formValues, 
    formErrors, 
    imageIndex, 
    images, 
    isLoading, 
    showPassword, 
    showPassword1, 
    handleChange, 
    submitHandler, 
    handleGoogleSuccess, 
    togglePasswordVisibility, 
    togglePasswordVisibility1 
  } = useUserSignUp();

  return (
    <div className="w-full h-screen flex flex-col md:flex-row items-start">
      <div
        className={`${
          imageIndex % 2 === 0
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
          Find, Connect, and Collaborate
        </p>
      </div>

      <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center items-center min-h-screen relative z-10">
        <GoogleOAuthProvider clientId={client_id}>
          <Card className="w-full max-w-md overflow-hidden">
            <div className="w-full text-center mt-6 mb-4">
              <h2 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                SIGN UP
              </h2>
            </div>

            <form onSubmit={submitHandler}>
              <CardBody className="flex flex-col gap-4 px-4 pb-0">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mr-3">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Name"
                    onChange={handleChange}
                    value={formValues.name}
                    name="name"
                    size="md"
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="name"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    onChange={handleChange}
                    value={formValues.email}
                    name="email"
                    size="md"
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="email"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contactinfo" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <Input
                    id="contactinfo"
                    type="text"
                    placeholder="Phone"
                    onChange={handleChange}
                    value={formValues.contactinfo}
                    name="contactinfo"
                    size="md"
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="contactinfo"
                  />
                  {formErrors.contactinfo && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.contactinfo}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={handleChange}
                      value={formValues.password}
                      name="password"
                      size="md"
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={togglePasswordVisibility}
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
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPassword1 ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={handleChange}
                      value={formValues.confirmPassword}
                      name="confirmPassword"
                      size="md"
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={togglePasswordVisibility1}
                    >
                      {showPassword1 ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>

               <div className="mt-4 flex justify-center">
  <Button
    type="submit"
    disabled={isLoading}
    className="
      w-full max-w-sm
      flex items-center justify-center gap-2
      rounded-lg bg-blue-600 px-4 py-2.5
      text-sm font-semibold text-white
      transition-all duration-200
      hover:bg-blue-700
      focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
      disabled:cursor-not-allowed disabled:opacity-70
    "
  >
    {isLoading ? (
      <>
        <Spinner className="h-4 w-4" />
        Sending OTP...
      </>
    ) : (
      "Send OTP"
    )}
  </Button>
</div>

              </CardBody>
            </form>

           <div className="mt-6 flex justify-center">
  <div className="w-full max-w-sm">
    <div className="flex justify-center rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md">
      <GoogleLogin
        type="standard"
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        onSuccess={handleGoogleSuccess}
        onError={() => {
          showToastMessage("Google login failed", "error");
        }}
      />
    </div>
  </div>
</div>

            <CardFooter className="pt-0">
              <Typography
                variant="small"
                className="mt-2 mb-2 flex justify-center"
                color="black"
              >
                Already have an account?
                <Link to={USER.LOGIN}>
                  <Typography
                    as="a"
                    href="#"
                    variant="small"
                    color="black"
                    className="ml-1 font-bold"
                  >
                    Login
                  </Typography>
                </Link>
              </Typography>
              <Typography
                variant="small"
                className="mt-1 flex justify-center pb-2"
                color="black"
              >
                Would you like to be a vendor?
                <Link to={VENDOR.SIGNUP}>
                  <Typography
                    as="a"
                    href="#signup"
                    variant="small"
                    color="black"
                    className="ml-1 font-bold"
                  >
                    Signup here
                  </Typography>
                </Link>
              </Typography>
            </CardFooter>
          </Card>
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default SignUp;