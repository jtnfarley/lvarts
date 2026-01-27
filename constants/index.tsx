import { BiSolidHomeAlt2, BiSolidSearch, BiSolidUser, BiSolidBell, BiSolidCalendar } from "react-icons/bi";

export const sidebarLinks = [
    {
      icon: <BiSolidHomeAlt2 className="leftIcon"/>,
      route: "/home",
      label: "Home",
    },
    {
      icon: <BiSolidBell className="leftIcon"/>,
      route: "/notifications",
      label: "Notifications",
    },
    {
      icon: <BiSolidCalendar className="leftIcon"/>,
      route: "/calendar",
      label: "Calendar",
    },
    {
      icon: <BiSolidUser className="leftIcon"/>,
      route: "/profile",
      label: "Profile",
    },
  ];