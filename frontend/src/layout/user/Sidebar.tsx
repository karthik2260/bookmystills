import { USER } from "@/config/constants/constants";
import { logout } from "@/redux/slices/UserSlice";
import { logoutUser } from "@/services/userAuthService";
import { showToastMessage } from "@/validations/common/toast";
import { Bars3Icon, ChatBubbleBottomCenterIcon, UserGroupIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { Card, Chip, IconButton, List, ListItem, ListItemPrefix, ListItemSuffix, Tooltip, Typography } from "@material-tailwind/react"
import { PowerIcon, ShoppingBagIcon, UserCircleIcon, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom"

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string | null;
  badge: string | null;
}

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeItem, setActiveItem] = useState('Profile');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 1024);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = useMemo(() => [
    { icon: UserCircleIcon, label: 'Profile', path:USER.PROFILE, badge: null },
    { icon: Wallet, label: 'Wallet', path: '/wallet', badge: null },
    { icon: ShoppingBagIcon, label: 'Booking', path: '/booking', badge: null },
    { icon: ChatBubbleBottomCenterIcon, label: 'Chats', path: '/chats', badge: null },
    { icon: UserGroupIcon, label: 'Vendors', path: '/vendors', badge: null },
    { icon: PowerIcon, label: 'Log Out', path: null, badge: null }
  ], []);

  const handleMenuClick = async (item: MenuItem) => {
    if (item.label === 'Log Out') {
      try {
       await logoutUser()
        localStorage.removeItem('userToken');
        dispatch(logout());
        navigate(USER.LOGIN);
        showToastMessage('Logged out successfully', 'success');
      } catch (error) {
        console.error('Logout Error ', error);
        showToastMessage('Error during logout', 'error');
      }
      return;
    }

    setActiveItem(item.label);
    if (item.path) {
      navigate(item.path);
    }
    if (isMobile) setIsCollapsed(true);
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <Card
      className={`min-h-screen ${isCollapsed ? 'w-20' : 'w-64'} p-4 shadow-xl shadow-blue-gray-900/5 transition-all duration-300`}
      
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
      placeholder={undefined}
    >
      <div className="mb-2 flex items-center justify-between p-4">
        {!isCollapsed && (
          <Link to={`${USER.HOME}`}>
            <Typography
              variant="h5"
              color="blue-gray"
             
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              placeholder={undefined}
            >
              bookmystills
            </Typography>
          </Link>
        )}
        <IconButton
          variant="text"
          size="sm"
          onClick={toggleSidebar}
       
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          placeholder={undefined}
        >
          {isCollapsed ? <Bars3Icon className="h-5 w-5" /> : <XMarkIcon className="h-5 w-5" />}
        </IconButton>
      </div>
      <List
        
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        placeholder={undefined}
      >
        {menuItems.map((item) => (
          isCollapsed ? (
            <Tooltip
              key={item.label}
              content={item.label}
              placement="right"
              className="bg-white px-4 py-3 text-black shadow-xl shadow-black/10"
            >
              <ListItem
                
                className={`${activeItem === item.label ? 'bg-blue-50' : ''} justify-center hover:bg-blue-gray-50 focus:bg-blue-gray-50 active:bg-blue-gray-50`}
                onClick={() => handleMenuClick(item)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                placeholder={undefined}
              >
                <ListItemPrefix
              
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  placeholder={undefined}
                >
                  <item.icon className="h-5 w-5 mr-0" />
                </ListItemPrefix>
              </ListItem>
            </Tooltip>
          ) : (
            <ListItem
              
              key={item.label}
              className={`${activeItem === item.label ? 'bg-blue-50' : ''} hover:bg-blue-gray-50 focus:bg-blue-gray-50 active:bg-blue-gray-50`}
              onClick={() => handleMenuClick(item)}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              placeholder={undefined}
            >
              <ListItemPrefix
             
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                placeholder={undefined}
              >
                <item.icon className={`h-5 w-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
              </ListItemPrefix>
              {item.label}
              {item.badge && (
                <ListItemSuffix
                  
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  placeholder={undefined}
                >
                  <Chip value={item.badge} size="sm" className="rounded-full bg-black text-white" />
                </ListItemSuffix>
              )}
            </ListItem>
          )
        ))}
      </List>
    </Card>
  );
}

export default Sidebar;