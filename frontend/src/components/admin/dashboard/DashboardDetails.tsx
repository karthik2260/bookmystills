import { Box, Grid } from "@mui/material"
import Typography from "@mui/material/Typography"
import { useState } from "react";





interface DashboardCard {
  title : string;
  count:string;
  icon:string;
  description:string;
  trend?:string
}







const DashboardDetails = () => {

const [dashboardCards,setDashboardCards] = useState<DashboardCard[]>([])






  return (
         <Box sx={{flexGrow:1,p:3}}>
            <Typography variant="h4" gutterBottom >
                Dashboard Overview
            </Typography>
            <Grid container spacing={3}>
             

            </Grid>
         </Box>

  )
}


export default DashboardDetails