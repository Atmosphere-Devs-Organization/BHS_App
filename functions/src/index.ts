// instructions:
// cd functions to get into this folder
// then you can run commands
//tutrial: reached until 13:30
// https://www.youtube.com/watch?v=2u6Zb36OQjM

// You can use ESM or CJS.
// ESM:
import * as v2 from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
// import * as v1 from 'firebase-functions/v1'; //difffrernt version options

// CJS
//const functions = require('firebase-functions');
//type Indexable = { [key: string]: any };

interface LoginResult {
  success: boolean;
  error?: string;
  client?: AxiosInstance;
}

async function loginHandler(
  username: string,
  password: string,
  link: string
): Promise<LoginResult> {
  const loginLink = `${link}/HomeAccess/Account/LogOn?ReturnUrl=%2fHomeAccess%2f`;

  const loginData: { [key: string]: string } = {
    __RequestVerificationToken: "",
    SCKTY00328510CustomEnabled: "True",
    SCKTY00436568CustomEnabled: "True",
    Database: "10",
    VerificationOption: "UsernamePassword",
    "LogOnDetails.UserName": username,
    tempUN: "",
    tempPW: "",
    "LogOnDetails.Password": password,
  };

  try {
    const cookieJar = new CookieJar();
    const client = wrapper(
      axios.create({
        jar: cookieJar,
        withCredentials: true,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        },
      })
    );

    // Step 1: Initial GET request to retrieve the verification token and cookies
    const response = await client.get(loginLink, {
      headers: {},
    });
    const cheerio = require("cheerio");

    const $ = cheerio.load(response.data);

    // Get the value of __RequestVerificationToken
    const requestVerificationToken: any = $(
      "input[name='__RequestVerificationToken']"
    ).val();
    if (!requestVerificationToken) {
      return {
        success: false,
        error: "Could not find verification token",
      };
    }

    // Update login data with the retrieved token
    loginData["__RequestVerificationToken"] = requestVerificationToken;

    // Step 2: POST request with login data and cookies
    const loginResponse = await client.post(
      loginLink,
      new URLSearchParams(loginData),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //maxRedirects: 0, // Prevent automatic redirection to capture URL
        validateStatus: (status) => status === 302 || status === 200, // Accept 302 redirect as well as 200 status
      }
    );

    // Step 3: Check if login was successful by seeing if there is a set-cookie header

    // Extract cookies from the login response
    const loginFailedCookies = loginResponse.headers["set-cookie"];
    if (loginFailedCookies) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }

    return { success: true, client };
  } catch (error: any) {
    // Provide more error details
    console.log("Error!");
    console.error("Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.message || "An error occurred",
    };
  }
}

