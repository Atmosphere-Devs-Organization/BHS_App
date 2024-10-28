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

let loadingBridgelandStudentAccess: boolean = false;

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
          assignmentsArr.forEach(function (assignment: string[]) {
            let assignmentGrade = Number.parseFloat(assignment[3]);
            let maxAssignmentGrade = Number.parseFloat(assignment[4]);
            let dateArr = assignment[1].split("/");

            coursesData[i].addAssignment(
              new Grade(
                assignment[2],
                assignment[0],
                assignmentGrade
                  ? assignmentGrade
                  : assignment[3].toLowerCase().indexOf("z") != -1
                  ? 0
                  : assignment[3].startsWith("0")
                  ? 0
                  : -100,
                maxAssignmentGrade,
                new Date(
                  Number.parseInt(dateArr[2]),
                  Number.parseInt(dateArr[0]) - 1,
                  Number.parseInt(dateArr[1])
                )
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

          if (coursesData[i].overallGrade == -100) {
            coursesData[i].overallGrade = CalculateOverallAverage(
              coursesData[i],
              calculateAssignmentTypePercentages(coursesData[i])
            );
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
    loadingBridgelandStudentAccess = true;

    let studentInfoResponse = await fetchStudentInfo(
      "info",
      username,
      password
    );
    hasAccess = studentInfoResponse
      ? studentInfoResponse["school"].toLowerCase().includes("bridgeland")
      : false;

    loadingBridgelandStudentAccess = false;
  }
}
export async function getAccessStatus(): Promise<boolean> {
  return hasAccess;
}
export async function getBHSStudentLoadingStatus(): Promise<boolean> {
  return loadingBridgelandStudentAccess;
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
export function neededScore(
  course: Course | null | undefined, 
  endAvg: number, 
  category: string 
): number | null {
  if (!course) {
    return null;
  }

  endAvg = endAvg - .5;
  let cfuTotal = 0;
  let cfuMaxTotal = 0;
  let raTotal = 0;
  let raMaxTotal = 0;
  let saTotal = 0;
  let saMaxTotal = 0;
  //changing category to be fully written out 
  if(category === "CFU")
  {
    category = "checking for understanding";
    console.log("here" + category);
    console.log();

  }
  if(category === "RA")
  {
    category = "relevant applications";
  }
  if(category === "SA")
  {
    category = "summative assessments";
  }

  // Calculate totals for each category
  for (const grade of course.grades) {
    if (grade.grade >= 0) {
      switch (grade.assignmentType.toLowerCase()) {
        case "checking for understanding":
          cfuTotal += grade.grade;
          cfuMaxTotal += grade.maxGrade;
          break;
        case "relevant applications":
          raTotal += grade.grade;
          raMaxTotal += grade.maxGrade;
          break;
        case "summative assessments":
          saTotal += grade.grade;
          saMaxTotal += grade.maxGrade;
          break;
      }
    }
  }

  const cfuPercent = cfuMaxTotal > 0 ? (cfuTotal / cfuMaxTotal) * 100 : 0;
  const raPercent = raMaxTotal > 0 ? (raTotal / raMaxTotal) * 100 : 0;
  const saPercent = saMaxTotal > 0 ? (saTotal / saMaxTotal) * 100 : 0;
  console.log(course.cfuPercent)
  console.log(course.raPercent)
  console.log(course.saPercent)

  //this part calculates the total weight we will be using 
  let totalUsing = 0; 
  if (category.toLowerCase() === "checking for understanding" || cfuMaxTotal !== 0)
  {
    if(course.cfuPercent <= 0){
      return null;
    }
    totalUsing += course.cfuPercent;
  }
  if (category.toLowerCase() === "relevant applications" || raMaxTotal !== 0)
  {
    if(course.raPercent <= 0){
      return null;
    }
    totalUsing += course.raPercent;
  }
  if (category.toLowerCase() === "summative assessments" || saMaxTotal !== 0)
  {
    if(course.saPercent <= 0){
      return null;
    }
    totalUsing += course.saPercent;
  }
  console.log(totalUsing);

  //now we will cut out the other categories so that 
  //we can find out the end weight we need the selected category to end up with
  let neededWeight = endAvg * totalUsing;
  if (category.toLowerCase() !== "checking for understanding" && course.cfuPercent > 0)
  {
    console.log("cfu");
    neededWeight -= cfuPercent * course.cfuPercent;
  }
  if (category.toLowerCase() !== "relevant applications" && course.raPercent > 0)
  {
    console.log("ra");
    neededWeight -= raPercent * course.raPercent;
  }
  if (category.toLowerCase() !== "summative assessments" && course.saPercent > 0)
  {
    console.log("sa");
    neededWeight -= saPercent * course.saPercent;
  }

  let returning = 0;
  if (category.toLowerCase() === "checking for understanding")
    {
      console.log("want cfu");
      let neededPercent =  neededWeight / course.cfuPercent  / 100;
      console.log("needed percentage");
      console.log(neededPercent);
      returning = neededPercent * (cfuMaxTotal + 100) - cfuTotal;
    }
    if (category.toLowerCase() === "relevant applications" )
    {
      console.log("want cfu");
      let neededPercent =  neededWeight / course.raPercent / 100;
      returning = neededPercent * (raMaxTotal + 100) - raTotal;    }
    if (category.toLowerCase() === "summative assessments")
    {
      console.log("want cfu");
      let neededPercent =  neededWeight / course.saPercent / 100;
      returning = neededPercent * (saMaxTotal + 100) - saTotal;   
    }
    return returning;

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
