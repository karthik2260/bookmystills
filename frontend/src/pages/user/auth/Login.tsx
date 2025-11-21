import { Card,CardBody,Input,Button, CardFooter } from "@nextui-org/react";
import type React from "react";




const UserLogin : React.FC = () => {


    return (

        <div className="w-full h-screen flex flex-col md:flex-row items-start">
            <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center items-center min-h-screen relative z-10">
               <Card className="w-full max-w-md overflow-hidden" shadow="none" >
                <div className="w-full text-center mt-6 mb-4">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6" style={{fontFamily:'Roboto,sans-serif'}}>
                        LOGIN

                    </h2>

                </div>
                <form>
                     <CardBody className="flex flex-col gap-4 px-4 pb-0">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            name="email"
                            size="md"
                            autoComplete="email"
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                            />
                        </div>


                         <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <Input
                            id="password"
                            type="text"
                            placeholder="••••••••"
                            name="password"
                            size="md"
                            autoComplete="new-password"
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-2 text-md"
                            />

                            <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"


                            />
                        </div>

                        <p className="text-left cursor-pointer">Forgot Password?</p>

                        <div className="flex justify-center mt-2">
                            <Button
                            type="submit"
                            className="bg-black text-white mt-2 rounded-md py-2 px-4 hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                                Sign In 
                            </Button>
                        </div>
                     </CardBody>
                </form>



                <div className="flex justify-center mt-4">
                    

                   

                </div>


                <CardFooter className="pt-0">
                    <p className="mt-2 mb-2 flex justify-center"color="black">Don't have an account?</p>
                    

                </CardFooter>





               </Card>

            </div>

        </div>

    )
}

export default UserLogin