// import React, { useState } from "react";
// import {
//     Box,
//     Typography,
//     Button,
//     TextField,
//     Paper,
//     Stack,
//     Container,
//     CircularProgress,
//     Alert,
// } from "@mui/material";
// import axios from "axios";


// const steps = [
//     { question: "What is your age?", type: "input", key: "age" },
//     { question: "What is your weight (in kg)?", type: "input", key: "weight" },
//     { question: "What is your height (in cm)?", type: "input", key: "height" },
//     {
//         question: "Exercise Frequency:",
//         type: "options",
//         options: ["Never", "1-2 times a week", "3-4 times a week", "5 or more times a week"],
//         key: "exercise",
//     },
//     {
//         question: "Family History:",
//         type: "options",
//         options: ["Yes", "No", "Not sure"],
//         key: "familyHistory",
//     },
//     {
//         question: "Diet:",
//         type: "options",
//         options: [
//             "Mostly healthy, balanced meals",
//             "Sometimes healthy, sometimes not",
//             "Mostly unhealthy or processed foods",
//         ],
//         key: "diet",
//     },
//     {
//         question: "Sugary Drink Consumption:",
//         type: "options",
//         options: ["Rarely or never", "1-3 times a week", "4-6 times a week", "Daily"],
//         key: "sugaryDrinks",
//     },
//     {
//         question: "High Blood Pressure:",
//         type: "options",
//         options: ["Yes", "No", "Not sure"],
//         key: "bloodPressure",
//     },
//     {
//         question: "Stress Level:",
//         type: "options",
//         options: ["Low", "Moderate", "High"],
//         key: "stress",
//     },
// ];

// const PredictiveChat = () => {
//     const [stepIndex, setStepIndex] = useState(0);
//     const [responses, setResponses] = useState({});
//     const [inputValue, setInputValue] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [backendResponse, setBackendResponse] = useState(null);
//     const [error, setError] = useState(null);

//     const currentStep = steps[stepIndex];

//     const handleNext = async (value) => {
//         const updatedResponses = { ...responses, [currentStep.key]: value };
//         console.log(updatedResponses);
//         setResponses(updatedResponses);
//         setInputValue("");
//         const nextStep = stepIndex + 1;
//         setStepIndex(nextStep);

//         if (nextStep === steps.length) {
//             try {
//                 setLoading(true);
//                 const res = await axios.post("http://localhost:1805/ai-assist/predict", updatedResponses);
//                 setBackendResponse(res.data);
//                 setLoading(false);
//             } catch (err) {
//                 setLoading(false);
//                 setError("Something went wrong while connecting to the server.");
//                 console.error(err);
//             }
//         }
//     };

//     const handleInputSubmit = (e) => {
//         e.preventDefault();
//         if (inputValue.trim()) {
//             handleNext(inputValue.trim());
//         }
//     };

//     return (
//         <Container maxWidth="sm">
//             <Paper elevation={4} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
//                 <Typography variant="h5" gutterBottom align="center">
//                     🧠 Health Assistant
//                 </Typography>

//                 <Box sx={{ maxHeight: "60vh", overflowY: "auto", pr: 1 }}>
//                     {steps.slice(0, stepIndex).map((step, idx) => (
//                         <Box key={idx}>
//                             {/* Question */}
//                             <Box
//                                 sx={{
//                                     display: "flex",
//                                     justifyContent: "flex-start",
//                                     mb: 1,
//                                 }}
//                             >
//                                 <Box
//                                     sx={{
//                                         bgcolor: "#e0f7fa",
//                                         px: 2,
//                                         py: 1,
//                                         borderRadius: 2,
//                                         maxWidth: "75%",
//                                     }}
//                                 >
//                                     <Typography variant="body1"><strong>{step.question}</strong></Typography>
//                                 </Box>
//                             </Box>
//                             {/* User Answer */}
//                             <Box
//                                 sx={{
//                                     display: "flex",
//                                     justifyContent: "flex-end",
//                                     mb: 2,
//                                 }}
//                             >
//                                 <Box
//                                     sx={{
//                                         bgcolor: "#c8e6c9",
//                                         px: 2,
//                                         py: 1,
//                                         borderRadius: 2,
//                                         maxWidth: "75%",
//                                     }}
//                                 >
//                                     <Typography variant="body2">{responses[step.key]}</Typography>
//                                 </Box>
//                             </Box>
//                         </Box>
//                     ))}
//                 </Box>

//                 {/* Current Question */}
//                 {stepIndex < steps.length && (
//                     <Box sx={{ mt: 2 }}>
//                         <Box
//                             sx={{
//                                 display: "flex",
//                                 justifyContent: "flex-start",
//                                 mb: 1,
//                             }}
//                         >
//                             <Box
//                                 sx={{
//                                     bgcolor: "#e0f7fa",
//                                     px: 2,
//                                     py: 1,
//                                     borderRadius: 2,
//                                     maxWidth: "75%",
//                                 }}
//                             >
//                                 <Typography variant="body1"><strong>{currentStep.question}</strong></Typography>
//                             </Box>
//                         </Box>

