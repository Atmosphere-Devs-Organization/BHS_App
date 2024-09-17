import { deepCopy } from "@/components/deep-copy";
import axios from "axios";
import { useState } from "react";

export class Grade {
  constructor(
    public assignmentType: string,
    public assignmentName: string,
    public grade: number,
    public maxGrade: number,
    public date: Date
  ) {}
}

// Class to represent a course
export class Course {
  constructor(
    public name: string,
    public overallGrade: number,
    public grades: Grade[],
    public cfuPercent: number,
    public raPercent: number,
    public saPercent: number
  ) {}

  addAssignment(assignment: Grade): Course {
    for (let i = 0; i < this.grades.length; i++) {
      if (this.grades[i].date <= assignment.date) {
        this.grades.splice(i, 0, assignment);
        return this;
      }
    }

    this.grades.push(assignment);
    return this;
  }
  deleteAssignment(assignment: Grade | undefined) {
    if (!assignment) {
      return;
    }

    this.grades.forEach((item, index) => {
      if (item === assignment) this.grades.splice(index, 1);
    });
  }
  sortGrades(): Course {
    this.grades.sort((grade1: Grade, grade2: Grade) =>
      grade1.date === grade2.date ? 0 : grade1.date < grade2.date ? 1 : -1
    );
    return this;
  }

  copy(): Course {
    return deepCopy(this);
  }
}

let courses: Course[] | null | undefined = null;
let HACBroken: boolean = false;

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
    HACBroken = false;
    return response.data;
  } catch (error) {
    HACBroken = error == "AxiosError: Request failed with status code 500";
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
          let grade = Number.parseInt(gradesData[value]["average"].trim());
          coursesData[i] = new Course(
            value.split(" - ")[1].split(" Marking")[0].substring(2),
            grade ? grade : -100,
            [],
            0,
            0,
            0
          );

          let assignmentsArr = gradesData[value]["assignments"];
          assignmentsArr.forEach(function (assignment: any[]) {
            let assignmentGrade = Number.parseInt(assignment[3]);
            let maxAssignmentGrade = Number.parseInt(assignment[4]);
            let dateArr = assignment[1].split("/");

            coursesData[i].addAssignment(
              new Grade(
                assignment[2],
                assignment[0],
                assignmentGrade
                  ? assignmentGrade
                  : assignment[3].toLowerCase().indexOf("z") != -1
                  ? 0
                  : -100,
                maxAssignmentGrade,
                new Date(dateArr[2] + "-" + dateArr[0] + "-" + dateArr[1])
              )
            );
          });

          let percentagesArr = gradesData[value]["percentages"];
          percentagesArr.forEach(function (percentage: string) {
            let percentageSplit: string[] = percentage.split(" : ");
            if (percentageSplit[0].toLowerCase().indexOf("check") != -1) {
              coursesData[i].cfuPercent = Number.parseFloat(percentageSplit[1]);
            } else if (
              percentageSplit[0].toLowerCase().indexOf("relevant") != -1
            ) {
              coursesData[i].raPercent = Number.parseFloat(percentageSplit[1]);
            } else if (
              percentageSplit[0].toLowerCase().indexOf("summative") != -1
            ) {
              coursesData[i].saPercent = Number.parseFloat(percentageSplit[1]);
            }
          });

          if (coursesData[i].cfuPercent > 0 && coursesData[i].raPercent > 0) {
            coursesData[i].saPercent =
              100 - coursesData[i].cfuPercent - coursesData[i].raPercent;
          } else if (
            coursesData[i].raPercent > 0 &&
            coursesData[i].saPercent > 0
          ) {
            coursesData[i].cfuPercent =
              100 - coursesData[i].raPercent - coursesData[i].saPercent;
          } else if (
            coursesData[i].saPercent > 0 &&
            coursesData[i].cfuPercent > 0
          ) {
            coursesData[i].raPercent =
              100 - coursesData[i].saPercent - coursesData[i].cfuPercent;
          }

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

export function calculateAssignmentTypePercentages(
  course: Course | null | undefined
): number[] | null {
  if (!course) {
    return null;
  }

  let cfuTotal: number = 0;
  let cfuMaxTotal: number = 0;
  let raTotal: number = 0;
  let raMaxTotal: number = 0;
  let saTotal: number = 0;
  let saMaxTotal: number = 0;

  for (let i = 0; i < course.grades.length; i++) {
    if (
      course.grades[i].assignmentType.toLowerCase() == "summative assessments"
    ) {
      if (course.grades[i].grade >= 0) {
        saTotal += course.grades[i].grade;
        saMaxTotal += course.grades[i].maxGrade;
      }
    } else if (
      course.grades[i].assignmentType.toLowerCase() == "relevant applications"
    ) {
      if (course.grades[i].grade >= 0) {
        raTotal += course.grades[i].grade;
        raMaxTotal += course.grades[i].maxGrade;
      }
    } else if (
      course.grades[i].assignmentType.toLowerCase() ==
      "checking for understanding"
    ) {
      if (course.grades[i].grade >= 0) {
        cfuTotal += course.grades[i].grade;
        cfuMaxTotal += course.grades[i].maxGrade;
      }
    }
  }

  let cfuPercent = cfuMaxTotal <= 0 ? -100 : (cfuTotal / cfuMaxTotal) * 100;
  let raPercent = raMaxTotal <= 0 ? -100 : (raTotal / raMaxTotal) * 100;
  let saPercent = saMaxTotal <= 0 ? -100 : (saTotal / saMaxTotal) * 100;

  return new Array(cfuPercent, raPercent, saPercent);
}

export function CalculateOverallAverage(
  course: Course | null | undefined,
  percentagesArr: number[] | null
): number {
  if (!course || !percentagesArr) {
    return 0;
  }

  let cfuWeight = course.cfuPercent;
  let raWeight = course.raPercent;
  let saWeight = course.saPercent;

  let maxPoints =
    (percentagesArr[0] == -100 ? 0 : cfuWeight) +
    (percentagesArr[1] == -100 ? 0 : raWeight) +
    (percentagesArr[2] == -100 ? 0 : saWeight);

  return maxPoints == 0
    ? 100
    : (((percentagesArr[0] == -100 ? 0 : percentagesArr[0]) *
        (cfuWeight / 100.0) +
        (percentagesArr[1] == -100 ? 0 : percentagesArr[1]) *
          (raWeight / 100.0) +
        (percentagesArr[2] == -100 ? 0 : percentagesArr[2]) *
          (saWeight / 100.0)) /
        maxPoints) *
        100;
}
