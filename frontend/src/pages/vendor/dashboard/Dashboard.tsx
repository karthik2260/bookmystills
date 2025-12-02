import VendorNavbar from "@/layout/vendor/VendorNavbar"
import DynamicBackground from '@/components/common/DynamicBackground'




const Dashboard = () => {
    return (
        <>
        <VendorNavbar/>
         <DynamicBackground
        filepath="/images/vendor1.jpg"
        height="h-[550px]"
        type="image"
        className="w-full"
      >
      </DynamicBackground>
        </>
    )
}

export default Dashboard