//                         {currentStep.type === "input" ? (
//                             <form onSubmit={handleInputSubmit}>
//                                 <Stack direction="row" spacing={2}>
//                                     <TextField
//                                         label="Your answer"
//                                         variant="outlined"
//                                         size="small"
//                                         value={inputValue}
//                                         onChange={(e) => setInputValue(e.target.value)}
//                                         fullWidth
//                                     />
//                                     <Button type="submit" variant="contained">
//                                         Send
//                                     </Button>
//                                 </Stack>
//                             </form>
//                         ) : (
//                             <Stack spacing={1}>
//                                 {currentStep.options.map((option, idx) => (
//                                     <Button
//                                         key={idx}
//                                         variant="outlined"
//                                         fullWidth
//                                         onClick={() => handleNext(option)}
//                                     >
//                                         {option}
//                                     </Button>
//                                 ))}
//                             </Stack>
//                         )}
//                     </Box>
//                 )}

//                 {/* Final Response */}
//                 {stepIndex === steps.length && (
//                     <Box sx={{ mt: 3 }}>
//                         {loading && (
//                             <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
//                                 <CircularProgress />
//                             </Box>
//                         )}
//                         {error && (
//                             <Alert severity="error" sx={{ mt: 2 }}>
//                                 {error}
//                             </Alert>
//                         )}
//                         {backendResponse && (
//                             <Box
//                                 sx={{
//                                     display: "flex",
//                                     justifyContent: "flex-start",
//                                     mt: 2,
//                                 }}
//                             >
//                                 <Box
//                                     sx={{
//                                         bgcolor: "#d1c4e9",
//                                         px: 2,
//                                         py: 1,
//                                         borderRadius: 2,
//                                         maxWidth: "75%",
//                                     }}
//                                 >
//                                     <Typography variant="subtitle1">💡 Response:</Typography>
//                                     <Typography variant="body2" component="pre">
//                                         {JSON.stringify(backendResponse, null, 2)}
//                                     </Typography>
//                                 </Box>
//                             </Box>
//                         )}
//                     </Box>
//                 )}
//             </Paper>
//         </Container>
//     );
// }

// export default PredictiveChat


// import React, { useState } from 'react';
// import {
//   Box, Button, Paper, TextField, Typography, Stack, Avatar, IconButton
// } from '@mui/material';
// import SendIcon from '@mui/icons-material/Send';
// import axios from 'axios';
// import { jsPDF } from "jspdf";

// const steps = [
//   { question: "What is your age?", type: "input", key: "age" },
//   { question: "What is your height (in cm)?", type: "input", key: "height" },
//   { question: "What is your weight (in kg)?", type: "input", key: "weight" },
//   {
//     question: "Exercise Frequency:", type: "options", key: "exercise",
//     options: ["Never", "1-2 times a week", "3-4 times a week", "5 or more times a week"],
//     icons: ["🚫", "🏃‍♂️", "💪", "🔥"]
//   },
//   {
//     question: "Family History:", type: "options", key: "familyHistory",
//     options: ["Yes", "No", "Not sure"],
//     icons: ["✅", "❌", "🤔"]
//   },
//   {
//     question: "Diet:", type: "options", key: "diet",
//     options: ["Mostly healthy, balanced meals", "Sometimes healthy, sometimes not", "Mostly unhealthy or processed foods"],
//     icons: ["🥗", "🍔🥗", "🍕🍟"]
//   },
//   {
//     question: "Sugary Drink Consumption:", type: "options", key: "sugarDrinks",
//     options: ["Rarely or never", "1-3 times a week", "4-6 times a week", "Daily"],
//     icons: ["🚱", "🥤", "🥤🥤", "🧃🧃🧃"]
//   },
//   {
//     question: "Do you have high blood pressure?", type: "options", key: "bp",
//     options: ["Yes", "No", "Not sure"],
//     icons: ["💉", "👍", "❓"]
//   },
//   {
//     question: "Stress Level:", type: "options", key: "stress",
//     options: ["Low", "Moderate", "High"],
//     icons: ["😌", "😐", "😫"]
//   }
// ];

// export default function PredictiveChat() {
//   const [step, setStep] = useState(0);
//   const [formData, setFormData] = useState({});
//   const [userResponses, setUserResponses] = useState([]);
//   const [response, setResponse] = useState(null);
//   const [inputValue, setInputValue] = useState("");
//   const [pdfReady, setPdfReady] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");

//   const token = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AcXAuY29tIiwiaWF0IjoxNzQ0Nzg5MDM1LCJleHAiOjE3NDYwODUwMzV9.XEAt_wLCmRXZFAEcRAiT35Axgx7-1vgKykZ8XJzG9po'

