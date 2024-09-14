import axios from "axios";
import { useState } from "react";

export class Grade {
  constructor(
    public assignmentType: string,
    public assignmentName: string,
    public grade: number,
    public date: Date
  ) {}
}

// Class to represent a course
export class Course {
  constructor(
    public name: string,
    public overallGrade: number,
    public grades: Grade[]
  ) {}

  addAssignment(assignment: Grade) {
    this.grades[this.grades.length] = assignment;
  }
}

let courses: Course[] | null | undefined = null;
export const [HACBroken, setHACBroken] = useState<boolean>(false);

const HAC_Link = "https://home-access.cfisd.net";

let specCharsMap = new Map<string | undefined, string>();
specCharsMap.set(" ", "%20");
specCharsMap.set("#", "%23");
specCharsMap.set("&", "%26");
specCharsMap.set("/", "%2F");
specCharsMap.set("?", "%3F");
specCharsMap.set("!", "%21");
specCharsMap.set("$", "%24");
specCharsMap.set("@", "%40");

const fetchStudentInfo = async (
  apiSection: string,
  username: string,
  password: string
): Promise<any> => {
  let tempPassword = "";
  for (let i = 0; i < (password ? password.length : 0); i++) {
    tempPassword += specCharsMap.has(password?.substring(i, i + 1))
      ? specCharsMap.get(password?.substring(i, i + 1))
      : password?.substring(i, i + 1);
  }

  const apiLink =
    "https://home-access-center-ap-iv2-sooty.vercel.app/api/" +
    apiSection +
    "?link=" +
    HAC_Link +
    "/&user=" +
    username +
    "&pass=" +
    tempPassword;

  try {
    const response = await axios.get(apiLink);
    setHACBroken(false);
    return response.data;
  } catch (error) {
    setHACBroken(error == "AxiosError: Request failed with status code 500");
    return undefined;
  }
};

let refreshing: boolean = false;
export async function refreshGradeData(username: string, password: string) {
  refreshing = true;

  courses = null;
  if (username && password) {
    let gradesData = await fetchStudentInfo("assignments", username, password);

    const coursesData: Course[] = [];

    if (gradesData) {
      let i = 0;
      const classesArray = Object.keys(gradesData);
      classesArray.forEach(function (value) {
        if (value.indexOf("dropped") == -1) {
          let grade = Number.parseInt(gradesData[value]["average"]);
          coursesData[i] = new Course(
            value.split(" - ")[1].split(" Marking")[0].substring(2),
            grade ? grade : -100,
            []
          );

          let assignmentsArr = gradesData[value]["assignments"];
          assignmentsArr.forEach(function (assignment: any[]) {
            let assignmentGrade = Number.parseInt(assignment[3]);
            let dateArr = assignment[1].split("/");

            coursesData[i].addAssignment(
              new Grade(
                assignment[2],
                assignment[0],
                assignmentGrade ? assignmentGrade : -100,
                new Date(dateArr[2] + "-" + dateArr[0] + "-" + dateArr[1])
              )
            );
          });
          i++;
        }
      });

      courses = coursesData;
      refreshing = false;
    } else {
      courses = undefined;
      refreshing = false;
    }
  } else {
    courses = undefined;
    refreshing = false;
  }
}

export async function getCourses(): Promise<Course[] | null | undefined> {
  return courses;
}

let hasAccess: boolean = false;
export async function refreshBridgelandStudent(
  username: string,
  password: string
) {
  if (username && password) {
    let studentInfoResponse = await fetchStudentInfo(
      "info",
      username,
      password
    );
    hasAccess = studentInfoResponse
      ? studentInfoResponse["school"].toLowerCase().includes("bridgeland")
      : false;
  }
}
export async function getAccessStatus(): Promise<boolean> {
  return hasAccess;
}
