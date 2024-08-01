import { Text, SafeAreaView } from "react-native";
import React, { useState } from "react";
import axios from "axios";

const Grades = () => {
  // const HAC_Link = "https://home-access.cfisd.net";
  // const User = "s184491";
  // const Pass = "Gabby2007";

  // const [targetData, setTargetData] = useState(
  //   "2019-2020 School Year - Semester "
  // );
  // const [apiSection, setApiSection] = useState("transcript");

  // const fetchStudentInfo = async () => {
  //   try {
  //     const response = await axios.get(
  //       "https://homeaccesscenterapi.vercel.app/api/" +
  //         apiSection +
  //         "?link=" +
  //         HAC_Link +
  //         "/&user=" +
  //         User +
  //         "&pass=" +
  //         Pass
  //     );

  //     console.log(response.data[targetData]);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // fetchStudentInfo();
  return (
    <SafeAreaView>
      <Text>Coming Soon</Text>
    </SafeAreaView>
  );
};

export default Grades;
