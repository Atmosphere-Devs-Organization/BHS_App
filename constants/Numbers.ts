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
  animatedIconBGHeightOffset: Platform.OS === "ios" ? 60 : 50,
  animatedIconBGWidthOffset: Platform.OS === "ios" ? 25 : 25,
  animatedIconBGTop: Platform.OS === "ios" ? 32 : 16,

  animatedIconScaleDuration: 350,
  animatedIconBGDuration: 1500,
};
