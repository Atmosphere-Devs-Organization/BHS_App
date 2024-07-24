import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { FirebaseError } from "firebase/app";
import { updateProfile } from "firebase/auth";

export const updateUser = async (displayName: string) => {
  if (!FIREBASE_AUTH.currentUser) {
    return {
      error: "Not Logged In!",
    };
  }
  try {
    await updateProfile(FIREBASE_AUTH.currentUser, {
      displayName,
    });
  } catch (e) {
    if (e instanceof FirebaseError) {
      return {
        error: e.message,
      };
    }
  }
  return {};
};
