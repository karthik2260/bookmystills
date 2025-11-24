import { NextUIProvider } from "@nextui-org/react"
import { Route } from "lucide-react"
import React from "react"
import { Routes } from "react-router-dom"










const App : React.FC = () => {
    




    return (

        <NextUIProvider>
\            <Routes>
                <Route path="/login" element={<Login />} />
            </Routes>

            
       
        </NextUIProvider>


    )
}

export default App