//   const booleanFields = ['familyHistory', 'bp'];

//   const handleNext = async (value) => {
//     const current = steps[step];
//     let answer = value;

//     if (booleanFields.includes(current.key)) {
//       answer = value === "Yes";
//     }

//     const updatedData = { ...formData, [current.key]: answer };
//     setFormData(updatedData);
//     setUserResponses([...userResponses, { question: current.question, answer: value }]);
//     setInputValue("");
//     setPdfReady(false);
//     setErrorMsg("");

//     if (step + 1 < steps.length) {
//       setStep(prev => prev + 1);
//     } else {
//       try {
//         const res = await axios.post("http://localhost:1805/ai-assist/predict", updatedData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (res.data.status === "error") {
//           setResponse({ error: res.data.message });
//           setErrorMsg(res.data.message);
//           return;
//         }
//         setResponse(res.data);
//         setPdfReady(true); 

//       } catch (err) {
//         console.error(err);
//         setResponse({ error: "Failed to connect to backend" });
//         // setErrorMsg("Something went wrong. Please try again later.");
//         setErrorMsg(err.data.message)
//       }
//     }
//   };

//   const downloadPDF = () => {
//     const textResponse = response?.data || "No response available";

//     const doc = new jsPDF();
//     const lines = doc.splitTextToSize(textResponse, 180);
//     doc.text(lines, 10, 10);
//     doc.save("Health_Report.pdf");
//   };

//   const currentStep = steps[step];

//   return (
//     <Box sx={{ width: 750, mx: 'auto', mt: 4, borderRadius: 1, overflow: 'hidden', fontFamily: 'sans-serif' }}>
//       <Box sx={{ background: 'linear-gradient(to right,hsl(217, 100.00%, 79.60%),rgb(39, 186, 212))', p: 2, color: 'white' }}>
//         <Stack direction="row" alignItems="center" spacing={2}>
//           <Avatar />
//           <Box>
//             <Typography fontWeight={600}>Chat with</Typography>
//             <Typography fontSize="0.9rem">AI Lume</Typography>
//           </Box>
//         </Stack>
//       </Box>

//       <Box sx={{ backgroundColor: 'white', p: 2, minHeight: 500 }}>
//         <Box sx={{ mb: 2 }}>
//           <Paper sx={{ p: 1.5, backgroundColor: '#f0f2f7', display: 'inline-block', borderRadius: 2 }}>
//             <Typography fontSize="1rem">
//               Hi there! 👋 Welcome to our AI-Lume.
//             </Typography>
//           </Paper>
//         </Box>

//         {userResponses.map((item, idx) => (
//           <Box key={idx}>
//             <Box display="flex" justifyContent="flex-start" mb={0.5}>
//               <Paper sx={{ p: 2, bgcolor: '#f0f2f7', borderRadius: 2, maxWidth: '80%' }}>
//                 <Typography variant="body2">{item.question}</Typography>
//               </Paper>
//             </Box>
//             <Box display="flex" justifyContent="flex-end" mb={1}>
//               <Paper sx={{ p: 2, bgcolor: 'white', borderRadius: 2, maxWidth: '80%' }}>
//                 <Typography variant="body2">{item.answer}</Typography>
//               </Paper>
//             </Box>
//           </Box>
//         ))}

//         {!response && (
//           <Box>
//             <Box display="flex" justifyContent="flex-start" mb={1}>
//               <Paper sx={{ p: 2, bgcolor: '#f0f2f7', borderRadius: 2, maxWidth: '80%' }}>
//                 <Typography variant="body2">{currentStep.question}</Typography>
//               </Paper>
//             </Box>
//             {currentStep.type === "input" && (
//               <Box
//                 sx={{
//                   mt: 35,
//                   display: 'flex',
//                   alignItems: 'center',
//                   backgroundColor: '#f4f9ff',
//                   borderRadius: 10,
//                   px: 4,
//                   py: 1,
//                 }}
//               >
//                 <TextField
//                   fullWidth
//                   placeholder="Enter the Prompt Here"
//                   variant="standard"
//                   type='number'
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   onKeyDown={(e) => e.key === 'Enter' && handleNext(inputValue)}
//                   InputProps={{
//                     disableUnderline: true,
//                   }}
//                   sx={{ flex: 1 }}
//                 />
//                 <IconButton color="primary" onClick={(e)=>e.key=handleNext(inputValue)}>
//                   <SendIcon  />
//                 </IconButton>
//               </Box>
//             )}