export const getAssignments = v2.https.onRequest((request, response) => {
  // this function pretends we are a webstie and the
  // user selected an item and we want to send them
  // the description of their item.
  // const name = request.params[0];
  // const items: Indexable = { lamp: "this is a lamp", chair: "good chair" };
  // const message = items[name];
  // response.send(`<h1>${message}</h1>`);

  const cheerio = require("cheerio");

  const callLoginAndAssignment = async (
    username: any,
    password: any
  ): Promise<any> => {
    console.log("Username: " + username + ", Password: " + password);
    const loginStatus: LoginResult = await loginHandler(
      username,
      password,
      "https://home-access.cfisd.net"
    );
    console.log(
      loginStatus.success
        ? "Login Succeeded"
        : "Login Failed: " + loginStatus.error
    );

    if (loginStatus.success) {
      const assignmentURL = `https://home-access.cfisd.net/HomeAccess/Content/Student/Assignments.aspx`;
      const assignmentResponse = await loginStatus.client?.get(assignmentURL, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //maxRedirects: 0, // Prevent automatic redirection to capture URL
        validateStatus: (status) => status === 200, // Accept 200 status
      });

      interface ScrapedData {
        average: string;
        assignments: string[][];
        percentages: string[];
      }

      let $ = cheerio.load(assignmentResponse?.data);

      const classes: string[] = [];
      const averages: string[] = [];
      const assignments: string[][][] = [];
      const assignmentPercentages: string[][] = [];

      $("div.AssignmentClass").each((index: any, element: any) => {
        const classArr = $("div.sg-header", element).text().split(/\s+/);
        const className: string = classArr.join(" ");

        if (className.length > 0) {
          const averageText = $("span.sg-header-heading", element).text();
          const average =
            averageText.length === 0 ? "No Average" : averageText.slice(18);

          classes.push(
            className
              .substring(
                10,
                className.indexOf("Marking") == -1
                  ? className.length
                  : className.indexOf("Marking")
              )
              .trim()
          );
          averages.push(average);
        }

        const currAssignments: string[][] = [];
        $(
          "div.sg-content-grid > table.sg-asp-table > tbody > tr.sg-asp-table-data-row",
          element
        ).each((_: any, el: any) => {
          const assignment: string[] = [
            $(el).find("td").eq(2).text().replace(/\*/g, "").trim(),
            $(el).find("td").eq(0).text().replace(/\*/g, "").trim(),
            $(el).find("td").eq(3).text().replace(/\*/g, "").trim(),
            $(el).find("td").eq(4).text().replace(/\*/g, "").trim(),
            $(el).find("td").eq(5).text().replace(/\*/g, "").trim(),
          ];
          currAssignments.push(assignment);
        });
        assignments.push(currAssignments);

        const percentages: string[] = [];
        $(
          "div.sg-content-grid > div.sg-asp-table-group > span.LabelCatogery > div.sg-view-quick > table.sg-asp-table",
          element
        ).each((_: any, elem: any) => {
          $("tr.sg-asp-table-data-row", elem).each((_: any, el: any) => {
            const percentage =
              `${$(el).find("td").eq(0).text()}` +
              " : " +
              `${$(el).find("td").eq(4).text()}`;
            percentages.push(percentage);
          });
        });
        assignmentPercentages.push(percentages);
      });

      const result: { [key: string]: ScrapedData } = {};

      for (let i = 0; i < classes.length; i++) {
        result[classes[i]] = {
          average: averages[i],
          assignments: assignments[i],
          percentages: assignmentPercentages[i],
        };
      }

      response.send(result);
    }
  };

  callLoginAndAssignment(request.query["username"], request.query["password"]);
});

