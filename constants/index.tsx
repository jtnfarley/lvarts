import { BiSolidHomeAlt2, BiSolidSearch, BiSolidUser } from "react-icons/bi";

export const sidebarLinks = [
    {
      icon: <BiSolidHomeAlt2 className="leftIcon"/>,
      route: "/home",
      label: "Home",
    },
    // {
    //   icon: <BiSolidSearch className="leftIcon"/>,
    //   route: "/search",
    //   label: "Search",
    // },
    // {
    //   imgURL: "/assets/notifications.svg",
    //   route: "/notifications",
    //   label: "Notifications",
    // },
    // {
    //   imgURL: "/assets/tweet.svg",
    //   route: "/create-tweet",
    //   label: "Tweet",
    // },
    // {
    //   imgURL: "/assets/groups.svg",
    //   route: "/groups",
    //   label: "Groups",
    // },
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