//             {currentStep.type === "options" && (
//               <Stack spacing={1}>
//                 {currentStep.options.map((option, idx) => (
//                   <Button
//                     key={idx}
//                     variant="outlined"
//                     onClick={() => handleNext(option)}
//                     sx={{
//                       justifyContent: 'flex-start',
//                       borderRadius: 5,
//                       textTransform: 'none',
//                       fontWeight: 500,
//                       borderColor: '#90caf9',
//                       color: '#1976d2',
//                       '&:hover': { borderColor: '#64b5f6' }
//                     }}
//                     startIcon={<span>{currentStep.icons?.[idx]}</span>}
//                   >
//                     {option}
//                   </Button>
//                 ))}
//               </Stack>
//             )}
//           </Box>
//         )}
//       </Box>
//       {pdfReady && (
//         <div style={{ marginTop: "20px" }}>
//           <button onClick={downloadPDF} style={{ padding: "10px 20px", background: "#4caf50", color: "white", border: "none", borderRadius: "4px" }}>
//             View/Download PDF Report
//           </button>
//         </div>
//       )}

//       {errorMsg && (
//         <div style={{ marginTop: "20px", color: "red", fontWeight: "bold" }}>
//           ⚠️ {errorMsg}
//         </div>
//       )}

//       <Box sx={{ p: 1, textAlign: 'center', backgroundColor: '#f1f1f1', fontSize: '0.7rem', color: '#888' }}>
//         Powered by AI-Lume
//       </Box>
//     </Box>
//   );
// }.

