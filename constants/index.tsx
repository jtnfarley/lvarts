import { BiSolidHomeAlt2, BiSolidSearch, BiSolidUser, BiSolidBell } from "react-icons/bi";

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
      icon: <BiSolidUser className="leftIcon"/>,
      route: "/profile",
      label: "Profile",
    },
  ];

  export const profileTabs = [
    { value: "tweets", label: "Tweets", icon: "/assets/gray-tweet.svg" },
    { value: "replies", label: "Replies", icon: "/assets/reply.svg" },
  ];

  export const groupTabs = [
    { value: "tweets", label: "Tweets", icon: "/assets/gray-tweet.svg" },
    { value: "members", label: "Members", icon: "/assets/members.svg" },
  ];