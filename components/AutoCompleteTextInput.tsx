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
  placeholderTextColor?: string;
  possibleInputs: string[];
}

const AutoCompleteTextInput = ({
  style,
  onChangeText,
  value,
  keyboardType,
  placeholder,
  placeholderTextColor, // Add this line
  possibleInputs,
}: Props) => {
  const listRef = useRef<FlatList>(null);

  const [filteredClubs, setFilteredClubs] = useState<string[]>(possibleInputs);
  useEffect(() => {
    setFilteredClubs(
      possibleInputs.filter(
        (possibleInput) =>
          possibleInput
            .toLowerCase()
            .indexOf(
              value
                ? value.toLowerCase()
                : "Random thing that won't be in rooms"
            ) !== -1 && possibleInput !== value
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
        placeholderTextColor={placeholderTextColor} // Add this line
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
    width: "90%",
    height: undefined,
    alignSelf: "center",
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderRightWidth: 5,
  },
  item: {
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  itemContainer: {
    paddingVertical: 10,
    borderBottomColor: "#000000",
    borderBottomWidth: 2,
    width: "100%",
    paddingHorizontal: "5%",
  },
});

export default AutoCompleteTextInput;
