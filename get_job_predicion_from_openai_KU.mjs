import 'dotenv/config';
import { Configuration, OpenAIApi } from "openai";
import XLSX from 'xlsx';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

var AllStudentsJobsData = [];

function generateTimestamp() {
  var date = new Date();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  var hours = ("0" + date.getHours()).slice(-2);
  var minutes = ("0" + date.getMinutes()).slice(-2);
  var seconds = ("0" + date.getSeconds()).slice(-2);
  
  var timestamp = "(" + month + "-" + day + ")_[" + hours + ":" + minutes + ":" + seconds + "]";
  return timestamp;
}
function parseExcelFile(file) {
  const workbook = XLSX.readFile(file);
  const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const nestedList = {};


  // Start from the second row (index 1) to skip the header
  for (let i = 1; i < jsonData.length; i++) {
    const rowData = jsonData[i];
    const studentID = rowData[0];
    const skill = rowData[2];
    const grade = rowData[3];

    // Check if the student ID already exists in the nested list
    if (!nestedList.hasOwnProperty(studentID)) {
      nestedList[studentID] = [];
    }

    // Push the grade to the corresponding student ID
    nestedList[studentID].push({ skill, grade });
  }

  return nestedList;
}
function writeToExcelFile(data, path) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jobs Prediction');

  XLSX.writeFile(workbook, path);
}

async function getJobPredictionForOneStudent(studentID,input){
  // UAE KHALIFA UNIVERSITY 
  const prompt = [
        {
          role: "user", 
          content: `Give me the top 5 most suitable job titles list in the UAE for a student with the following skills level without any description:${input} `
        }];

    if (!configuration.apiKey) {
      console.error(`OpenAI API key not configured, please follow instructions in README.md`);
      return;
    }

    try {
      const completion1 = await openai.createChatCompletion({
        model: "gpt4",
        messages: prompt,
        temperature: 0,
        maxTokens: 64,
      });
  
      const result = completion1.data.choices[0].message.content;
      // OUTPUT

      console.log(studentID +" " + input +":\n" + result);

      const data = { 'Name': studentID , 'grades': input,  'Jobs title':  result};
      AllStudentsJobsData.push(data);
    
      // gradeResults[key] = result;

    } catch(error) {
      if (error.response) {
        console.error(error.response.status, error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
      }
    }
}

async function getJobPredictionForAllStudents(studentGrades) {

  var input = "";
  var index = 0;
  
  for (const studentID in studentGrades) {
    const student = studentGrades[studentID];
    // console.log(studentID + " -> ", student);
    // break;
    input +=   student[0].grade + ", " + student[0].skill + " " ;
    // input += ", " + student[0].grade + " "+ student[1].skill + " skill ";
    // input += ", " + student[0].grade + " "+ student[2].skill + " skill ";
    // input += ", " + student[0].grade + " "+ student[3].skill + " skill ";
    // input += ", " + student[0].grade + " "+ student[4].skill + " skill ";
    console.log(studentID + "  input -> ", input);
    await getJobPredictionForOneStudent(studentID,input);
    input = "";
    if (++index > 2) break;
  }
  console.log("\nAllStudentsJobsData\n");
  console.log(AllStudentsJobsData);
  writeToExcelFile(AllStudentsJobsData, "./StudentJobPrediction_" + generateTimestamp() + ".xlsx");
}

// ---------- // 

const excelFile = 'students_subject_grade.xlsx';
const studentGrades = parseExcelFile(excelFile);
getJobPredictionForAllStudents(studentGrades);

// ----- // 
// Psychology , year of study 