import { Linking } from 'react-native';
// ButtonsData.ts
export interface Button {
    title: string;
    link: string;
    categories: string[];
  }
export const buttons: Button[] = [
  {
    title: 'CFISD Website',
    categories: ['All', 'Students', 'Parents'],
    link: 'https://www.cfisd.net/',
  },
  {
    title: 'District Calendar',
    categories: ['All', 'Parents'],
    link: 'https://www.cfisd.net/calendar',
  },
  {
    title: 'Student Staff Portal',
    categories: ['All', 'Students'],
    link: 'https://launchpad.classlink.com/cfisd/',
  },
  {
    title: 'CyFair Twitter',
    categories: ['All'],
    link: 'https://x.com/CyFairISD?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor',
  },
  {
    title: 'School Cash',
    categories: ['All', 'Parents'],
    link: 'https://cypress-fairbanksisd.schoolcashonline.com/',
  },
  {
    title: 'VOE',
    categories: ['All', 'Students'],
    link: 'https://bridgeland.cfisd.net/parents-students/attendance/voe-verification-of-enrollment',
  },
  {
    title: 'Cafeteria Menu',
    categories: ['All', 'Students'],
    link: 'https://www.cfisd.net/parents-students01/nutrition-services/menus',
  },
  {
    title: 'Bell Schedule',
    categories: ['All', 'Students'],
    link: 'https://bridgeland.cfisd.net/parents-students/schedules/bell-schedule',
  },
  {
    title: 'Scholarship Info',
    categories: ['All', 'Students'],
    link: 'https://www.cfisd.net/parents-students01/guidance-counseling/additional-guidance-resources/scholarships/general-scholarships',
  },
  {
    title: 'Request Transcript',
    categories: ['All', 'Students'],
    link: 'https://cypressfairbanksk12.scriborder.com/startOrderSchool/Texas/Cypress%20Fairbanks%20ISD/BRIDGELAND%20HIGH%20SCHOOL',
  },
  {
    title: 'Contact Admin',
    categories: ['All', 'Parents'],
    link: 'https://bridgeland.cfisd.net/our-school/contact-us',
  },
];