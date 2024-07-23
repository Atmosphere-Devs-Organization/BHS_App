import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";

const Calandar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return <View>{user ? <NormalCalendar /> : <LoggedOutCalendar />}</View>;
};

const LoggedOutCalendar = () => {
  return (
    <View>
      <Text>You need to be sign in to access the calendar</Text>
    </View>
  );
};

const NormalCalendar = () => {
  return (
    <View>
      <Text>Calendar</Text>
    </View>
  );
};

export default Calandar;
