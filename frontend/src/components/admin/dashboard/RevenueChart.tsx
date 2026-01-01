import SidebarVendor from "@/layout/vendor/SidebarProfileVendor";
import { Role } from "@/utils/enums";
import { RevenueChartProps } from "@/utils/interface";






const RevenueChart : React.FC<RevenueChartProps> = ({role}) => {
    return (
          <div>
            <div className="flex">
                {(role === Role.Vendor || role === Role.Admin) && <SidebarVendor/>}

            </div>
          </div>
    )
}

export default RevenueChart