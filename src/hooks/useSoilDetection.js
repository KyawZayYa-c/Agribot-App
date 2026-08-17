// // hooks/useSoilDetection.js
// import { useState } from 'react';
// import * as Speech from 'expo-speech';

// // Soil Data
// export const SOIL_DATA = {
//   clay: {
//     id: 'clay',
//     name: 'မြေစေး (Clay Soil)',
//     description: 'ရေထိန်းနိုင်စွမ်းမြင့်မားပြီး အာဟာရဓာတ်ကြွယ်ဝသော မြေအမျိုးအစားဖြစ်သည်။ စပါးစိုက်ပျိုးရန် အထူးသင့်တော်သည်။',
//     crops: ['စပါး', 'ပဲတီစိမ်း', 'ပဲပုပ်', 'နှမ်း', 'ကြံ'],
//     icon: '🏔️',
//     color: '#8D6E63',
//   },
//   sandy: {
//     id: 'sandy',
//     name: 'မြေသဲ (Sandy Soil)',
//     description: 'ရေစီးနိုင်စွမ်းမြင့်မားပြီး အမြစ်များလွယ်ကူစွာ ထိုးဖောက်နိုင်သော မြေအမျိုးအစားဖြစ်သည်။',
//     crops: ['မြေပဲ', 'နှမ်း', 'ပြောင်း', 'ဖရုံ', 'ခရမ်းချဉ်'],
//     icon: '🏜️',
//     color: '#D7A86E',
//   },
//   loamy: {
//     id: 'loamy',
//     name: 'မြေဆွေး (Loamy Soil)',
//     description: 'စိုက်ပျိုးရေးအတွက် အကောင်းဆုံးဖြစ်သော မြေအမျိုးအစားဖြစ်ပြီး ရေနှင့်အာဟာရဓာတ် မျှတစွာပါဝင်သည်။',
//     crops: ['စပါး', 'ပြောင်း', 'ဂျုံ', 'သီးနှံအမျိုးမျိုး', 'ဟင်းသီးဟင်းရွက်'],
//     icon: '🌿',
//     color: '#8D6E63',
//   },
// };

// export const useSoilDetection = () => {
//   const [isDetecting, setIsDetecting] = useState(false);
//   const [detectedSoil, setDetectedSoil] = useState(null);
//   const [showResult, setShowResult] = useState(false);

//   const detectSoilType = async () => {
//     setIsDetecting(true);
//     setShowResult(false);
//     setDetectedSoil(null);

//     try {
//       const soilTypes = ['clay', 'sandy', 'loamy'];
//       const randomSoil = soilTypes[Math.floor(Math.random() * soilTypes.length)];
      
//       //const result = await detectSoil(randomSoil);
      
//       if (result && result.soilType) {
//         const soilInfo = SOIL_DATA[result.soilType] || SOIL_DATA.clay;
//         setDetectedSoil({
//           ...soilInfo,
//           confidence: result.confidence || 0.92
//         });
//         setShowResult(true);
//       } else {
//         const soilInfo = SOIL_DATA[randomSoil];
//         setDetectedSoil({
//           ...soilInfo,
//           confidence: 0.85
//         });
//         setShowResult(true);
//       }
//     } catch (error) {
//       console.error('Soil detection failed:', error);
//       const soilTypes = ['clay', 'sandy', 'loamy'];
//       const randomSoil = soilTypes[Math.floor(Math.random() * soilTypes.length)];
//       const soilInfo = SOIL_DATA[randomSoil];
//       setDetectedSoil({
//         ...soilInfo,
//         confidence: 0.75
//       });
//       setShowResult(true);
//     } finally {
//       setIsDetecting(false);
//     }
//   };

//   const closeResult = () => {
//     setShowResult(false);
//     setDetectedSoil(null);
//   };

//   const speakText = (text) => {
//     Speech.speak(text, {
//       language: 'my',
//       pitch: 1,
//       rate: 0.8,
//     });
//   };

//   return {
//     isDetecting,
//     detectedSoil,
//     showResult,
//     detectSoilType,
//     closeResult,
//     speakText,
//   };
// };