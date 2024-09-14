import { Linking } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export interface Button {
  title: string;
  link: string;
  categories: string[];
  icon: keyof typeof MaterialIcons.glyphMap; // MaterialIcons icon
}

export const buttons: Button[] = [
  {
    title: "CFISD Website",
    categories: ["All", "Students", "Parents"],
    link: "https://www.cfisd.net/",
    icon: "public", // Globe icon equivalent
  },
  {
    title: "District Calendar",
    categories: ["All", "Parents"],
    link: "https://www.cfisd.net/calendar",
    icon: "event", // Calendar icon
  },
  {
    title: "Student Staff Portal",
    categories: ["All", "Students"],
    link: "https://launchpad.classlink.com/cfisd/",
    icon: "school", // School/Student icon
  },
  {
    title: "CyFair Twitter",
    categories: ["All"],
    link: "https://x.com/CyFairISD?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor",
    icon: "share", // Share icon (for social media)
  },
  {
    title: "School Cash",
    categories: ["All", "Parents"],
    link: "https://cypress-fairbanksisd.schoolcashonline.com/",
    icon: "attach-money", // Money icon
  },
  {
    title: "VOE",
    categories: ["All", "Students"],
    link: "https://docs.google.com/forms/d/e/1FAIpQLSdskJpSPeIpjN97G_1PyJ3iQvk-wEAy1cNGdiG1WeSylCUsMw/viewform",
    icon: "description", // Document icon
  },
  {
    title: "Cafeteria Menu",
    categories: ["All", "Students"],
    link: "https://www.cfisd.net/parents-students01/nutrition-services/menus",
    icon: "restaurant-menu", // Food icon
  },
  {
    title: "Bell Schedule",
    categories: ["All", "Students"],
    link: "https://bridgeland.cfisd.net/parents-students/schedules/bell-schedule",
    icon: "schedule", // Clock icon
  },
  {
    title: "Scholarship Info",
    categories: ["All", "Students"],
    link: "https://www.cfisd.net/parents-students01/guidance-counseling/additional-guidance-resources/student-resources/scholarships",
    icon: "school", // Graduation cap equivalent
  },
  {
    title: "Request Transcript",
    categories: ["All", "Students"],
    link: "https://cypressfairbanksk12.scriborder.com/startOrderSchool/Texas/Cypress%20Fairbanks%20ISD/BRIDGELAND%20HIGH%20SCHOOL",
    icon: "assignment", // Document signature equivalent
  },
  {
    title: "Contact Admin",
    categories: ["All", "Parents"],
    link: "https://bridgeland.cfisd.net/our-school/contact-us",
    icon: "phone", // Phone icon
  },
];
