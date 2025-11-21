import { Card, CardBody, Input, Button, CardFooter } from "@nextui-org/react";

const Signup = () => {
  return (
    <div className="w-full h-screen flex flex-col md:flex-row items-start">
      <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center items-center min-h-screen relative z-10">
        <Card className="w-full max-w-md overflow-hidden" shadow="none">
          <div className="w-full text-center mt-6 mb-4">
            <h2 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
              SIGN UP
            </h2>
          </div>

          <form>
            <CardBody className="flex flex-col gap-4 px-4 pb-0">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Name"
                  name="name"
                  size="md"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  name="email"
                  size="md"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="contactinfo" className="block text-sm font-medium text-gray-700">Phone</label>
                <Input
                  id="contactinfo"
                  type="text"
                  placeholder="Phone"
                  name="contactinfo"
                  size="md"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                  autoComplete="tel"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    name="password"
                    size="md"
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    name="confirmPassword"
                    size="md"
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="flex justify-center mt-2">
                <Button
                  type="submit"
                  variant="flat"
                  className="bg-black text-white mt-1 rounded-md py-2 px-4 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 flex items-center justify-center"
                >
                  Send OTP
                </Button>
              </div>
            </CardBody>
          </form>

          <CardFooter className="pt-0 flex flex-col items-center">
            <p className="mt-2 mb-2 text-black text-sm text-center">
              Already have an account?
              <a href="#" className="ml-1 font-bold">Login</a>
            </p>

            <p className="mt-1 mb-2 text-sm text-center">
              Would you like to be a vendor?
              <a href="#" className="ml-1 font-bold">Signup here</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;