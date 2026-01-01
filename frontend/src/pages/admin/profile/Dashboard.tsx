import DashboardDetails from "@/components/admin/dashboard/DashboardDetails"
import RevenueChart from "@/components/admin/dashboard/RevenueChart"
import { Role } from "@/utils/enums"




const Dashboard = () => {
    return (
        <>
        <DashboardDetails/>
        <RevenueChart role={Role.Admin}/>
        
        </>
    )
}

export default Dashboard