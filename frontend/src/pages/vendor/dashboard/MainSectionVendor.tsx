import { useEffect, useState } from "react";
import VendorDetails from "../../../components/common/vendorDetails";
import ImageMasonry from "../../common/imageMasonary";
import { useSelector } from "react-redux";
import VendorRootState from "@/redux/rootstate/VendorState";

import { fetchVendorDetailsApi } from "@/services/vendorserviceapi";
const MainSectionVendor = () => {
    const vendordetails = useSelector(
        (state: VendorRootState) => state.vendor.vendorData
    );

    const [vendor, setVendor] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await fetchVendorDetailsApi();

            if (data) {
                setVendor(data);
            }
        } catch (error) {
            console.error('Error fetching vendor details:', error);
        }
    };

    return (
        <div className="w-full mx-auto">
            {vendor ? (
                <div className="space-y-8">
                    <VendorDetails
                        isVendor={true}
                        vendorDetails={vendordetails}
                    />
                    <ImageMasonry vendorDetails={vendor} />
                </div>
            ) : (
                <div className="text-center py-8">
                    Loading vendor details...
                </div>
            )}
        </div>
    );
};

export default MainSectionVendor;