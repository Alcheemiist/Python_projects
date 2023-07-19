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

  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  var hours = ("0" + date.getHours()).slice(-2);
  var minutes = ("0" + date.getMinutes()).slice(-2);
  var seconds = ("0" + date.getSeconds()).slice(-2);
  
  var timestamp = "_" + day + "-" + month + "-" + year +  "_" + hours + ":" + minutes + ":" + seconds;
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
    const grade = rowData[4];

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
function splitSentences(inputString) {
  // Split the input string into an array of sentences using '\n' as the delimiter

  const sentences = inputString.split('\n');

  // Trim leading and trailing whitespace from each sentence
  var trimmedSentences = sentences.map((sentence) => sentence.trim());

  // Remove the first two characters from each sentence
  var modifiedSentences = trimmedSentences.map((sentence) => sentence.slice(2));

  // Return the array of trimmed sentences
  console.log("-> lenght + " + modifiedSentences.length + "\n", modifiedSentences)
  
  if (modifiedSentences.length >= 7) {
    modifiedSentences.shift();
    modifiedSentences.shift();
    console.log("shift >");
  }
    return modifiedSentences;
}
async function getJobPredictionForOneStudent(studentID,input, student){
  // UAE NY UNIVERSITY 
  const prompt = [
      {  
          role: "user",
          content: `Give me the top 5 most suitable job titles list in New York for a PSY100 student graduating in 2023 with the following skills levels, please list the job titles without any description: ${input}`
      }];

    if (!configuration.apiKey) {
      console.error(`OpenAI API key not configured, please follow instructions in README.md`);
      return;
    }

    try {
      const completion1 = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: prompt,
        temperature: 0.9,
      });
  
      const result = completion1.data.choices[0].message.content;
      // OUTPUT

      var res = splitSentences(result);
  
      var data = { 'Name': studentID , "Teamwork / Collaboration": student[0].grade,"Communication": student[1].grade,"Critical Thinking": student[2].grade,"Technology": student[3].grade,"Professionalism": student[4].grade,
        'Job 1':  res[0], 'Job 2':  res[1], 'Job 3':  res[2], 'Job 4':  res[3], 'Job 5':  res[4]};

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
    console.log("-> student " + student[index]);
    input +=   student[0].grade + "/1 grade of " + student[0].skill + " skill " ;
    // input += ", " + student[1].grade + " "+ student[1].skill + " skill ";
    // input += ", " + student[2].grade + " "+ student[2].skill + " skill ";
    // input += ", " + student[3].grade + " "+ student[3].skill + " skill ";
    // input += ", " + student[4].grade + " "+ student[4].skill + " skill ";
    await getJobPredictionForOneStudent(studentID,input, student);
    console.log("-> index " + input);
    input = "";
    // if (++index > 2)
    // break;
  }
  console.log("\nAllStudentsJobsData\n");
  // console.log(AllStudentsJobsData);
  writeToExcelFile(AllStudentsJobsData, "./res/CUNY_StudentJobPrediction_" + generateTimestamp() + ".xlsx");
}
// ---------- // 
const excelFile = './AllStudentsGrads_NY.xlsx';
const studentGrades = parseExcelFile(excelFile);
getJobPredictionForAllStudents(studentGrades);

// ----- // 

// -- write new propmet using jobs list 
// -- change grade to numbers values 

// case1 : 
// - Grades HIGH/MEDIUM/LOW Grades
// - proñpt Give me the top 5 most suitable job titles list in New York for a PSY100 student graduating in 2023 with the following skills levels, please list the job titles without any description:${input} `

//case2 : 

