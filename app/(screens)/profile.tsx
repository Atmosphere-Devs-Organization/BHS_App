// Import statements
import {
  Dimensions,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Numbers from "@/constants/Numbers";
import Colors from "@/constants/Colors";
import AwesomeButton from "react-native-really-awesome-button";
import { collection, doc, getDoc } from "firebase/firestore";
import clubsData from 'assets/data/clubs-data.json'; // Adjust the path as necessary

const screenWidth = Dimensions.get('window').width;

// Main App component
const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return user ? (
    <NormalProfile email={user.email} userName={user.displayName} userId={user.uid} />
  ) : (
    <LoggedOutProfile />
  );
};

// Logged out profile component
const LoggedOutProfile = () => {
  return (
    <ImageBackground
      source={require("@/assets/images/GenericBG.png")}
      resizeMode="cover"
      style={styles.BG_Image}
    >
      <SafeAreaView style={styles.logged_out_profile_container}>
        <TouchableOpacity onPress={router.back} style={styles.back_button}>
          <Ionicons
            name="arrow-back-sharp"
            size={Numbers.backButtonSize}
            color={Colors.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.need_signin_text}>
          You need to be signed in to access your profile
        </Text>
        <AwesomeButton
          style={styles.login_button}
          backgroundColor={Colors.loginButtonBG}
          backgroundDarker={Colors.loginButtonDarkerBG}
          height={Numbers.loginButtonHeight}
          width={Numbers.loginButtonWidth}
          raiseLevel={10}
          onPressOut={() => router.push("(modals)/temp")}
        >
          <Entypo
            name="login"
            size={Numbers.loginIconSize}
            color={Colors.loginIcon}
            style={{ alignSelf: "center", marginRight: 15 }}
          />
          <Text style={styles.login_text}>Login</Text>
        </AwesomeButton>
      </SafeAreaView>
    </ImageBackground>
  );
};

// Normal profile component
const NormalProfile = ({
  email,
  userName,
  userId,
}: {
  email: string | null;
  userName: string | null;
  userId: string;
}) => {
  const [changingName, setChangingName] = useState(false);
  const [username, onChangeUser] = React.useState(userName ? userName : "");
  const [clubs, setClubs] = useState<string[]>([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setClubs(userData.clubs || []);
        }
      } catch (error) {
        console.error("Error fetching clubs: ", error);
      }
    };

    fetchClubs();
  }, [userId]);

  const handlePress = (clubName: string) => {
    // Find the club in clubs-data.json that matches the clubName
    const matchedClub = clubsData.find((club) => club.name === clubName);

    // Log the information if a match is found
    if (matchedClub) {
      router.push(`/clubPage/${matchedClub?.id}`)
    } else {
      console.log('No matching club found');
    }
  };



  return (
    <ImageBackground
      source={require("@/assets/images/GenericBG.png")}
      resizeMode="cover"
      style={styles.BG_Image}
    >
      <ScrollView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.normal_profile_container}>
            <TouchableOpacity onPress={router.back} style={styles.back_button}>
              <Ionicons
                name="arrow-back-sharp"
                size={Numbers.backButtonSize}
                color={Colors.backButton}
              />
            </TouchableOpacity>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.infoText}>Email: {email}</Text>
            {changingName ? (
              <TextInput
                style={styles.infoText}
                placeholder={username ? username : "[First Name]"}
                onChangeText={onChangeUser}
                value={username}
              />
            ) : (
              <Text style={styles.infoText}>
                Name: {username !== "" ? username : "name"}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => {
                updateUser(username);
                setChangingName(!changingName);
              }}
              style={styles.edit_name_button}
            >
              <Entypo
                name={changingName ? "check" : "edit"}
                size={Numbers.editNameIconSize}
                color={Colors.nameEditButton}
              />
            </TouchableOpacity> 
            <AwesomeButton
              style={styles.logout_button}
              backgroundColor={Colors.signInButtonNormal}
              backgroundDarker={Colors.signInButtonDark}
              height={screenWidth * .2}
              width={screenWidth * .8}
              raiseLevel={10}
              onPressOut={() => FIREBASE_AUTH.signOut()}
            >
              <Entypo
                name="log-out"
                size={17}
                color={Colors.clubName}
                style={{ alignSelf: "center", marginRight: 15 }}
              />
              <Text style={styles.logout_text}>Logout</Text>
            </AwesomeButton>

            <Text style={styles.clubTitle}>Your Clubs</Text>

            <View style={styles.clubContainer}>
              {clubs.map((club, index) => (
                <AwesomeButton
                  key={index}
                  style={styles.club_button}
                  backgroundColor={Colors.signInButtonNormal}
                  backgroundDarker={Colors.signInButtonDark}
                  height={screenWidth * .2}
                  width={(screenWidth - 60) / 3} // Adjust width for 3 buttons per row
                  raiseLevel={10}
                  onPressOut={() => handlePress(club)}
                >
                  <Text style={styles.club_button_text}>{club}</Text>
                </AwesomeButton>
              ))}
            </View>

          </SafeAreaView>
        </TouchableWithoutFeedback>
        </ScrollView>
    </ImageBackground>
  );
};

// Styles
// Styles
// Styles
// Styles
// Styles
const styles = StyleSheet.create({
  logged_out_profile_container: { flex: 1 },
  normal_profile_container: { flex: 1 },
  back_button: { marginVertical: 15, marginHorizontal: 10 },
  title: {
    fontWeight: "bold",
    fontSize: Numbers.titleFontSize,
    alignSelf: "center",
    transform: [{ translateY: -55 }],
    color: Colors.profileTitle,
  },
  BG_Image: {
    flex: 1,
  },
  need_signin_text: {
    alignSelf: "center",
    marginTop: 100,
    marginHorizontal: 10,
    fontWeight: "bold",
    fontSize: Numbers.needSignInFontSize,
    color: Colors.needSignIn,
    textAlign: "center",
  },
  login_button: {
    marginVertical: 25,
    alignContent: "center",
    alignSelf: "center",
  },
  clubTitle: {
    fontWeight: "bold",
    fontSize: 24,
    marginVertical: 20,
    textAlign: "center",
    color: Colors.clubName,
  },
  login_text: {
    fontSize: Numbers.loginTextFontSize,
    color: Colors.loginText,
    textAlign: "center",
    fontWeight: "bold",
  },
  infoText: {
    color: Colors.infoText,
    fontSize: Numbers.infoFontSize,
    marginHorizontal: 15,
    marginVertical: 5,
  },
  edit_name_button: {
    marginVertical: 40,
    marginHorizontal: 10,
    alignSelf: "center",
  },
  clubContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distribute space between buttons
    paddingHorizontal: 10,
  },
  club_button: {
    flex: 1, // Allow buttons to grow and fill space
    margin: 5, // Space around each button
    maxWidth: (screenWidth - 40 - 20) / 3, // Maximum width considering margin
    alignSelf: 'center', // Center buttons when they have less than max width
  },
  club_button_text: {
    fontSize: 16,
    color: Colors.clubName,
  },
  logout_button: {
    marginVertical: 40,
    alignSelf: "center",
  },
  logout_text: {
    fontSize: 16,
    color: Colors.clubName,
    fontWeight: "bold",
  },
});





export default App;
