import HeroBanner from "../../../components/user/HeroBanner";
import ShowAllPosts from "../../../components/user/ShowAllPosts";
import UserNavbar from "../../../layout/user/navbar";

import DynamicBackground from "@/components/common/DynamicBackground";
import Footer from "@/layout/user/footer";

const Posts = () => {
  return (
    <div>
      <UserNavbar />
      <HeroBanner />
      <ShowAllPosts />
      <DynamicBackground
        filepath="/images/homebg2.jpg"
        height="h-[500px]"
        type="image"
        className="w-full"
      />
      <Footer />
    </div>
  );
};

export default Posts;
