import SidebarVendor from "@/layout/vendor/SidebarProfileVendor";
import { Role } from "@/utils/enums";
import { RevenueChartProps } from "@/utils/interface";




const RevenueChart : React.FC<RevenueChartProps> = ({role}) => {






    return (
          
            <div className="flex">
              <div>
      {role === Role.Vendor && <SidebarVendor />}
      </div>
          </div>
    )
}

export default RevenueChart