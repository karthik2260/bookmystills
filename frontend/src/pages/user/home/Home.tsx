import UserNavbar from "@/layout/user/navbar"
import DynamicBackground from "@/components/common/DynamicBackground"


const Home = () => {
    return (
        <div>
            <UserNavbar/>
              <DynamicBackground
                filepath="/images/homebg1.jpg"
                height="h-[500px]"
                type="image"
                className="w-full"
            />
        </div>
    )
}

export default Home