import React, { useState } from 'react';
import {
  Box, Button, Paper, TextField, Typography, Stack, Avatar, IconButton, CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { jsPDF } from "jspdf";
import logoImage from '../assets/Ailume.jpg'
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import {
  FaBan, FaRunning, FaDumbbell, FaFire,
  FaCheck, FaTimes, FaQuestion,
  FaAppleAlt, FaHamburger, FaPizzaSlice,
  FaGlassWhiskey, FaGlassMartiniAlt,
  FaSyringe, FaThumbsUp,
  FaSmile, FaMeh, FaTired,
  FaSmoking, FaWineBottle, FaMapMarkerAlt
} from "react-icons/fa";

// const steps = [
//   { question: "What is your age?", type: "input", key: "age" },
//   { question: "What is your height (in cm)?", type: "input", key: "height" },
//   { question: "What is your weight (in kg)?", type: "input", key: "weight" },
//   {
//     question: "How often do you exercise per week?", type: "options", key: "exercise",
//     options: ["Never", "1-2 times a week", "3-4 times a week", "5 or more times a week"],
//     icons: ["🚫", "🏃‍♂️", "💪", "🔥"]
//   },
//   {
//     question: "Do you have a family history of chronic diseases like diabetes or heart disease?", type: "options", key: "familyHistory",
//     options: ["Yes", "No", "Not sure"],
//     icons: ["✅", "❌", "🤔"]
//   },
//   {
//     question: "How would you describe your diet?", type: "options", key: "diet",
//     options: ["Mostly healthy, balanced meals", "Sometimes healthy, sometimes not", "Mostly unhealthy or processed foods"],
//     icons: ["🥗", "🍔🥗", "🍕🍟"]
//   },
//   {
//     question: "How often do you consume sugary drinks?", type: "options", key: "sugarDrinks",
//     options: ["Rarely or never", "1-3 times a week", "4-6 times a week", "Daily"],
//     icons: ["🚱", "🥤", "🥤🥤", "🧃🧃🧃"]
//   },
//   {
//     question: "Have you been diagnosed with high blood pressure?", type: "options", key: "bp",
//     options: ["Yes", "No", "Not sure"],
//     icons: ["💉", "👍", "❓"]
//   },
//   {
//     question: "What is your current stress level?", type: "options", key: "stress",
//     options: ["Low", "Moderate", "High"],
//     icons: ["😌", "😐", "😫"]
//   },
//   { question: "How many steps do you walk on average each day?", type: "input", key: "dailySteps" },
//   { question: "How many liters of water do you drink daily?", type: "input", key: "waterIntake" },
//   { question: "How many hours do you sleep on average?", type: "input", key: "sleepHours" },
//   {
//     question: "Do you smoke?", type: "options", key: "smoking",
//     options: ["Yes", "No"],
//     icons: ["✅", "❌"]
//   },
//   {
//     question: "Do you consume alcohol?", type: "options", key: "alcohol",
//     options: ["Yes", "No"],
//     icons: ["✅", "❌"]
//   },
//   { question: "Where do you currently live?", type: "input", key: "location" },
//   { question: "What is your daily step goal?", type: "input", key: "goalStepsPerDay" },
//   { question: "What is your daily water intake goal in liters?", type: "input", key: "goalWaterPerDayL" },
//   { question: "How many hours of sleep do you aim to get each night?", type: "input", key: "goalWaterPerDayL" },
// ];


const steps = [
  { question: "What is your age?", type: "input", key: "age" },
  { question: "What is your height (in cm)?", type: "input", key: "height" },
  { question: "What is your weight (in kg)?", type: "input", key: "weight" },
  {
    question: "How often do you exercise per week?", type: "options", key: "exercise",
    options: ["Never", "1-2 times a week", "3-4 times a week", "5 or more times a week"],
    icons: [<FaBan />, <FaRunning />, <FaDumbbell />, <FaFire />]
  },
  {
    question: "Do you have a family history of chronic diseases like diabetes or heart disease?", type: "options", key: "familyHistory",
    options: ["Yes", "No", "Not sure"],
    icons: [<FaCheck />, <FaTimes />, <FaQuestion />]
  },
  {
    question: "How would you describe your diet?", type: "options", key: "diet",
    options: ["Mostly healthy, balanced meals", "Sometimes healthy, sometimes not", "Mostly unhealthy or processed foods"],
    icons: [<FaAppleAlt />, <FaHamburger />, <FaPizzaSlice />]
  },
  {
    question: "How often do you consume sugary drinks?", type: "options", key: "sugarDrinks",
    options: ["Rarely or never", "1-3 times a week", "4-6 times a week", "Daily"],
    icons: [<FaBan />, <FaGlassWhiskey />, <FaGlassWhiskey />, <FaGlassMartiniAlt />]
  },
  {
    question: "Have you been diagnosed with high blood pressure?", type: "options", key: "bp",
    options: ["Yes", "No", "Not sure"],
    icons: [<FaSyringe />, <FaThumbsUp />, <FaQuestion />]
  },
  {
    question: "What is your current stress level?", type: "options", key: "stress",
    options: ["Low", "Moderate", "High"],
    icons: [<FaSmile />, <FaMeh />, <FaTired />]
  },
  { question: "How many steps do you walk on average each day?", type: "input", key: "dailySteps" },
  { question: "How many liters of water do you drink daily?", type: "input", key: "waterIntake" },
  { question: "How many hours do you sleep on average?", type: "input", key: "sleepHours" },
  {
    question: "Do you smoke?", type: "options", key: "smoking",
    options: ["Yes", "No"],
    icons: [<FaSmoking />, <FaTimes />]
  },
  {
    question: "Do you consume alcohol?", type: "options", key: "alcohol",
    options: ["Yes", "No"],
    icons: [<FaWineBottle />, <FaTimes />]
  },
  { question: "Where do you currently live?", type: "input", key: "location" , icons: <FaMapMarkerAlt />},
  { question: "What is your daily step goal?", type: "input", key: "goalStepsPerDay" },
  { question: "What is your daily water intake goal in liters?", type: "input", key: "goalWaterPerDayL" },
  { question: "How many hours of sleep do you aim to get each night?", type: "input", key: "goalSleepHours" },
];

export default function PredictiveChat() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [userResponses, setUserResponses] = useState([]);
  const [response, setResponse] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [pdfReady, setPdfReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AcXAuY29tIiwiaWF0IjoxNzQ3NzE3MDYxLCJleHAiOjE3NDkwMTMwNjF9.4W1iGo4fSNWA01jZVMTwTppCJQ1lx7ksSPQikLlWexM'

  const booleanFields = ['familyHistory', 'bp', 'smoking', 'alcohol'];

  const handleNext = async (value) => {
    const current = steps[step];
    let answer = value;

    if (booleanFields.includes(current.key)) {
      answer = value === "Yes";
    }

    const updatedData = { ...formData, [current.key]: answer };
    setFormData(updatedData);
    setUserResponses([...userResponses, { question: current.question, answer: value }]);
    setInputValue("");
    setPdfReady(false);
    setErrorMsg("");

    if (step + 1 < steps.length) {
      setStep(prev => prev + 1);
    } else {
      setLoading(true);

      try {
        const res = await axios.post("http://localhost:1805/ai-assist/predict", updatedData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "error") {
          setResponse({ error: res.data.message });
          setErrorMsg(res.data.message);
        } else {
          setResponse(res.data);
          setPdfReady(true);
        }
      } catch (err) {
        console.error(err);
        setResponse({ error: "Failed to connect to backend" });
        setErrorMsg("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  
  const convertMarkdownToHTML = (text) => {
    let formattedText = text;

    // Convert **bold** to <strong>
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert * bullet points to <li>
    formattedText = formattedText.replace(/\n\* (.*?)\n/g, '<li>$1</li>');

    // Wrap bullet points inside <ul> if any exist
    if (formattedText.includes('<li>')) {
      formattedText = formattedText.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    }

    return formattedText;
  };

  // Convert HTML to plain text (handling bold, bullets, etc.)
  const convertHTMLToPlainText = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Handle bold <strong> and bullets <ul><li> in the text
    const boldText = doc.querySelectorAll('strong');
    boldText.forEach(el => el.style.fontWeight = 'bold');  // You could add custom styles here

    let plainText = doc.body.innerText || doc.body.textContent;
    return plainText;
  };

  const downloadPDF = () => {
    const textResponse = response?.data || "No response available";
    const htmlText = convertMarkdownToHTML(textResponse); // Convert markdown to HTML
    const plainText = convertHTMLToPlainText(htmlText); // Convert HTML back to plain text

    const doc = new jsPDF();

    // Add logo image (resized properly)
    doc.addImage(logoImage, 'PNG', 10, 10, 20, 20); // x, y, width, height

    // Add a horizontal line below the logo
    doc.setLineWidth(0.5);
    doc.line(10, 35, 200, 35); // line after image

    // Title
    doc.setFontSize(16);
    doc.text("Health Report", 10, 45);

    // Subtitle
    doc.setFontSize(12);
    // doc.text("Your health report based on your input:", 10, 55);

    // Format response text (using plain text)
    const lines = doc.splitTextToSize(plainText, 180); // Wrap at 180mm width
    let y = 65;
    lines.forEach((line) => {
      if (y > 280) { // Check if page overflow
        doc.addPage();
        y = 20;
      }
      doc.text(line, 10, y);
      y += 8; // line height
    });

    // Save PDF
    doc.save("Health_Report.pdf");
  };

  const currentStep = steps[step];

  return (
    <Box sx={{ width: 750, mx: 'auto', mt: 4, borderRadius: 1, overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <Box sx={{ background: 'linear-gradient(to right,hsl(217, 100.00%, 79.60%),rgb(39, 186, 212))', p: 2, color: 'white' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar />
          <Box>
            <Typography fontWeight={600}>Chat with</Typography>
            <Typography fontSize="0.9rem">AI Lume</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ backgroundColor: 'white', p: 2, minHeight: 500 }}>
        <Box sx={{ mb: 2 }}>
          <Paper sx={{ p: 1.5, backgroundColor: '#f0f2f7', display: 'inline-block', borderRadius: 2 }}>
            <Typography fontSize="1rem">
              Hi there! 👋 Welcome to our AI-Lume.
            </Typography>
          </Paper>
        </Box>

        {userResponses.map((item, idx) => (
          <Box key={idx}>
            <Box display="flex" justifyContent="flex-start" mb={0.5}>
              <Paper sx={{ p: 2, bgcolor: '#f0f2f7', borderRadius: 2, maxWidth: '80%' }}>
                <Typography variant="body2">{item.question}</Typography>
              </Paper>
            </Box>
            <Box display="flex" justifyContent="flex-end" mb={1}>
              <Paper sx={{ p: 2, bgcolor: 'white', borderRadius: 2, maxWidth: '80%' }}>
                <Typography variant="body2">{item.answer}</Typography>
              </Paper>
            </Box>
          </Box>
        ))}

        {!response && !loading && (
          <Box>
            <Box display="flex" justifyContent="flex-start" mb={1}>
              <Paper sx={{ p: 2, bgcolor: '#f0f2f7', borderRadius: 2, maxWidth: '80%' }}>
                <Typography variant="body2">{currentStep.question}</Typography>
              </Paper>
            </Box>
            {currentStep.type === "input" && (
              <Box
                sx={{
                  mt: 35,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f4f9ff',
                  borderRadius: 10,
                  px: 4,
                  py: 1,
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Enter the Prompt Here"
                  variant="standard"
                  // type='number'
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext(inputValue)}
                  InputProps={{
                    disableUnderline: true,
                  }}
                  sx={{ flex: 1 }}
                />
                <IconButton color="primary" onClick={() => handleNext(inputValue)}>
                  <SendIcon />
                </IconButton>
              </Box>
            )}

            {currentStep.type === "options" && (
              <Stack spacing={1}>
                {currentStep.options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    onClick={() => handleNext(option)}
                    sx={{
                      justifyContent: 'flex-start',
                      borderRadius: 5,
                      textTransform: 'none',
                      fontWeight: 500,
                      borderColor: '#90caf9',
                      color: '#1976d2',
                      '&:hover': { borderColor: '#64b5f6' }
                    }}
                    startIcon={<span>{currentStep.icons?.[idx]}</span>}
                  >
                    {option}
                  </Button>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {loading && (
          <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Your report is generating, wait for a moment...</Typography>
          </Box>
        )}
      </Box>

      {pdfReady && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={downloadPDF}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(90deg, #4caf50, #66bb6a)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              animation: "pulse 2s infinite",
              transition: "transform 0.3s ease, box-shadow 0.3s ease"
            }}
          >
            Download PDF Report <GetAppRoundedIcon />
          </button>
        </div>
      )}

      {errorMsg && (
        <div style={{ marginTop: "20px", color: "red", fontWeight: "bold" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <Box sx={{ p: 1, textAlign: 'center', backgroundColor: '#f1f1f1', fontSize: '0.7rem', color: '#888' }}>
        Powered by AI-Lume
      </Box>
    </Box>
  );
}


// import React, { useState } from 'react';
// import {
//   Box, Button, Paper, TextField, Typography, Stack, Avatar, IconButton, CircularProgress
// } from '@mui/material';
// import SendIcon from '@mui/icons-material/Send';
// import axios from 'axios';
// import { jsPDF } from "jspdf";
// import logoImage from '../assets/Ailume.jpg';
// import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';

// const steps = [
//   { question: "What is your age?", type: "input", key: "age" },
//   { question: "What is your height (in cm)?", type: "input", key: "height" },
//   { question: "What is your weight (in kg)?", type: "input", key: "weight" },
//   {
//     question: "How often do you exercise per week?", type: "options", key: "exercise",
//     options: ["Never", "1-2 times a week", "3-4 times a week", "5 or more times a week"],
//     icons: ["🚫", "🏃‍♂️", "💪", "🔥"]
//   },
//   {
//     question: "Do you have a family history of chronic diseases like diabetes or heart disease?", type: "options", key: "familyHistory",
//     options: ["Yes", "No", "Not sure"],
//     icons: ["✅", "❌", "🤔"]
//   },
//   {
//     question: "How would you describe your diet?", type: "options", key: "diet",
//     options: ["Mostly healthy, balanced meals", "Sometimes healthy, sometimes not", "Mostly unhealthy or processed foods"],
//     icons: ["🥗", "🍔🥗", "🍕🍟"]
//   },
//   {
//     question: "How often do you consume sugary drinks?", type: "options", key: "sugarDrinks",
//     options: ["Rarely or never", "1-3 times a week", "4-6 times a week", "Daily"],
//     icons: ["🚱", "🥤", "🥤🥤", "🧃🧃🧃"]
//   },
//   {
//     question: "Have you been diagnosed with high blood pressure?", type: "options", key: "bp",
//     options: ["Yes", "No", "Not sure"],
//     icons: ["💉", "👍", "❓"]
//   },
//   {
//     question: "What is your current stress level?", type: "options", key: "stress",
//     options: ["Low", "Moderate", "High"],
//     icons: ["😌", "😐", "😫"]
//   },
//   { question: "How many steps do you walk on average each day?", type: "input", key: "dailySteps" },
//   { question: "How many liters of water do you drink daily?", type: "input", key: "waterIntake" },
//   { question: "How many hours do you sleep on average?", type: "input", key: "sleepHours" },
//   {
//     question: "Do you smoke?", type: "options", key: "smoking",
//     options: ["Yes", "No"],
//     icons: ["✅", "❌"]
//   },
//   {
//     question: "Do you consume alcohol?", type: "options", key: "alcohol",
//     options: ["Yes", "No"],
//     icons: ["✅", "❌"]
//   },
//   { question: "Where do you currently live?", type: "input", key: "location" },
//   { question: "What is your daily step goal?", type: "input", key: "goalStepsPerDay" },
//   { question: "What is your daily water intake goal in liters?", type: "input", key: "goalWaterPerDayL" },
//   { question: "How many hours of sleep do you aim to get each night?", type: "input", key: "goalSleepHours" },
// ];

// export default function PredictiveChat() {
//   const [step, setStep] = useState(0);
//   const [formData, setFormData] = useState({});
//   const [userResponses, setUserResponses] = useState([]);
//   const [response, setResponse] = useState(null);
//   const [inputValue, setInputValue] = useState("");
//   const [pdfReady, setPdfReady] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   const token = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AcXAuY29tIiwiaWF0IjoxNzQ3Mjg1Nzg2LCJleHAiOjE3NDg1ODE3ODZ9.gvTv1hka3oO8p2dWUX5z4nhsuBha_0oXZyuYeUr8VA8';
//   const booleanFields = ['familyHistory', 'bp', 'smoking', 'alcohol'];

//   const handleNext = async (value) => {
//     const current = steps[step];
//     let answer = value;

//     if (booleanFields.includes(current.key)) {
//       answer = value === "Yes";
//     }

//     const updatedData = { ...formData, [current.key]: answer };
//     setFormData(updatedData);
//     setUserResponses([...userResponses, { question: current.question, answer: value }]);
//     setInputValue("");
//     setPdfReady(false);
//     setErrorMsg("");

//     if (step + 1 < steps.length) {
//       setStep(prev => prev + 1);
//     } else {
//       setLoading(true);
//       try {
//         const res = await axios.post("http://localhost:1805/ai-assist/predict", updatedData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (res.data.status === "error") {
//           setResponse({ error: res.data.message });
//           setErrorMsg(res.data.message);
//         } else {
//           setResponse(res.data);
//           setPdfReady(true);
//         }
//       } catch (err) {
//         setResponse({ error: "Failed to connect to backend" });
//         setErrorMsg("Something went wrong.");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const convertMarkdownToHTML = (text) => {
//     let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
//     formattedText = formattedText.replace(/\n\* (.*?)\n/g, '<li>$1</li>');
//     if (formattedText.includes('<li>')) {
//       formattedText = formattedText.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
//     }
//     return formattedText;
//   };

//   const convertHTMLToPlainText = (html) => {
//     const doc = new DOMParser().parseFromString(html, 'text/html');
//     return doc.body.innerText || doc.body.textContent;
//   };

//   const downloadPDF = () => {
//     const textResponse = response?.data || "No response available";
//     const htmlText = convertMarkdownToHTML(textResponse);
//     const plainText = convertHTMLToPlainText(htmlText);
//     const doc = new jsPDF();

//     doc.addImage(logoImage, 'PNG', 10, 10, 20, 20);
//     doc.setLineWidth(0.5);
//     doc.line(10, 35, 200, 35);
//     doc.setFontSize(16);
//     doc.text("Health Report", 10, 45);
//     const lines = doc.splitTextToSize(plainText, 180);
//     let y = 65;
//     lines.forEach(line => {
//       if (y > 280) {
//         doc.addPage();
//         y = 20;
//       }
//       doc.text(line, 10, y);
//       y += 8;
//     });
//     doc.save("Health_Report.pdf");
//   };

//   const currentStep = steps[step];

//   return (
//     <Box sx={{ width: 750, mx: 'auto', mt: 4, borderRadius: 1, overflow: 'hidden' }}>
//       <Box sx={{ background: 'linear-gradient(to right,hsl(217, 100.00%, 79.60%),rgb(39, 186, 212))', p: 2, color: 'white' }}>
//         <Stack direction="row" alignItems="center" spacing={2}>
//           <Avatar />
//           <Box>
//             <Typography fontWeight={600}>Chat with</Typography>
//             <Typography fontSize="0.9rem">AI Lume</Typography>
//           </Box>
//         </Stack>
//       </Box>

//       <Box sx={{ backgroundColor: 'white', p: 2, minHeight: 500 }}>
//         <Box sx={{ mb: 2 }}>
//           <Paper sx={{ p: 1.5, backgroundColor: '#f0f2f7', display: 'inline-block', borderRadius: 2 }}>
//             <Typography fontSize="1rem">Hi there! 👋 Welcome to our AI-Lume.</Typography>
//           </Paper>
//         </Box>

//         {userResponses.map((item, idx) => (
//           <Box key={idx}>
//             <Box display="flex" justifyContent="flex-start" mb={0.5}>
//               <Paper sx={{ p: 2, bgcolor: '#e6f2ff', borderRadius: 2, maxWidth: '80%' }}>
//                 <Typography variant="body2"><strong>{item.question}</strong></Typography>
//               </Paper>
//             </Box>
//             <Box display="flex" justifyContent="flex-end" mb={1}>
//               <Paper sx={{ p: 2, bgcolor: '#d1f2eb', borderRadius: 2, maxWidth: '80%' }}>
//                 <Typography variant="body2">{item.answer}</Typography>
//               </Paper>
//             </Box>
//           </Box>
//         ))}

//         {!response && !loading && currentStep && (
//           <Box>
//             <Box display="flex" justifyContent="flex-start" mb={1}>
//               <Paper sx={{ p: 2, bgcolor: '#f0f2f7', borderRadius: 2 }}>
//                 <Typography>{currentStep.question}</Typography>
//               </Paper>
//             </Box>

//             {currentStep.type === "input" && (
//               <Box display="flex" gap={1} mt={2}>
//                 <TextField
//                   fullWidth
//                   variant="outlined"
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   placeholder="Type your answer..."
//                 />
//                 <IconButton color="primary" onClick={() => inputValue && handleNext(inputValue)}>
//                   <SendIcon />
//                 </IconButton>
//               </Box>
//             )}

//             {currentStep.type === "options" && (
//               <Stack direction="row" spacing={2} mt={2} flexWrap="wrap">
//                 {currentStep.options.map((option, idx) => (
//                   <Button
//                     key={idx}
//                     onClick={() => handleNext(option)}
//                     variant="outlined"
//                     startIcon={<span>{currentStep.icons[idx]}</span>}
//                     sx={{
//                       m: 1,
//                       borderRadius: 2,
//                       textTransform: 'none',
//                       backgroundColor: '#fafafa',
//                       '&:hover': { backgroundColor: '#e0f7fa' }
//                     }}
//                   >
//                     {option}
//                   </Button>
//                 ))}
//               </Stack>
//             )}
//           </Box>
//         )}

//         {loading && (
//           <Box textAlign="center" mt={4}>
//             <CircularProgress />
//             <Typography mt={1}>Generating your report...</Typography>
//           </Box>
//         )}

//         {response && (
//           <Box mt={4}>
//             <Typography variant="h6" gutterBottom>Prediction Result:</Typography>
//             <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
//               <Typography>{response?.data || response?.error}</Typography>
//             </Paper>
//             {pdfReady && (
//               <Button
//                 variant="contained"
//                 color="primary"
//                 startIcon={<GetAppRoundedIcon />}
//                 sx={{ mt: 2 }}
//                 onClick={downloadPDF}
//               >
//                 Download PDF
//               </Button>
//             )}
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// }
