import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";

const Calendar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return <View>{user ? <NormalCalendar user={user} /> : <LoggedOutCalendar />}</View>;
};

const LoggedOutCalendar = () => {
  return (
    <View style={styles.centered}>
      <Text>You need to be signed in to access the calendar</Text>
    </View>
  );
};

const NormalCalendar = ({ user }: { user: User }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<{ date: string; title: string; club: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string>("");

  useEffect(() => {
    fetchUserClubs();
  }, [user]);

  const fetchUserClubs = async () => {
    const userDocRef = doc(FIREBASE_DB, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const clubs = userData.clubs || [];

      const fetchedEvents: { date: string; title: string; club: string }[] = [];
      for (const club of clubs) {
        const clubDocRef = doc(FIREBASE_DB, "clubs", club);
        const datesCollectionRef = collection(clubDocRef, "dates");
        const datesSnapshot = await getDocs(datesCollectionRef);

        datesSnapshot.forEach((doc) => {
          const dateData = doc.data();
          const eventDate = new Date(dateData.date.toDate()).toISOString().split("T")[0];
          fetchedEvents.push({ date: eventDate, title: doc.id, club });
        });
      }

      setEvents(fetchedEvents);
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleAddEvent = () => {
    if (selectedDate && eventTitle) {
      setEvents([...events, { date: selectedDate, title: eventTitle, club: "Personal" }]);
      setEventTitle("");
    }
  };

  const handleRemoveEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const days = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const daysArray = Array.from({ length: days }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDay }, (_, i) => "");

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.headerContainer}>
        <Button title="Prev" onPress={handlePrevMonth} />
        <Text style={styles.header}>
          {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
        </Text>
        <Button title="Next" onPress={handleNextMonth} />
      </View>
      <View style={styles.daysOfWeekContainer}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <Text key={index} style={styles.dayOfWeek}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.daysContainer}>
        {blankDays.map((_, index) => (
          <View key={`blank-${index}`} style={styles.dayBox} />
        ))}
        {daysArray.map((day) => {
          const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const hasEvent = events.some(event => event.date === dateStr);
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayBox,
                selectedDate === dateStr && styles.selectedDayBox,
                hasEvent && styles.eventDayBox
              ]}
              onPress={() => setSelectedDate(dateStr)}
            >
              <Text style={[
                styles.dayText,
                selectedDate === dateStr && styles.selectedDayText
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selectedDate && (
        <View style={styles.eventInputContainer}>
          <Text style={styles.selectedDateText}>Selected Date: {formatDate(selectedDate)}</Text>
          <TextInput
            style={styles.input}
            value={eventTitle}
            onChangeText={setEventTitle}
            placeholder="Event Title"
          />
          <Button title="Add Event" onPress={handleAddEvent} />
          <FlatList
            data={events.filter(event => event.date === selectedDate)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.eventItem}>
                <Text style={styles.clubText}>{item.club}</Text>
                <Text>{item.title}</Text>
                <Button title="Remove" onPress={() => handleRemoveEvent(index)} />
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    padding: 10,
  },
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
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedDayBox: {
    backgroundColor: "red",
  },
  eventDayBox: {
    backgroundColor: "lightblue",
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
    flexDirection: "column",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  clubText: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default Calendar;
