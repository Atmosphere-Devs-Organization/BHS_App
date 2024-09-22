import Numbers from "@/constants/Numbers";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const TabButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  color,
  label,
}: {
  onPress: ((event: GestureResponderEvent) => void) | null | undefined;
  onLongPress: ((event: GestureResponderEvent) => void) | null | undefined;
  isFocused: boolean;
  routeName: string;
  color: string;
  label: string;
}) => {
  const icon: any = {
    home: (props: any) => (
      <Ionicons name="home-sharp" size={Numbers.iconSize} {...props} />
    ),
    calendar: (props: any) => (
      <Ionicons
        name="calendar-clear-sharp"
        size={Numbers.iconSize}
        {...props}
      />
    ),
    clubs: (props: any) => (
      <Ionicons name="people-sharp" size={Numbers.iconSize} {...props} />
    ),
    map: (props: any) => (
      <Ionicons name="map-sharp" size={Numbers.iconSize} {...props} />
    ),
    index: (props: any) => (
      <Ionicons name="school-sharp" size={Numbers.iconSize} {...props} />
    ),
  };

  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(
      typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused,
      { duration: Numbers.animatedIconScaleDuration }
    );
  }, [scale, isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(
      scale.value,
      [0, 1],
      [1, Numbers.selectedIconScale]
    );
    const top = interpolate(
      scale.value,
      [0, 1],
      [0, Numbers.selectedIconShift]
    );

    return {
      transform: [
        {
          scale: scaleValue,
        },
      ],
      top: top,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);

    return {
      opacity,
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tab_bar_item}
    >
      <Animated.View style={animatedIconStyle}>
        {icon[routeName]({
          color: color,
        })}
      </Animated.View>
      <Animated.Text
        style={[
          {
            color: color,
            fontSize: Numbers.tabLabelFontSize,
          },
          animatedTextStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tab_bar_item: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Numbers.gapBetweenIconAndLabel, //Gap between words and icon
  },
});

export default TabButton;
