import HeroBanner from "@/components/user/HeroBanner";
import ListedVendors from "@/components/user/ListedVendors";
import Footer from "@/layout/user/footer";
import UserNavbar from "@/layout/user/navbar";

const VendorList = () => {
  return (
    <>
      <UserNavbar />
      <HeroBanner />
      <ListedVendors />
      <Footer />
    </>
  );
};

export default VendorList;
