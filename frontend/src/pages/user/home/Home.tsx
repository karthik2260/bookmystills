import UserNavbar from "@/layout/user/navbar"
import DynamicBackground from "@/components/common/DynamicBackground"
import HeroSection from "@/components/user/HeroSection"
import Footer from "@/layout/user/footer"

const Home = () => {
    return (
        <div>
            <UserNavbar/>
            <HeroSection/>
              <DynamicBackground
                filepath="/images/homebg1.jpg"
                height="h-[500px]"
                type="image"
                className="w-full"
            />
                <Footer/>
        </div>
    )
}

export default Home