export const getInfoAndTranscript = onRequest((request, response) => {
  // this function pretends we are a webstie and the
  // user selected an item and we want to send them
  // the description of their item.
  // const name = request.params[0];
  // const items: Indexable = { lamp: "this is a lamp", chair: "good chair" };
  // const message = items[name];
  // response.send(`<h1>${message}</h1>`);

  const cheerio = require("cheerio");

  const callLoginAndInfo = async (
    username: any,
    password: any
  ): Promise<any> => {
    console.log("Username: " + username + ", Password: " + password);
    const loginStatus: LoginResult = await loginHandler(
      username,
      password,
      "https://home-access.cfisd.net"
    );
    console.log(
      loginStatus.success
        ? "Login Succeeded"
        : "Login Failed: " + loginStatus.error
    );

    if (loginStatus.success) {
      const transcriptURL = `https://home-access.cfisd.net/HomeAccess/Content/Student/Transcript.aspx`;
      const transcriptResponse = await loginStatus.client?.get(transcriptURL, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //maxRedirects: 0, // Prevent automatic redirection to capture URL
        validateStatus: (status) => status === 200, // Accept 200 status
      });
      const infoURL = `https://home-access.cfisd.net/HomeAccess/Content/Student/Registration.aspx`;
      const infoResponse = await loginStatus.client?.get(infoURL, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //maxRedirects: 0, // Prevent automatic redirection to capture URL
        validateStatus: (status) => status === 200, // Accept 200 status
      });

      interface Semester {
        year?: string;
        semester?: string;
        grade?: string;
        school?: string;
        data?: string[][];
        credits?: string;
      }

      interface Transcript {
        [key: string]: Semester | string;
      }

      function combineSemesters(sem1: string[], sem2: string[]): string[] {
        const newClass: string[] = [];
        newClass.push(sem1[0]);
        newClass.push(sem1[1]);
        newClass.push(sem2[2] == "" ? sem1[2] : sem2[2]);
        newClass.push(sem2[3] == "" ? sem1[3] : sem2[3]);
        newClass.push(
          "" + (Number.parseFloat(sem1[4]) + Number.parseFloat(sem2[4]))
        );

        return newClass;
      }

      const transcriptJson: Transcript = {};

      let $ = cheerio.load(transcriptResponse?.data);

      // First table: Semester details
      $("td.sg-transcript-group").each((_: any, element: any) => {
        const semester: Semester = {};

        // Extracting year, semester, grade, school
        $(element)
          .find("table > tbody > tr > td > span")
          .each((_: any, el: any) => {
            const id = $(el).attr("id");
            const text = $(el).text().trim();

            if (id?.includes("YearValue")) {
              semester.year = text;
            } else if (id?.includes("GroupValue")) {
              semester.semester = text;
            } else if (id?.includes("GradeValue")) {
              semester.grade = text;
            } else if (id?.includes("BuildingValue")) {
              semester.school = text;
            }
          });

        // Second table: Class data
        const finalData: string[][] = [];
        $(element)
          .find("table:nth-child(2) > tbody > tr")
          .each((_: any, row: any) => {
            if (
              $(row).hasClass("sg-asp-table-header-row") ||
              $(row).hasClass("sg-asp-table-data-row")
            ) {
              const rowData: string[] = [];
              $(row)
                .find("td")
                .each((_: any, cell: any) => {
                  rowData.push($(cell).text().trim());
                });
              finalData.push(rowData);
            }
          });
        const classData = new Map();
        finalData.forEach(function (classArr: string[]) {
          if (classData.has(classArr[1].toUpperCase())) {
            classData.set(
              classArr[1].toUpperCase(),
              combineSemesters(
                classData.get(classArr[1].toUpperCase()),
                classArr
              )
            );
          } else {
            if (classArr[1].toUpperCase().indexOf("DESCRIPTION") == -1)
              classData.set(classArr[1].toUpperCase(), classArr);
          }
        });

        const finalDataRevised: string[][] = [];
        classData.forEach((value: string[], key: string) => {
          finalDataRevised.push(value);
        });

        semester.data = finalDataRevised;

        // Third table: Credits
        $(element)
          .find("table:nth-child(3) > tbody > tr > td > label")
          .each((_: any, el: any) => {
            const id = $(el).attr("id");
            if (id?.includes("CreditValue")) {
              semester.credits = $(el).text().trim();
            }
          });

        const title = `${semester.year}`;
        transcriptJson[title] = semester;
      });

      // Cumulative GPA Info
      $(
        "table#plnMain_rpTranscriptGroup_tblCumGPAInfo tbody > tr.sg-asp-table-data-row"
      ).each((_: any, row: any) => {
        let text = "";
        let value = "";

        $(row)
          .find("td > span")
          .each((_: any, span: any) => {
            const id = $(span).attr("id");
            const spanText = $(span).text().trim();

            if (id?.includes("GPADescr")) {
              text = spanText;
            }
            if (id?.includes("GPACum")) {
              value = spanText;
            }
            if (id?.includes("GPARank")) {
              transcriptJson["rank"] = spanText;
            }
          });

        if (text) {
          transcriptJson[text] = value;
        }
      });

      //response.send(transcriptJson);

      interface StudentInfo {
        name: string;
        grade: string;
        school: string;
        dob: string;
        counselor: string;
        language: string;
        cohortYear: string;
      }
      $ = cheerio.load(infoResponse?.data);
      let ret: Partial<StudentInfo> = {};

      const mainContent = $("div.sg-main-content");
      if (mainContent.length > 0) {
        ret.grade = mainContent.find("#plnMain_lblGrade").text().trim();
        ret.school = mainContent.find("#plnMain_lblBuildingName").text().trim();
        ret.counselor = mainContent.find("#plnMain_lblCounselor").text().trim();
        ret.language = mainContent.find("#plnMain_lblLanguage").text().trim();
      }

      const infoResponseJson = {
        grade: ret.grade,
        school: ret.school,
        counselor: ret.counselor,
        language: ret.language,
      };

      const overallJson = {
        info: infoResponseJson,
        transcript: transcriptJson,
      };
      response.send(overallJson);
    }
  };

  callLoginAndInfo(request.query["username"], request.query["password"]);
});
