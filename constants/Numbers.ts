import { Platform } from "react-native";

export default {
  //Tab Bar
  iconSize: 20,
  tabLabelFontSize: 10,

  gapBetweenIconAndLabel: 7,
  bottomOfTabBar: 5,
  horizontalMargin: 20,

  selectedIconScale: 1.35,
  selectedIconShift: 6,

  animatedIconBGBorderRadius: Platform.OS === "ios" ? 30 : 30,
  animatedIconBGMarginHorizontal: Platform.OS === "ios" ? 12 : 12,
  animatedIconBGHeightOffset: Platform.OS === "ios" ? 60 : 15,
  animatedIconBGWidthOffset: Platform.OS === "ios" ? 25 : 25,
  animatedIconBGTop: Platform.OS === "ios" ? 35 : 16,

  animatedIconScaleDuration: 350,
  animatedIconBGDuration: 1500,

  //Home
  profileButtonXTranslate: 305,
  profileButtonYTranslate: -293,
  profileButtonSize: 60,

  //Profile
  backButtonSize: 35,
  titleFontSize: 30,

  needSignInFontSize: 25,

  loginButtonHeight: 80,
  loginButtonWidth: 300,
  loginTextFontSize: 30,
  loginIconSize: 40,

  infoFontSize: 21,

  editNameIconSize: 35,
};
