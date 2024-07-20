import React from "react";
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  StatusBar,
  TextInput,
  Pressable,
} from "react-native";

const App = () => {
  const [user, onChangeUser] = React.useState("");
  const [pass, onChangePass] = React.useState("");

  function checkLogin(user: string, pass: string): boolean {
    //Temporary
    console.log(
      "Sign In!\nUser signed in with -\nUser: " + user + "\nPass: " + pass
    );

    return true;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar
        animated={true}
        barStyle={"dark-content"}
        showHideTransition={"fade"}
        hidden={true}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require("@/assets/images/LoginBG.png")}
          resizeMode="cover"
          style={styles.login_BG_Image}
        >
          <TextInput
            style={styles.user_input}
            onChangeText={onChangeUser}
            value={user}
            placeholder="s123456"
            placeholderTextColor={"#B3B3B3"}
            autoComplete="username"
            textContentType="oneTimeCode"
          />
          <TextInput
            style={styles.password_input}
            onChangeText={onChangePass}
            value={pass}
            placeholder="Password"
            placeholderTextColor={"#B3B3B3"}
            autoComplete="current-password"
            textContentType="oneTimeCode"
          />
          <Pressable
            onPressIn={() => {
              if (checkLogin(user, pass)) {
                console.log("Good Login");
              }
            }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#808080" : "#1A5570",
              },
              styles.wrapperCustom,
            ]}
          >
            <Text style={styles.signup_text}>Sign In</Text>
          </Pressable>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  login_BG_Image: {
    flex: 1,
    justifyContent: "center",
  },
  user_input: {
    height: 40,
    marginLeft: 60,
    marginRight: 60,
    marginTop: 307.5,
    padding: 10,
    color: "#B3B3B3",
  },
  password_input: {
    height: 40,
    marginLeft: 60,
    marginRight: 60,
    marginTop: 53.5,
    padding: 10,
    color: "#B3B3B3",
  },
  signup_text: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 60,
    transform: [{ translateY: 23.5 }],
  },
});

export default App;
