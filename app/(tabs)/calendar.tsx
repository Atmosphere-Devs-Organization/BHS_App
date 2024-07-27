import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";

const Calendar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return <View>{user ? <NormalCalendar /> : <LoggedOutCalendar />}</View>;
};

const LoggedOutCalendar = () => {
  return (
    <ImageBackground
      style={{
        alignSelf: "center",
        height: "100%",
        width: "100%",
      }}
      source={require("@/assets/images/GenericBG.png")}
      resizeMode="stretch"
    >
      <Text style={{ marginTop: "50%", color: "#fff", textAlign: "center" }}>
        You need to be signed in to access the calendar
      </Text>
    </ImageBackground>
  );
};

const NormalCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<{ date: string; title: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string>("");

  const irlDate = new Date();

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const handleAddEvent = () => {
    if (selectedDate && eventTitle) {
      setEvents([...events, { date: selectedDate, title: eventTitle }]);
      setEventTitle("");
    }
  };

  const handleRemoveEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const days = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = firstDayOfMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  const daysArray = Array.from(
    {
      length:
        currentDate.getFullYear() > irlDate.getFullYear() ||
        (currentDate.getFullYear() === irlDate.getFullYear() &&
          currentDate.getMonth() > irlDate.getMonth())
          ? days
          : currentDate.getFullYear() === irlDate.getFullYear() &&
            currentDate.getMonth() === irlDate.getMonth()
          ? days - irlDate.getDate() + 1
          : 0,
    },
    (_, i) =>
      i +
      (currentDate.getMonth() === irlDate.getMonth() &&
      currentDate.getFullYear() === irlDate.getFullYear()
        ? irlDate.getDate()
        : 1)
  );
  const blankDays = Array.from(
    {
      length:
        currentDate.getFullYear() > irlDate.getFullYear() ||
        (currentDate.getFullYear() === irlDate.getFullYear() &&
          currentDate.getMonth() > irlDate.getMonth())
          ? firstDay
          : currentDate.getFullYear() === irlDate.getFullYear() &&
            currentDate.getMonth() === irlDate.getMonth()
          ? firstDay + irlDate.getDate() - 1
          : days,
    },
    (_, i) => ""
  );

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <ImageBackground
      style={styles.calendarContainer}
      source={require("@/assets/images/GenericBG.png")}
    >
      <SafeAreaView style={styles.calendarContainer}>
        {!isKeyboardVisible && (
          <View style={styles.headerContainer}>
            <Button title="Prev" onPress={handlePrevMonth} />
            <Text style={styles.header}>
              {currentDate.toLocaleString("default", { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </Text>
            <Button title="Next" onPress={handleNextMonth} />
          </View>
        )}
        {!isKeyboardVisible && (
          <View style={styles.daysOfWeekContainer}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, index) => (
                <Text key={index} style={styles.dayOfWeek}>
                  {day}
                </Text>
              )
            )}
          </View>
        )}
        {!isKeyboardVisible && (
          <View style={styles.daysContainer}>
            {blankDays.map((_, index) => (
              <View key={`blank-${index}`} style={styles.dayBox} />
            ))}
            {daysArray.map((day) => {
              const dateStr = `${currentDate.getFullYear()}-${
                currentDate.getMonth() + 1
              }-${day}`;
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayBox,
                    selectedDate === dateStr && styles.selectedDayBox,
                  ]}
                  onPress={() => setSelectedDate(dateStr)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDate === dateStr && styles.selectedDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {selectedDate && (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.eventInputContainer}>
              <Text style={styles.selectedDateText}>
                Selected Date: {formatDate(selectedDate)}
              </Text>
              <TextInput
                style={styles.input}
                value={eventTitle}
                onChangeText={setEventTitle}
                placeholder="Event Title"
              />
              <Button title="Add Event" onPress={handleAddEvent} />
              <FlatList
                data={events.filter((event) => event.date === selectedDate)}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.eventItem}>
                    <Text>{item.title}</Text>
                    <Button
                      title="Remove"
                      onPress={() => handleRemoveEvent(index)}
                    />
                  </View>
                )}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
  },
  calendarContainer: { padding: 10, height: "110%" },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    marginTop: 50,
  },
  daysOfWeekContainer: {
    flexDirection: "row",
  },
  dayOfWeek: {
    width: "14.28%",
    textAlign: "center",
    fontWeight: "bold",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayBox: {
    width: "14.28%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: Colors.dayBox,
  },
  selectedDayBox: {
    backgroundColor: "red",
  },
  dayText: {
    color: "#000",
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "bold",
  },
  eventInputContainer: {
    marginTop: 20,
    height: "100%",
  },
  selectedDateText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginVertical: 10,
    borderRadius: 4,
  },
  eventItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});

export default Calendar;
