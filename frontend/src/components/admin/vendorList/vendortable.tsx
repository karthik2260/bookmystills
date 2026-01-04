import { axiosInstanceAdmin } from "@/config/api/axiosinstance";
import { AcceptanceStatus, VendorData, VendorResponse } from "@/types/vendorTypes";
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Input, Switch, Tab, Tabs, TabsHeader, Typography } from "@material-tailwind/react";
import { useCallback, useEffect, useState } from "react";
import {debounce} from 'lodash'
import { TABS } from "@/utils/enums";
import Loader from "@/components/common/Loader";
import Swal from "sweetalert2";
import { showToastMessage } from "@/validations/common/toast";
import { useDispatch } from "react-redux";
import VendorDetailsModal from "./viewdetails";

const TABLE_HEAD = ["VendorName", 'Company Name', "Mobile", "Joined-At", "Status", 'Reported', "Actions", 'View Details', 'Verify'];


export function SortableTableVendor () {
    
const [searchTerm,setSearchTerm] = useState('')
const [currentPage,setCurrentPage] = useState(1)
const [isLoading,setIsLoading] = useState(false)
const [activeTab,setAciveTab] = useState('all')
const [vendors,setVendors] = useState<VendorData[]>([])
const [totalPages,setTotalPages] = useState(1)
const [isModalOpen,setIsModaalOpen] = useState(false)
const [selectedVendor,setSelectedVendor] = useState<VendorData | null>(null)

const fetchData = useCallback(async(page?:number,search?:string) => {
    setIsLoading(true);

    try {
        const response = await axiosInstanceAdmin.get<VendorResponse>('/vendors',{
            params:{
                page:page,
                limit:5,
                search:search,
                status:activeTab !== 'all' ? activeTab : undefined
            }
        });

        const transformedVendors : VendorData[] = response.data.vendors.map((vendor) => ({
            ...vendor._doc,
            imageUrl:vendor.imageUrl
        }));
        setVendors(transformedVendors);
        setTotalPages(response.data.totalPages)
    } catch (error) {
        console.error('Error fetching details:',error)
    } finally {
        setIsLoading(false)
    }
},[activeTab])



 const handleCloseModal = () => {
        setIsModaalOpen(false);
        setSelectedVendor(null);
    };










const debouncedFetchData = useCallback(
    debounce(fetchData,500),
    [fetchData]
)



 useEffect(() => {
    if (searchTerm.trim().length >= 3) {
      debouncedFetchData(currentPage, searchTerm);
    } else if (searchTerm.trim() === '') {
      debouncedFetchData(currentPage, '');
    }
    return () => {
      debouncedFetchData.cancel();
    };
  }, [currentPage, searchTerm, debouncedFetchData]);


 const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };
 const handleTabChange = (value: string) => {
        setAciveTab(value);
        setCurrentPage(1);
    };

 const handleVerifyVendor = useCallback(async (vendorId: string) => {
        setIsLoading(true)
        const result = await Swal.fire({
            title: 'Verify Vendor',
            text: 'Do you want to accept or reject this vendor?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Accept',
            cancelButtonText: 'Reject'
        });

        let status: AcceptanceStatus;
        if (result.isConfirmed) {
            status = AcceptanceStatus.Accepted;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            status = AcceptanceStatus.Rejected;
        } else {
            return;
        }

        try {
            const response = await axiosInstanceAdmin.put(`/vendors/${vendorId}/status`, { status });
            showToastMessage(response.data.message, 'success');
            setVendors(prevVendors =>
                prevVendors.map(vendor =>
                    vendor._id === vendorId
                        ? { ...vendor, isAccepted: status, isActive: status === AcceptanceStatus.Accepted }
                        : vendor
                )
            );
        } catch (error) {
            console.error('Error verifying vendor:', error);
            showToastMessage('Failed to verify vendor', 'error');
        } finally {
            setIsLoading(false)
        }
    }, [])










    return (

        <div className="max-w-7xl mt-5 mx-auto px-4 sm:px-6 lg:px-8">
            <CardHeader floated={false} shadow={false} className="rounded-none p-4 -mt-7 mb-4">
                <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
                    <Typography variant="h5"
                        color="blue-gray"
                        className="text-center text-2xl lg:text-3xl md:text-2xl sm:text-xl"
                        placeholder={undefined}>

                            VENDOR MANAGEMENT

                    </Typography>

                    <div className="w-full lg:w-1/3 md:w-1/2 sm:w-full">
                    <Input
                    label="Search"
                    value={searchTerm}
                    onChange={handleSearch}
               
                    placeholder="Search vendors..."
                    className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 rounded-xl"
                    labelProps={{
                        ClassNames:'hidden',
                    }}
                    containerProps={{
                        ClassName:"min-w-[100px] relative"
                    }}
                    
                    />

                    </div>
                </div>

                <div className="mt-6">
                    <Tabs 
                    value={activeTab} className="w-full"
                    >
                        <TabsHeader
                        className="w-full lg:w-max md:w-3/4 sm:w-full mx-auto"
                        placeholder={undefined}
                        
                        >

                            {TABS.map(({label,value}) => (
                                <Tab
                                key={value}
                                value={value}
                                placeholder={undefined}
                                onClick={() => handleTabChange(value)}
                                  className={`
              ${activeTab === value ? "text-gray-900" : ""}
              text-sm lg:text-base px-8 md:text-sm sm:text-xs 
            `}
                                
                                >
                                    {label}


                                </Tab>
                            ))}


                        </TabsHeader>

                    </Tabs>

                </div>

            </CardHeader>

            <Card className="w-full" placeholder={undefined}>
                 

                 <CardBody className="overflow-x-auto px-0" placeholder={undefined}>
                          <table className="w-full min-w-max table-auto text-left">

                            <thead>

                                <tr>
                                      {TABLE_HEAD.map((head) => (
                                    <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            placeholder={undefined}
                                           
                                            className="font-normal leading-none opacity-70"
                                        >
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                                </tr>


                            </thead>

                            <tbody>

                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center p-4"><Loader /></td></tr>
                            ) : vendors.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-4">No vendors found</td></tr>
                            ) : (
                                vendors.map((vendor, index) => (
                                    <tr key={index} className="even:bg-blue-gray-50/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar src={vendor?.imageUrl || "/images/user.png"} alt={vendor.name} size="sm" placeholder={undefined}
                                                    onPointerEnterCapture={undefined}
                                                    onPointerLeaveCapture={undefined} />
                                                <div className="flex flex-col">
                                                    <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined}
                                                        onPointerEnterCapture={undefined}
                                                        onPointerLeaveCapture={undefined}>
                                                        {vendor.name}
                                                    </Typography>
                                                    <Typography variant="small" color="blue-gray" className="font-normal opacity-70" placeholder={undefined}
                                                        onPointerEnterCapture={undefined}
                                                        onPointerLeaveCapture={undefined}>
                                                        {vendor.email}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}>
                                                {vendor.companyName || "Not Added"}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}>
                                                {vendor.contactinfo || "Not Added"}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}>
                                                {new Date(vendor.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </td>


                                        <td className="p-4">
                                            <div className={`w-max rounded-full ${vendor.isActive ? 'bg-green-100' : 'bg-red-100'} px-2 py-1`}>
                                                <Typography variant="small" className={vendor.isActive ? 'text-green-700' : 'text-red-700'} placeholder={undefined}
                                                    onPointerEnterCapture={undefined}
                                                    onPointerLeaveCapture={undefined}>
                                                    {vendor.isActive ? "Active" : "Inactive"}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div
                                               
                                            >
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray" placeholder={undefined}
                                                    onPointerEnterCapture={undefined}
                                                    onPointerLeaveCapture={undefined}
                                                    className={`font-normal rounded-md text-black`} 
                                                >
                                                    { "0"}
                                                </Typography>
                                            </div>
                                        </td>


                                        <td className="p-4">
                                            <div className="w-max flex justify-center items-center">
                                                {(vendor.isAccepted === AcceptanceStatus.Requested || vendor.isAccepted === AcceptanceStatus.Rejected) ? (
                                                    <Switch
                                                        id={`custom-switch-component-${vendor._id}`}
                                                        ripple={false}
                                                        color={vendor.isActive ? "green" : "red"}
                                                        checked={vendor.isActive}
                                                       

                                                        crossOrigin={undefined}
                                                        placeholder={undefined}
                                                        onPointerEnterCapture={undefined}
                                                        onPointerLeaveCapture={undefined}
                                                        className={`h-6 w-12 ${vendor.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                                                        containerProps={{
                                                            className: "relative inline-block w-12 h-6",
                                                        }}
                                                        disabled={true}
                                                        circleProps={{
                                                            className: `absolute left-0.5  w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out ${vendor.isActive ? 'translate-x-6' : ''
                                                                }`
                                                        }}
                                                    />
                                                ) : (
                                                    <Switch
                                                        id={`custom-switch-component-${vendor._id}`}
                                                        ripple={false}
                                                        color={vendor.isActive ? "green" : "red"}
                                                        checked={vendor.isActive}
                                                       

                                                        crossOrigin={undefined}
                                                        placeholder={undefined}
                                                        onPointerEnterCapture={undefined}
                                                        onPointerLeaveCapture={undefined}
                                                        className={`h-6 w-12 ${vendor.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                                                        containerProps={{
                                                            className: "relative inline-block w-12 h-6",
                                                        }}
                                                        circleProps={{
                                                            className: `absolute left-0.5  w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out ${vendor.isActive ? 'translate-x-6' : ''
                                                                }`
                                                        }}
                                                    />
                                                )}

                                            </div>
                                        </td>

                                        <td className="p-4">

                                            <Button
                                                size="sm"
                                                variant="outlined"
                                                className="flex items-center gap-2" placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}
                                              
                                            >
                                                View Details
                                            </Button>

                                        </td>

                                        <td className="p-4">
                                            <div className="w-max flex justify-center items-center">
                                                {vendor.isAccepted === AcceptanceStatus.Requested ? (
                                                    <Switch
                                                        id={`verify-switch-${vendor._id}`}
                                                        ripple={false}
                                                        color={vendor.isActive ? "green" : "red"}
                                                        checked={vendor.isActive}
                                                        onChange={() => handleVerifyVendor(vendor._id)}

                                                        crossOrigin={undefined}
                                                        placeholder={undefined}
                                                        onPointerEnterCapture={undefined}
                                                        onPointerLeaveCapture={undefined}
                                                        className={`h-6 w-12 ${vendor.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                                                        containerProps={{
                                                            className: "relative inline-block w-12 h-6",
                                                        }}
                                                        circleProps={{
                                                            className: `absolute left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out ${vendor.isActive ? 'translate-x-6' : ''
                                                                }`
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography
                                                        variant="small"
                                                        placeholder={undefined}
                                                        onPointerEnterCapture={undefined}
                                                        onPointerLeaveCapture={undefined}
                                                        color={vendor.isAccepted === AcceptanceStatus.Accepted ? "green" : "red"}
                                                    >
                                                        {vendor.isAccepted === AcceptanceStatus.Accepted ? "Accepted" : "Rejected"}
                                                    </Typography>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                            


                          </table>
                 </CardBody>
                  <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4" placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}>
                    <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}>
                        Page {currentPage} of {totalPages}
                    </Typography>
                    <div className="flex gap-2">
                        <Button
                            variant="outlined"
                            size="sm"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            size="sm"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            </Card>

        <VendorDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                vendor={selectedVendor}
            />
          
 </div>
                        )
            

        



                        

    
}
