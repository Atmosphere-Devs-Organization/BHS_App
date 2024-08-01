import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TextStyle,
  KeyboardTypeOptions,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Colors from "@/constants/Colors";

interface Props {
  style: TextStyle;
  onChangeText: ((text: string) => void) | undefined;
  value: string | undefined;
  keyboardType: KeyboardTypeOptions | undefined;
  placeholder: string | undefined;
  possibleInputs: string[];
}

const AutoCompleteTextInput = ({
  style,
  onChangeText,
  value,
  keyboardType,
  placeholder,
  possibleInputs,
}: Props) => {
  const listRef = useRef<FlatList>(null);

  const [filteredClubs, setFilteredClubs] = useState<string[]>(possibleInputs);
  useEffect(() => {
    setFilteredClubs(
      possibleInputs.filter(
        (room) =>
          room.indexOf(
            value ? value : "Random thing that won't be in rooms"
          ) !== -1 && room !== value
      )
    );
  }, [value]);

  const renderRow: ListRenderItem<string> = ({ item }) => (
    <TouchableOpacity
      onPress={() => (onChangeText ? onChangeText(item) : null)}
    >
      <View style={styles.itemContainer}>
        <Text style={styles.item}>{item}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <TextInput
        style={style}
        onChangeText={onChangeText}
        value={value}
        keyboardType={keyboardType}
        placeholder={placeholder}
      />

      {value !== "" ? (
        <View style={styles.listContainer}>
          <FlatList
            data={filteredClubs}
            ref={listRef}
            renderItem={renderRow}
            scrollEnabled={false}
          />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignContent: "center" },
  listContainer: {
    alignItems: "center",
    backgroundColor: Colors.autoCompleteBG,
    width: "77%",
    height: undefined,
    alignSelf: "center",
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderRightWidth: 5,
  },
  item: {
    fontWeight: "bold",
    textAlign: "center",
  },
  itemContainer: {
    paddingVertical: 10,
    borderBottomColor: "#000000",
    borderBottomWidth: 2,
    width: "100%",
    paddingHorizontal: "35%",
  },
});

export default AutoCompleteTextInput;
