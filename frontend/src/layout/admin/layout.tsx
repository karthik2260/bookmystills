import { useMemo,useState,useEffect } from "react";
import { ADMIN } from "@/config/constants/constants";
import { 
  LayoutDashboardIcon, 
  UsersIcon, 
  ShoppingBagIcon, 
  FileTextIcon, 
  LogOutIcon,
} from "lucide-react";

import {FlagIcon } from "@heroicons/react/24/solid";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string | null;
}



const Layout : React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);


    const menuItems : MenuItem[] = useMemo(() => [
         { icon: LayoutDashboardIcon, label: 'Dashboard', path: `/admin${ADMIN.DASHBOARD}` },
    { icon: UsersIcon, label: 'Users', path: `/admin${ADMIN.USERS}` },
    { icon: UsersIcon, label: 'Vendors', path: `/admin${ADMIN.VENDORS}` },
    { icon: FileTextIcon, label: 'Posts', path: '/admin/view-all-posts' },
    { icon: ShoppingBagIcon, label: 'Bookings', path: `/admin${ADMIN.ALLBOOKINGS}` },
    { icon: FlagIcon, label: 'Reports', path: `/admin${ADMIN.REPORT}` },
    { icon: LogOutIcon, label: 'Log Out', path: null }
    ],[])

     const activeItem = useMemo(() => {
    const currentPath = location.pathname;
    const activeMenuItem = menuItems.find(item => 
      item.path && currentPath.includes(item.path)
    );
    return activeMenuItem ? activeMenuItem.label : 'Dashboard';
  }, [location.pathname, menuItems]);

   useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
}

export default Layout