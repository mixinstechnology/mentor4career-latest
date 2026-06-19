import { useEffect, useState } from "react";
import httpService from "../utils/apiService";

// Avatar gradient palette (matches the prototype's COLORS array).
export const AVATAR_COLORS = [
  'linear-gradient(135deg,#4F46E5,#3B82F6)',
  'linear-gradient(135deg,#7C5CF7,#EC4899)',
  'linear-gradient(135deg,#0FA968,#06B6D4)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#06B6D4,#3B82F6)',
  'linear-gradient(135deg,#4F46E5,#7C5CF7)',
  'linear-gradient(135deg,#EC4899,#7C5CF7)'
];

export const FOCUS_LABEL = {
  admissions: 'Admissions',
  campus: 'Campus Life',
  placement: 'Placements',
  career: 'Career Growth',
  interview: 'Interview Prep'
};


// Full mentor directory (ported from the prototype).



 export const MENTORS =()=>{
  const [data,setdata] = useState([])
 const fetchmentors = async () => {
   try {
    const response = await httpService.get('mentorProfile?page=1&limit=10')
    setdata(response?.rows)
   }
   catch (error) {
     console.error('Error fetching mentors:', error);
     return [];
   }
 
 }
 useEffect(()=>{
 fetchmentors()
 },[])
 
//  console.log(data)

 const arr =data?.map((item,id)=>{ 
  if(item?.isVerified){
  return ({  id: item?.authUserId, init: String(item?.firstName)?.slice(0,2), name: item?.firstName + ' ' + item?.lastName, type: item?.type, typeLabel: 'Final Year', role: item?.jobRole, org: item?.organizationName, stream: 'cse', focus: ['admissions', 'campus', 'placement'], rating: 4.9, reviews: 212, sessions: 340, price: item?.chargePerSession, resp: '~2 hrs', bio: item?.bio})
 }
 }).filter((item)=>item!==undefined)

return arr
// return(
// [
//   { init: 'AS', name: 'Aarav Sharma', type: 'senior', typeLabel: 'Final Year', role: 'B.Tech CSE · Final Year', org: 'IIT Bombay', stream: 'cse', focus: ['admissions', 'campus', 'placement'], rating: 4.9, reviews: 212, sessions: 340, price: 0, resp: '~2 hrs', bio: 'Final-year CSE at IIT Bombay. I help juniors choose the right branch, settle into first year and make the most of campus.' },
//   { init: 'PN', name: 'Priya Nair', type: 'alumni', typeLabel: 'Alumni', role: 'SDE-2 · Ex-VJTI', org: 'VJTI Mumbai', stream: 'cse', focus: ['placement', 'interview', 'career'], rating: 4.9, reviews: 184, sessions: 296, price: 599, resp: '~3 hrs', bio: 'VJTI alumna now an SDE-2. Ask me about placements, DSA prep and breaking into top product teams.' },
//   { init: 'RD', name: 'Rohit Deshmukh', type: 'pro', typeLabel: 'Professional', role: 'Product Manager · Razorpay', org: 'COEP Pune', stream: 'mba', focus: ['career', 'interview'], rating: 4.8, reviews: 156, sessions: 240, price: 899, resp: '~1 day', bio: 'PM at Razorpay. I guide students on career switches, product roles and navigating the corporate world.' },
//   { init: 'SK', name: 'Dr. Sneha Kulkarni', type: 'alumni', typeLabel: 'Alumni', role: 'Resident Doctor · MBBS', org: 'AIIMS Delhi', stream: 'med', focus: ['admissions', 'campus', 'career'], rating: 5.0, reviews: 98, sessions: 142, price: 799, resp: '~4 hrs', bio: 'Resident doctor and AIIMS alumna. Honest advice on NEET counselling, college life and the path after MBBS.' },
//   { init: 'FM', name: 'Faizan Mirza', type: 'alumni', typeLabel: 'Alumni', role: 'Consultant · Ex-IIM', org: 'IIM Indore', stream: 'mba', focus: ['admissions', 'career', 'interview'], rating: 4.9, reviews: 171, sessions: 268, price: 1199, resp: '~5 hrs', bio: 'IIM Indore alumnus in consulting. I mentor MBA aspirants on admissions, GD-PI and early career moves.' },
//   { init: 'AT', name: 'Aditi Talreja', type: 'pro', typeLabel: 'Professional', role: 'SDE-1 · Razorpay', org: 'VIT Vellore', stream: 'cse', focus: ['interview', 'placement'], rating: 4.8, reviews: 203, sessions: 312, price: 499, resp: '~2 hrs', bio: 'Cracked my first dev job through relentless mock interviews. I will prep you for real coding rounds.' },
//   { init: 'KV', name: 'Karan Verma', type: 'senior', typeLabel: 'Third Year', role: 'B.Tech E&TC · Third Year', org: 'COEP Pune', stream: 'ece', focus: ['admissions', 'campus'], rating: 4.7, reviews: 76, sessions: 118, price: 0, resp: '~6 hrs', bio: 'Third-year E&TC at COEP. Ask me anything about campus life, hostel, electives and student clubs.' },
//   { init: 'MM', name: 'Meera Menon', type: 'pro', typeLabel: 'Professional', role: 'Data Scientist · Flipkart', org: 'IIT Bombay', stream: 'cse', focus: ['career', 'interview', 'placement'], rating: 4.9, reviews: 142, sessions: 226, price: 999, resp: '~1 day', bio: 'Data Scientist at Flipkart. I help with data/ML careers, standout projects and interview prep.' },
//   { init: 'NJ', name: 'Nikhil Joshi', type: 'senior', typeLabel: 'Final Year', role: 'MCA · Final Year', org: 'VIT Vellore', stream: 'mca', focus: ['campus', 'placement'], rating: 4.6, reviews: 54, sessions: 88, price: 299, resp: '~5 hrs', bio: 'Final-year MCA student. Guidance on MCA placements, projects and making campus drives count.' },
//   { init: 'RG', name: 'Riya Gupta', type: 'alumni', typeLabel: 'Alumni', role: 'Mechanical Engineer · Tata', org: 'VJTI Mumbai', stream: 'mech', focus: ['placement', 'career'], rating: 4.7, reviews: 89, sessions: 134, price: 449, resp: '~4 hrs', bio: 'Mechanical engineer at Tata. Real talk on core-branch jobs, GATE vs placements and growth in manufacturing.' },
//   { init: 'SV', name: 'Siddharth Iyer', type: 'pro', typeLabel: 'Professional', role: 'Engineering Manager · Google', org: 'IIT Bombay', stream: 'cse', focus: ['career', 'interview'], rating: 5.0, reviews: 121, sessions: 198, price: 1499, resp: '~1 day', bio: 'Engineering Manager at Google. I coach senior students on system design, interviews and career strategy.' },
//   { init: 'TA', name: 'Tanvi Apte', type: 'senior', typeLabel: 'Second Year', role: 'MBBS · Second Year', org: 'AIIMS Delhi', stream: 'med', focus: ['admissions', 'campus'], rating: 4.8, reviews: 63, sessions: 96, price: 199, resp: '~3 hrs', bio: 'Second-year MBBS at AIIMS. Friendly help on NEET mindset, college selection and starting med school.' }
// ])
}