import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Button,
  Pressable,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Numbers from "@/constants/Numbers";
import Colors from "@/constants/Colors";
import AwesomeButton from "react-native-really-awesome-button";
import { updateUser } from "@/components/UpdateUser";

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return user ? (
    <NormalProfile email={user.email} userName={user.displayName} />
  ) : (
    <LoggedOutProfile />
  );
};

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
          onPressOut={() => router.push("(modals)/login")}
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

const NormalProfile = ({
  email,
  userName,
}: {
  email: string | null;
  userName: string | null;
}) => {
  const [changingName, setChangingName] = useState(false);
  const [username, onChangeUser] = React.useState(userName ? userName : "");

  return (
    <ImageBackground
      source={require("@/assets/images/GenericBG.png")}
      resizeMode="cover"
      style={styles.BG_Image}
    >
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
            Name: {username != "" ? username : "name"}
          </Text>
        )}
        <TouchableOpacity
          onPress={() => {
            updateUser(username);
            changingName ? setChangingName(false) : setChangingName(true);
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
          style={styles.login_button}
          backgroundColor={Colors.loginButtonBG}
          backgroundDarker={Colors.loginButtonDarkerBG}
          height={Numbers.loginButtonHeight}
          width={Numbers.loginButtonWidth}
          raiseLevel={10}
          onPressOut={() => FIREBASE_AUTH.signOut()}
        >
          <Entypo
            name="log-out"
            size={Numbers.loginIconSize}
            color={Colors.loginIcon}
            style={{ alignSelf: "center", marginRight: 15 }}
          />
          <Text style={styles.login_text}>Logout</Text>
        </AwesomeButton>
      </SafeAreaView>
    </ImageBackground>
  );
};

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
});

export default App;
