import { Timestamp } from 'firebase/firestore'; // Import Timestamp from Firebase Firestore

export interface Club {
  name: string;
  imageURL: string;
  id: number;
  longDescription: string;
  sponsorEmail: string;
  categories: string[];
  dateDates: Timestamp[]; // Array of Firebase Firestore timestamps
  dateNames: string[];
  pastEventDescriptions: string[];
  pastEventNames: string[];
  pastEventURLs: string[];
}
