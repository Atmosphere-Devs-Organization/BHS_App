import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Numbers from "@/constants/Numbers";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const icon: any = {
    index: (props: any) => (
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
  };
  return (
    <SafeAreaView style={styles.tab_bar}>
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab_bar_item}
          >
            {icon[route.name]({
              color: isFocused ? Colors.tabActiveTint : Colors.tabInactiveTint,
            })}
            <Text
              style={{
                color: isFocused
                  ? Colors.tabActiveTint
                  : Colors.tabInactiveTint,
                fontSize: Numbers.tabLabelFontSize,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tab_bar: {
    position: "absolute",
    bottom: Numbers.bottomOfTabBar, //Bottom of the tab bar
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.tabBarBG,
    marginHorizontal: Numbers.horizontalMargin, //Margin between tab bar sides and screen sides
    //paddingVertical: 50, //Vertical padding between buttons and edge of the tab bar
    //borderRadius: 35, //Rounds corners of the tab bar, smaller number equals more sharp
  },
  tab_bar_item: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Numbers.gapBetweenIconAndLabel, //Gap between words and icon
  },
});