// GRades : High/Medium/Low
// propmt : 
    // Based on this list of Career Paths : 
    // High demand and generally higher pay:

    // Clinical Psychologist: They diagnose and treat mental disorders, learning disabilities, and cognitive, behavioral, and emotional problems.-
    // Counseling Psychologist: They provide therapy to help individuals, groups, couples, or families cope with a wide range of issues.
    // Industrial-Organizational Psychologist: They apply psychological principles and research methods to the workplace to improve productivity and work quality.
    // Neuropsychologist: These specialists work with people suffering from brain injuries and diseases.
    // Health Psychologist: They specialize in how biological, psychological, and social factors affect health and illness.
    // Psychiatrist: Psychiatrists are medical doctors who diagnose and treat mental illnesses (requires medical degree).

    // Moderate demand and generally moderate pay:

    // School Psychologist: They work within the educational system to help children with emotional, social, and academic issues.
    // Forensic Psychologist: They work in the intersection of the legal system and psychology, often assisting in court cases or criminal investigations.
    // Rehabilitation Psychologist: They work with patients suffering from developmental disabilities, injuries, or chronic illnesses to regain functionality.
    // Social Psychologist: They study how people's thoughts, feelings, and behaviors are influenced by the actual, imagined, or implied presence of others.
    // Cognitive Psychologist: They study thought processes, such as how people remember, perceive, think, speak, and solve problems.
    // Research Psychologist: They conduct studies and experiments with human or animal participants to increase the knowledge of various topics within psychology.

    // Lower demand and generally lower pay:

    // Sport Psychologist: They apply psychology to sports and athletes, often focusing on motivation and performance.
    // Developmental Psychologist: They specialize in the psychological development of individuals throughout their life cycle.
    // Experimental Psychologist: They conduct research and experiments in the areas of memory, perception, cognition, and behavior.
    // Educational Psychologist: They study how people learn, often developing learning strategies and teaching methods.
    // Consumer Psychologist: They research consumer behavior and develop marketing strategies for businesses.
    // Geropsychologist: They specialize in the mental health of the elderly.
    // Professor or Academic Researcher: They teach psychology and conduct research at universities or colleges.
    // Human Factors Psychologist: They study how people interact with machines and technology.

    //   for those minimum skills level:
    //   High demand and generally higher pay jobs:

    //     Teamwork / Collaboration: High (Working with other healthcare professionals, patients, or client groups is a key aspect of these jobs.)
    //     Communication: High (These roles often require complex interactions with individuals or groups, explaining diagnoses, treatment plans, research results, or organizational strategies.)
    //     Critical Thinking: High (Whether it's diagnosing a patient, designing a treatment plan, improving organizational structures, or conducting research, these roles require sophisticated problem-solving abilities.)
    //     Technology: Medium to High (Technological skills are increasingly important for maintaining records, conducting research, teletherapy, or working within complex organizational structures.)
    //     Professionalism: High (Maintaining confidentiality, demonstrating empathy, and adhering to ethical guidelines is crucial.)
        
    //     Moderate demand and generally moderate pay jobs:

    //     Teamwork / Collaboration: Medium to High (These roles often involve working with diverse groups, from students and teachers to law enforcement to research teams.)
    //     Communication: High (Whether communicating research findings, explaining legal proceedings, or helping students, effective communication is key.)
    //     Critical Thinking: High (Solving problems, designing research, or navigating complex school or legal systems requires good critical thinking skills.)
    //     Technology: Medium (Depends on the role, but technology skills can be required for maintaining records, conducting research, or using specific software.)
    //     Professionalism: High (Adherence to ethical standards and maintaining professionalism in often challenging environments is crucial.)
        
    //     Lower demand and generally lower pay jobs:

    //     Teamwork / Collaboration: Medium (These roles might involve less direct collaboration depending on the specific job, but teamwork is still often necessary.)
    //     Communication: Medium to High (Explaining psychological concepts, teaching, or communicating research findings is often part of these roles.)
    //     Critical Thinking: Medium to High (These roles often require problem-solving, whether in a research, educational, or applied setting.)
    //     Technology: Medium (While not always central, technology skills can be useful for research, teaching, or consulting.)
    //     Professionalism: High (Maintaining ethical standards, respecting confidentiality, and demonstrating proper behavior in professional settings is crucial.)

    // case 3 :
    // - Number of scale 0-1 Grades
    // - prompt : Give me the top 5 most suitable job titles list in New York for a PSY100 student graduating in 2023 with the following skills levels, please list the job titles without any description:${input} `
