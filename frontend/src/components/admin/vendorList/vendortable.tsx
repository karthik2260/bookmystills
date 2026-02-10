import React, { useCallback, useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    Input,
    Typography,
    Button,
    CardBody,
    CardFooter,
    Tabs,
    TabsHeader,
    Tab,
    Avatar,
    Switch,
} from "@material-tailwind/react";
import { showToastMessage } from '../../../validations/common/toast';
import { debounce } from 'lodash';
import Swal from 'sweetalert2';
import { AcceptanceStatus, VendorData, VendorResponse } from '../../../types/vendorTypes';
import VendorDetailsModal from './viewdetails';
import Loader from '../../common/Loader';
import { TABS } from '@/utils/enums';
import { axiosInstanceAdmin } from '@/config/api/axiosinstance';


const TABLE_HEAD = ["Vendor", "Mobile", "Joined", "Status", 'Reports', "Actions", 'Details', 'Verify'];

export function SortableTableVendor() {
    const [vendors, setVendors] = useState<VendorData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);

    const handleViewDetails = (vendor: VendorData) => {
        setSelectedVendor(vendor);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVendor(null);
    };

    const fetchData = useCallback(async (page?: number, search?: string) => {
        setIsLoading(true);
        try {
            const response = await axiosInstanceAdmin.get<VendorResponse>('/vendors', {
                params: {
                    page: page,
                    limit: 5,
                    search: search,
                    status: activeTab !== 'all' ? activeTab : undefined
                }
            });

            const transformedVendors: VendorData[]  = response.data.vendors.map((vendor) => ({
                ...vendor._doc,
                imageUrl: vendor.imageUrl 
            }));

            setVendors(transformedVendors);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

   
  const debouncedFetchData = useCallback(
    debounce(fetchData, 500),
    [fetchData]
  );

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
        setActiveTab(value);
        setCurrentPage(1);
    };
    

   
   const handleVerifyVendor = useCallback(async (vendorId: string) => {
    setIsLoading(true);

    let status: AcceptanceStatus;
    let rejectionReason: string | undefined;

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

    if (result.isConfirmed) {
        status = AcceptanceStatus.Accepted;
    } 
    else if (result.dismiss === Swal.DismissReason.cancel) {
        status = AcceptanceStatus.Rejected;

        // 🔹 Ask rejection reason
        const reasonResult = await Swal.fire({
            title: 'Enter Rejection Reason',
            input: 'text',
            inputPlaceholder: 'Enter reason (optional)',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel'
        });

        if (reasonResult.isConfirmed) {
            rejectionReason = reasonResult.value || "No reason provided";
        } else {
            setIsLoading(false);
            return;
        }
    } 
    else {
        setIsLoading(false);
        return;
    }

    try {
        const response = await axiosInstanceAdmin.put(`/vendors/${vendorId}/status`, {
            status,
            rejectionReason
        });

        showToastMessage(response.data.message, 'success');

        // Update vendors list
        setVendors(prevVendors =>
            prevVendors.map(vendor =>
                vendor._id === vendorId
                    ? {
                        ...vendor,
                        isAccepted: status,
                        isActive: status === AcceptanceStatus.Accepted,
                        rejectionReason: rejectionReason
                    }
                    : vendor
            )
        );

    } catch (error) {
        console.error('Error verifying vendor:', error);
        showToastMessage('Failed to verify vendor', 'error');
    } finally {
        setIsLoading(false);
    }
}, []);


    return (

        <div className="max-w-7xl mt-5 mx-auto px-4 sm:px-6 lg:px-8">
            <CardHeader floated={false} shadow={false} className="rounded-none p-4 -mt-7 mb-4" placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}>
                <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
                    <Typography
                        variant="h5"
                        color="blue-gray"
                        className="text-center text-2xl lg:text-3xl md:text-2xl sm:text-xl"
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}>
                        VENDOR MANAGEMENT
                    </Typography>

                    <div className="w-full lg:w-1/3 md:w-1/2 sm:w-full">
                        <Input
                            label="Search"
                            value={searchTerm}
                            onChange={handleSearch}
                            crossOrigin={undefined}
                            placeholder="Search vendors..."
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                            className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 rounded-xl"
                            labelProps={{
                                className: "hidden",
                            }}
                            containerProps={{
                                className: "min-w-[100px] relative"
                            }}
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <Tabs value={activeTab} className="w-full">
                        <TabsHeader
                            className="w-full  lg:w-max  md:w-3/4 sm:w-full mx-auto"
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}>
                            {TABS.map(({ label, value }) => (
                                <Tab
                                    key={value}
                                    value={value}
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
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

            <Card className="w-full" placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}>

                <CardBody className="px-0" placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto text-left">
                            <thead>
                                <tr>
                                    {TABLE_HEAD.map((head) => (
                                        <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-3">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}
                                                className="font-semibold text-xs leading-none"
                                            >
                                                {head}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={8} className="text-center p-4"><Loader /></td></tr>
                                ) : vendors.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center p-4">No vendors found</td></tr>
                                ) : (
                                    vendors.map((vendor, index) => (
                                        <tr key={index} className="even:bg-blue-gray-50/50 border-b border-blue-gray-50">
                                            {/* Vendor Info */}
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar 
                                                        src={vendor?.imageUrl || "/images/user.png"} 
                                                        alt={vendor.name} 
                                                        size="sm" 
                                                        placeholder={undefined}
                                                        onPointerEnterCapture={undefined}
                                                        onPointerLeaveCapture={undefined} 
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <Typography 
                                                            variant="small" 
                                                            color="blue-gray" 
                                                            className="font-medium text-xs truncate" 
                                                            placeholder={undefined}
                                                            onPointerEnterCapture={undefined}
                                                            onPointerLeaveCapture={undefined}
                                                        >
                                                            {vendor.name}
                                                        </Typography>
                                                        <Typography 
                                                            variant="small" 
                                                            color="blue-gray" 
                                                            className="font-normal opacity-70 text-xs truncate" 
                                                            placeholder={undefined}
                                                            onPointerEnterCapture={undefined}
                                                            onPointerLeaveCapture={undefined}
                                                        >
                                                            {vendor.companyName || "N/A"}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Mobile */}
                                            <td className="p-3">
                                                <Typography 
                                                    variant="small" 
                                                    color="blue-gray" 
                                                    className="font-normal text-xs" 
                                                    placeholder={undefined}
                                                    onPointerEnterCapture={undefined}
                                                    onPointerLeaveCapture={undefined}
                                                >
                                                    {vendor.contactinfo || "N/A"}
                                                </Typography>
                                            </td>

                                            {/* Joined Date */}
                                            <td className="p-3">
                                                <Typography 
                                                    variant="small" 
                                                    color="blue-gray" 
                                                    className="font-normal text-xs whitespace-nowrap" 
                                                    placeholder={undefined}
                                                    onPointerEnterCapture={undefined}
                                                    onPointerLeaveCapture={undefined}
                                                >
                                                    {new Date(vendor.createdAt).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        year: '2-digit'
                                                    })}
                                                </Typography>
                                            </td>

                                            {/* Status */}
                                            <td className="p-3">
                                                <div className={`w-max rounded-full ${vendor.isActive ? 'bg-green-100' : 'bg-red-100'} px-2 py-1`}>
                                                    <Typography 
                                                        variant="small" 
                                                        className={`${vendor.isActive ? 'text-green-700' : 'text-red-700'} text-xs font-medium`} 
                                                        placeholder={undefined}
                                                        onPointerEnterCapture={undefined}
                                                        onPointerLeaveCapture={undefined}
                                                    >
                                                        {vendor.isActive ? "Active" : "Inactive"}
                                                    </Typography>
                                                </div>
                                            </td>

                                            {/* Report Count */}
                                            <td className="p-3">
                                                <div
                                                    className={`w-max rounded-full ${
                                                        vendor.reportCount! > 10
                                                            ? "bg-red-200" 
                                                            : vendor.reportCount! > 1
                                                                ? "bg-yellow-200"
                                                                : "bg-green-200" 
                                                    } px-2 py-1`}
                                                >
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray" 
                                                        placeholder={undefined}
                                                        onPointerEnterCapture={undefined}
                                                        onPointerLeaveCapture={undefined}
                                                        className="font-medium text-xs text-black" 
                                                    >
                                                        {vendor.reportCount || "0"}
                                                    </Typography>
                                                </div>
                                            </td>

                                            {/* Actions (Toggle) */}
                                            <td className="p-3">
                                                <div className="flex justify-center">
                                                    <Switch
                                                        id={`custom-switch-component-${vendor._id}`}
                                                        ripple={false}
                                                        color={vendor.isActive ? "green" : "red"}
                                                        checked={vendor.isActive}
                                                        disabled={vendor.isAccepted === AcceptanceStatus.Requested || vendor.isAccepted === AcceptanceStatus.Rejected}
                                                        crossOrigin={undefined}
                                                        placeholder={undefined}
                                                        onPointerEnterCapture={undefined}
                                                        onPointerLeaveCapture={undefined}
                                                        className={`h-5 w-10 ${vendor.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                                                        containerProps={{
                                                            className: "relative inline-block w-10 h-5",
                                                        }}
                                                        circleProps={{
                                                            className: `absolute left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out ${
                                                                vendor.isActive ? 'translate-x-5' : ''
                                                            }`
                                                        }}
                                                    />
                                                </div>
                                            </td>

                                            {/* View Details */}
                                            <td className="p-3">
                                                <Button
                                                    size="sm"
                                                    variant="outlined"
                                                    className="px-3 py-1.5 text-xs normal-case" 
                                                    placeholder={undefined}
                                                    onPointerEnterCapture={undefined}
                                                    onPointerLeaveCapture={undefined}
                                                    onClick={() => handleViewDetails(vendor)}
                                                >
                                                    View
                                                </Button>
                                            </td>

                                            {/* Verify/Status Column */}
                                            <td className="p-3">
                                                {vendor.isAccepted === AcceptanceStatus.Requested ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outlined"
                                                        color="blue"
                                                        className="px-3 py-1.5 text-xs normal-case whitespace-nowrap"
                                                        placeholder={undefined}
                                                        onPointerEnterCapture={undefined}
                                                        onPointerLeaveCapture={undefined}
                                                        onClick={() => handleVerifyVendor(vendor._id)}
                                                    >
                                                        Verify
                                                    </Button>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        <Typography
                                                            variant="small"
                                                            color={vendor.isAccepted === AcceptanceStatus.Accepted ? "green" : "red"}
                                                            className="font-medium text-xs whitespace-nowrap"
                                                            placeholder={undefined}
                                                            onPointerEnterCapture={undefined}
                                                            onPointerLeaveCapture={undefined}
                                                        >
                                                            {vendor.isAccepted === AcceptanceStatus.Accepted ? "✓ Accepted" : "✗ Rejected"}
                                                        </Typography>
                                                        {vendor.isAccepted === AcceptanceStatus.Rejected && vendor.rejectionReason && (
                                                            <Typography
                                                                variant="small"
                                                                color="red"
                                                                className="text-xs opacity-70 max-w-[150px] break-words"
                                                                placeholder={undefined}
                                                                onPointerEnterCapture={undefined}
                                                                onPointerLeaveCapture={undefined}
                                                            >
                                                                {vendor.rejectionReason}
                                                            </Typography>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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
    );
}