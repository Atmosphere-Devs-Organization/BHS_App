import {
  Text,
  Button,
  ImageBackground,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import roomData from "@/assets/data/map-data.json";
import { Room } from "@/interfaces/Room";
import { router } from "expo-router";
import GridMap from "@/components/GridMap";
import { MapCoords } from "@/interfaces/MapCoords";
import floorData from "@/assets/data/floor-data.json";
import { Floor } from "@/interfaces/Floor";
import { distance } from "@/components/DistanceCalc";
import AutoCompleteTextInput from "@/components/AutoCompleteTextInput";
import Colors from "@/constants/Colors";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AwesomeButton from "react-native-really-awesome-button";

const Map = () => {
  const floor_data = useMemo(() => floorData as any, []); // More efficient, idk what it does tbh
  const data = useMemo(() => roomData as any, []); // More efficient, idk what it does tbh

  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [error, setError] = useState<string | null>("Blank Error");

  const [room1, setRoom1] = useState<string>("");
  const [room2, setRoom2] = useState<string>("");

  let room1Item = (data as Room[]).find((item) => item.roomId.includes(room1));
  let room2Item = (data as Room[]).find((item) => item.roomId.includes(room2));
  let floor1Item = (floor_data as Floor[]).find(
    (item) => item.id === room1Item?.floor
  );

  const [elevatorsNeeded, setElevatorUse] = useState<boolean>(false);
  const [chosenStairs, setStairs] = useState<MapCoords>({ Col: 0, Row: 0 });

  const [loading, setLoading] = useState<boolean>(false);

  const validRooms = [
    "1202",
    "1203",
    "1204",
    "1205",
    "1206",
    "1212",
    "1209",
    "1219",
    "1224",
    "1239",
    "1240",
    "1241",
    "1242",
    "1243",
    "floor 1 counselor pod",
    "1105",
    "1106",
    "1114",
    "1115",
    "1132",
    "1131",
    "1121",
    "1122",
    "1302",
    "1303",
    "1304",
    "1305",
    "1306",
    "1316",
    "1317",
    "1318",
    "1319",
    "1320",
    "1029",
    "admin offices",
    "front receptionist",
    "entrance",
    "attendance office",
    "registrar's office",
    "testing office",
    "choir",
    "1606",
    "orchestra",
    "1616",
    "band",
    "1601",
    "1631",
    "auditorium",
    "theatre",
    "1810",
    "1828",
    "cosmetology",
    "1832",
    "performance gym",
    "gym 1",
    "gym 2",
    "gym",
    "dance",
    "2705",
    "1427",
    "1427b",
    "1418",
    "1419",
    "1420",
    "cafeteria",
    "commons",
    "1527",
    "1537",
    "1538",
    "1541",
    "1554",
    "1557",
    "1504",
    "1505",
    "1508",
    "1509",
    "1512",
    "1560",
    "portables",
    "portable",
    "2202",
    "2203",
    "2204",
    "2205",
    "2206",
    "2209",
    "2214",
    "2227",
    "2228",
    "2229",
    "2230",
    "2231",
    "floor 2 ap office",
    "2101",
    "2102",
    "2110",
    "2111",
    "2130",
    "2123",
    "2116",
    "2117",
    "2302",
    "2303",
    "2304",
    "2305",
    "2306",
    "2320",
    "2321",
    "2322",
    "2323",
    "2324",
    "2012",
    "2013",
    "2014",
    "2015",
    "2007",
    "2008",
    "2009",
    "2010",
    "2001",
    "2004",
    "floor 2 library",
    "3202",
    "3203",
    "3204",
    "3205",
    "3206",
    "3221",
    "3222",
    "3223",
    "3224",
    "3225",
    "floor 3 counselor pod",
    "3105",
    "3106",
    "3115",
    "3115",
    "3131",
    "3124",
    "3121",
    "3122",
    "3302",
    "3303",
    "3304",
    "3305",
    "3306",
    "3316",
    "3317",
    "3318",
    "3319",
    "3320",
    "floor 3 library",
    "3132",
    "4202",
    "4203",
    "4204",
    "4205",
    "4206",
    "4216",
    "4217",
    "4218",
    "4219",
    "4220",
    "floor 4 ap office",
    "4101",
    "4102",
    "4109",
    "4110",
    "4124",
    "4123",
    "4116",
    "4117",
    "4302",
    "4303",
    "4304",
    "4305",
    "4306",
    "4320",
    "4321",
    "4322",
    "4323",
    "4324",
    "lgi",
    "4125",
  ];
  // List of valid room numbers

  useEffect(() => {
    room1Item = (data as Room[]).find((item) => item.roomId.includes(room1));
    room2Item = (data as Room[]).find((item) => item.roomId.includes(room2));
    floor1Item = (floor_data as Floor[]).find(
      (item) => item.id === room1Item?.floor
    );

    if (
      floor1Item &&
      room1Item &&
      room2Item &&
      room1Item.floor !== room2Item.floor
    ) {
      if (!elevatorsNeeded) {
        let minDistance = Number.MAX_VALUE;
        for (let i = 0; i < floor1Item.stairs.length; i++) {
          if (
            floor1Item.stairs[i].accessibleFloors.includes(room2Item.floor) &&
            minDistance >
              distance(floor1Item.stairs[i].coords, room1Item.coords)
          ) {
            setStairs(floor1Item.stairs[i].coords);
            minDistance = distance(
              floor1Item.stairs[i].coords,
              room1Item.coords
            );
          }
        }
      } else {
        setStairs(
          distance(floor1Item.elevators[0], room1Item.coords) <
            distance(floor1Item.elevators[1], room1Item.coords)
            ? floor1Item.elevators[0]
            : floor1Item.elevators[1]
        );
      }
    }
  }, [room1, room2, data, floor_data, elevatorsNeeded]);

  const handleSubmit = () => {
    setLoading(true);

    if (
      !validRooms.includes(text1.toLowerCase()) ||
      !validRooms.includes(text2.toLowerCase())
    ) {
      setError("Both rooms must be valid.");
    } else {
      setRoom1(text1);
      setRoom2(text2);

      setError(null);
    }

    setLoading(false);
  };

  return (
    // <ImageBackground
    //   source={require("@/assets/images/GenericBG.png")}
    //   resizeMode="cover"
    //   style={styles.container}
    // >
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ marginTop: 50, paddingBottom: 100 }}
        style={{ marginBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>School Map</Text>

        <AutoCompleteTextInput
          style={{
            width: "75%",
            marginTop: "10%",
            borderColor: "gray",
            borderWidth: 3,
            alignSelf: "center",
            padding: 10,
            color: "#ffffff",
          }}
          onChangeText={setText1}
          value={text1}
          keyboardType="default"
          placeholder="Enter the Room you're at now"
          possibleInputs={validRooms}
        />
        <AutoCompleteTextInput
          style={{
            width: "75%",
            marginTop: "7%",
            borderColor: "gray",
            borderWidth: 3,
            alignSelf: "center",
            padding: 10,
            color: "#ffffff",
          }}
          onChangeText={setText2}
          value={text2}
          keyboardType="default"
          placeholder="Enter the Room you're going"
          possibleInputs={validRooms}
        />
        {error && error !== "Blank Error" && (
          <Text style={styles.error}>{error}</Text>
        )}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: "10%",
            marginVertical: 10,
          }}
        >
          <View
            style={{
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BouncyCheckbox
              onPress={(isChecked: boolean) => {
                setElevatorUse(isChecked);
              }}
              fillColor={Colors.elevatorNeededButton}
            />
            <Text
              style={{
                textAlign: "center",
                color: "#fff",
                paddingTop: 10,
                fontWeight: "bold",
              }}
            >
              Elevator Needed
            </Text>
          </View>
          <AwesomeButton
            style={{}}
            backgroundColor={Colors.mapSubmitButton}
            backgroundDarker={Colors.mapSubmitButtonDark}
            height={60}
            width={150}
            raiseLevel={10}
            onPressOut={handleSubmit}
          >
            <Text style={{ fontWeight: "bold" }}>Find Path!</Text>
          </AwesomeButton>
        </View>

        {!error && !loading && room1Item && room2Item && (
          //router.push: Startpos Col,Startpos Row,Endpos Col,Endpos Row,Floor
          <TouchableOpacity
            onPress={() =>
              router.push(
                "/imageZoom/" +
                  room1Item?.coords.Col +
                  "," +
                  room1Item?.coords.Row +
                  "," +
                  (room1Item?.floor !== room2Item?.floor
                    ? chosenStairs.Col + "," + chosenStairs.Row
                    : room1Item?.coords.Col + "," + room1Item?.coords.Row) +
                  "," +
                  room1Item?.floor
              )
            }
            style={{ marginTop: 30 }}
          >
            <GridMap
              startPos={room1Item.coords}
              endPos={
                room1Item.floor !== room2Item.floor
                  ? chosenStairs
                  : room2Item.coords
              }
              floor={room1Item.floor}
              paddingHorizontal={15}
            />
          </TouchableOpacity>
        )}
        {!error &&
          !loading &&
          room1Item &&
          room2Item &&
          room1Item.floor !== room2Item.floor && (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/imageZoom/" +
                    chosenStairs.Col +
                    "," +
                    chosenStairs.Row +
                    "," +
                    room2Item?.coords.Col +
                    "," +
                    room2Item?.coords.Row +
                    "," +
                    room2Item?.floor
                )
              }
            >
              <GridMap
                startPos={chosenStairs}
                endPos={room2Item.coords}
                floor={room2Item.floor}
                paddingHorizontal={15}
              />
            </TouchableOpacity>
          )}
      </ScrollView>
    </View>
    //</ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.overallBackground,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    justifyContent: "flex-start",
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 30,
    color: "white",
    borderWidth: 5,
    borderColor: Colors.mapTitleBorderColor,
    width: "50%",
    alignSelf: "center",
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "white",
  },
});

export default Map;
