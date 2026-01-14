"use client";
import { useEffect, useState,  useCallback,useMemo ,useRef} from 'react';
import { useParams } from 'next/navigation';
// import Testimonials from '../components/testimonials'; 
import Button from "../components/Button"
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";



type Dependency = {
  questionIndex: number;
  optionIndex: number;
};

type Option = {
  icon?: string;
  title: string;
  subtitle?: string;
  price: number | string; // allow string in API input!
};

type Question = {
  question: any;
  isDependent: boolean;
  dependentOn?: Dependency;
  type: string;
  questionText: string;
  questionIcon: string;
  questionSubText: string;
  options: Option[];
};

type CostItem = {
  type: string;
  label: string;
  question: string;
  value: string;
  price: number;
};

export default function PreviewPage() {
  const params = useParams() as { department: string };
  const department = params.department;
  const [questions, setQuestions] = useState<Question[] | null>(null);
  // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, Option | null>>({});
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  // Ensure totals is always a number
  // const [totals, setTotals] = useState(0);
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [includedItems] = useState([
    "Dedicated Project Manager", "Unlimited Revisions", " Expert Team Collaboration", "Quality Assurance Guaranteed" 
  ]);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState({ name: "", phone: "", email: "" });
  const [toastMessage, setToastMessage] = useState("");
  // const [_showEmailInput, setShowEmailInput] = useState(false);
  // const [email, setEmail] = useState("");
  // const [_disableEmailBtn, setDisableEmailBtn] = useState(false);
  const [disableCallBtn, setDisableCallBtn] = useState(false);
  const [percent, setPercent] = useState(0);
  const [currentVisibleIdx, setCurrentVisibleIdx] = useState(0);
  const [showCallForm, setShowCallForm] = useState(false);

  const totalQuestions = visibleQuestions.length;
const answeredQuestions = Object.values(selectedOptions).filter(option => option !== null).length;
const totalProgressPercentage = (answeredQuestions / totalQuestions) * 100;

const firstSectionRef = useRef<HTMLDivElement | null>(null);
const secondSectionRef = useRef<HTMLDivElement | null>(null);
const footerRef = useRef<HTMLDivElement | null>(null);

const [currentSection, setCurrentSection] = useState(0); 
// 0 = hero, 1 = second section, 2 = footer
// const [_isSending, setIsSending] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);


useEffect(() => {
  // Only enable touch scroll on mobile
  if (typeof window === "undefined" || window.innerWidth > 1024) return;

  let touchStartY = 0;
  let touchEndY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
      touchEndY = e.touches[0].clientY;
    }
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      touchEndY = e.touches[0].clientY;
    }
  };
  const handleTouchEnd = () => {
    // Swipe up
    if (touchStartY - touchEndY > 50) {
     setCurrentSection((prev) => globalThis.Math.min(prev + 1, 2));

    }
    // Swipe down
    else if (touchEndY - touchStartY > 50) {
      setCurrentSection((prev) => globalThis.Math.max(prev - 1, 0));

    }
    // Otherwise, do nothing (tap or micro scroll)
  };

  // Attach to the document (captures all swipes)
  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchmove", handleTouchMove, { passive: true });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });

  // Cleanup
  return () => {
    document.removeEventListener("touchstart", handleTouchStart);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  };
}, []);

useEffect(() => {
  // Now this effect actually uses currentSection!
  if (currentSection === 0) {
    firstSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  } else if (currentSection === 1) {
    secondSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  } else if (currentSection === 2) {
    footerRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [currentSection]);





  const totalEstimate = useMemo(() => {
    return Object.values(selectedOptions).reduce((sum, opt) => {
      if (!opt || (opt.price == null)) return sum;
      const price = typeof opt.price === "string" ? parseFloat(opt.price) : Number(opt.price);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [selectedOptions]);


  // A function to determine if a question should be displayed
const isQuestionVisible = useCallback(
  (question: Question, selected: Record<number, Option | null>): boolean => {
    // not dependent → always visible
    if (!question.isDependent || !Array.isArray(question.dependentOn) || question.dependentOn.length === 0) {
      return true;
    }

    // Group required option indices by questionIndex
    const groups: Record<number, Set<number>> = {};
    for (const dep of question.dependentOn) {
      if (!groups[dep.questionIndex]) groups[dep.questionIndex] = new Set();
      groups[dep.questionIndex].add(dep.optionIndex);
    }

    // For each required previous question (AND across different questionIndex)
    for (const qIdxStr of Object.keys(groups)) {
      const qIdx = Number(qIdxStr);
      const allowed = groups[qIdx];
      const answer = selected[qIdx];
      if (!answer) return false; // no answer for that previous question

      // find index of selected option in original questions array
      if (!questions || !questions[qIdx]) return false;
      const selectedOptIdx = questions[qIdx].options.findIndex(o => o.title === answer.title);
      if (selectedOptIdx === -1) return false;

      // this group is satisfied only if selected option is one of the allowed ones
      if (!allowed.has(selectedOptIdx)) return false;
    }

    return true; // all groups satisfied
  },
  [questions]
);




  // RECALCULATE VISIBLE QUESTIONS AND CURRENT INDEX
useEffect(() => {
  if (!questions) return;
  const visible = questions.filter(q => isQuestionVisible(q, selectedOptions));
  setVisibleQuestions(visible);

  setCurrentVisibleIdx(prev => {
    if (visible.length === 0) return 0;
    if (prev >= visible.length) return visible.length - 1;
    return prev;
  });
}, [questions, selectedOptions, isQuestionVisible]);




useEffect(() => {
  async function loadFromFirestore() {
    if (!department) return;

    try {
      const docRef = doc(db, "calculatorDepartments", department);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        console.error("❌ No calculator found for:", department);
        setQuestions([]);
        return;
      }

      const data = snap.data();

      if (!data?.questions || !Array.isArray(data.questions)) {
        console.error("❌ Invalid questions format");
        setQuestions([]);
        return;
      }

      setQuestions(data.questions);
      setSelectedOptions({});
    } catch (err) {
      console.error("❌ Firestore fetch error:", err);
    }
  }

  loadFromFirestore();
}, [department]);



  
const updateCostItems = useCallback(() => {
  if (!questions) return;

  const newCostItems = Object.entries(selectedOptions).map(([index, option]) => {
    // The keys in selectedOptions are strings, so we need to convert them to numbers
    const questionIndex = parseInt(index, 10);
    const question = questions[questionIndex];

    if (!question || !option) return null;

    return {
      type: question.type,
      question: question.question, 
      label: question.questionText,
      value: option.title,
      price: typeof option.price === "string" ? parseFloat(option.price) : option.price,
    };
  }).filter(item => item !== null); // Filter out any null entries

  setCostItems(newCostItems as CostItem[]);
}, [selectedOptions, questions]);

useEffect(() => {
  updateCostItems();
}, [selectedOptions, updateCostItems]);
  // -------- Compute Progress & Totals ---------------
useEffect(() => {
  if (!questions) return;
  const visibleCount = visibleQuestions.length;
  const answeredCount = visibleQuestions.reduce((acc, q) => {
    const idx = questions.findIndex(qq => qq.questionText === q.questionText);
    if (selectedOptions[idx]) return acc + 1;
    return acc;
  }, 0);
  const newPercent = visibleCount === 0 ? 0 : Math.round((answeredCount / visibleCount) * 100);
  setPercent(newPercent);
}, [selectedOptions, visibleQuestions, currentVisibleIdx, questions]);


useEffect(() => {
  if (visibleQuestions.length === 0 || costItems.length === 0 || totalEstimate === 0) return;

  if (typeof window !== "undefined" && !localStorage.getItem("estimateId")) {
    (async () => {
      try {
        const res = await fetch("/api/calculator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceCalculator: department,
            finalPrice: totalEstimate,
            name: "N/A",
            phone: "N/A",
            email: "N/A",
            quote: costItems,
            total: totalEstimate,
          }),
        });

        const data = await res.json();
        if (res.ok && data.estimateId) {
          localStorage.setItem("estimateId", data.estimateId);
        }
      } catch (error) {
        console.error("❌ Error saving placeholder estimate:", error);
      }
    })();
  }
}, [visibleQuestions.length, costItems, totalEstimate, department]);



  // --- RENDER LOGIC STARTS HERE ---
  // Early return statements should only come after all hooks have been called
  // ------- What to render now? -----------
if (!department || !questions || questions?.length === 0) return null;


if (visibleQuestions.length === 0)
  return (
    <div className="text-center text-lg mt-10 text-gray-400">
      No visible questions.
    </div>
  );


  const currentQuestion = visibleQuestions[currentVisibleIdx];
  // The index in the original array for this question:
  const originalIndex = questions.findIndex(
    (q) => q.questionText === currentQuestion.questionText
  );

  // -------- Option selection (always write by original index) ----------
const handleOptionSelect = (opt: Option) => {
  const updated = { ...selectedOptions, [originalIndex]: opt };
  const newVisible = questions.filter(q => isQuestionVisible(q, updated));
  const visibleIndexes = newVisible.map(q => questions.findIndex(qq => qq.questionText === q.questionText));
  const cleaned: Record<number, Option | null> = {};
  visibleIndexes.forEach(idx => {
    if (updated[idx]) cleaned[idx] = updated[idx];
  });
  setSelectedOptions(cleaned);
};


  const hasMultiLineSubtitle = currentQuestion.options.some(opt => opt.subtitle && opt.subtitle.includes('|'));

  const validate = () => {
    const tempErrors = { name: "", phone: "", email: "" };
    let isValid = true;
    if (!formData.name.trim()) { tempErrors.name = "Name is required."; isValid = false; }
    if (!formData.phone.trim()) {
  tempErrors.phone = "Phone number is required.";
  isValid = false;
} 
else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
  tempErrors.phone = "Please enter a valid phone number";
  isValid = false;
}

    if (!formData.email.trim()) { tempErrors.email = "Email is required."; isValid = false; } else if (!/\S+@\S+\.\S+/.test(formData.email)) { tempErrors.email = "Email is not valid."; isValid = false; }
    setErrors(tempErrors);
    return isValid;
  };
  


const handleSubmit = async () => {
  if (!validate()) return;

  const { name, phone, email } = formData;
  const estimateId = typeof window !== "undefined" ? localStorage.getItem("estimateId") : null;

  setIsSubmitting(true);

  try {
    const res = await fetch("/api/calculator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email,
        serviceCalculator: department,
        finalPrice: totalEstimate,
        quote: costItems,
        total: totalEstimate,
        estimateId, // important: existing lead ID
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log("✅ Form submitted:", formData);
      setToastMessage("✅ Thank you! We'll connect with you soon.");
      setTimeout(() => setToastMessage(""), 4000);
      setShowCallForm(false);
      setDisableCallBtn(true);

      localStorage.removeItem("estimateId"); // cleanup after submission
    } else {
      alert(`❌ Error: ${data.message}`);
    }
  } catch (err) {
    console.error("❌ Submission error:", err);
    alert("Something went wrong while submitting.");
  } finally {
    setIsSubmitting(false);
  }
};
   

  return (

    <div ref={firstSectionRef}>
      {/* <Navbar/>
<Firstsection/> */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-md z-50">
    {toastMessage}
  </div>
)}
      <div
        className="w-full h-full relative bg-no-repeat bg-center bg-cover  py-10 md:py-0 lg:px-15 px-0 "
      >
        <div 
        style={{ touchAction: "pan-y" /* allow vertical scroll gestures */ }}
         className=" max-w-8xl mx-auto w-full flex flex-col-reverse md:flex-row items-center justify-between gap-8 relative z-10 ">
          
 
                              
             <section 
               className="w-full px-4  flex flex-col items-center lg:mt-8 ">
       
        <div ref={secondSectionRef} className="w-full  max-h-7xl lg:mt-12 mt-8">
        <div className="flex flex-col gap-2">
  {/* Progress Wrapper (relative so car is inside) */}
  <div className="flex gap-3 relative items-center">
    {/* Progress Bars */}
    {visibleQuestions.map((_, visibleIdx) => {
      const question = visibleQuestions[visibleIdx];
      const realIndex = questions.findIndex(
        (q) => q.questionText === question.questionText
      );

      return (
        <div
          key={visibleIdx}
          className="flex-1 h-[10px] rounded-[20px] border border-[#1E1E1E] bg-transparent overflow-hidden"
        >
          <div
            className="h-full bg-[#F9B31B] transition-all duration-500"
            style={{
              width: selectedOptions[realIndex] ? "100%" : "0%",
            }}
          />
        </div>
      );
    })}

    {/* Car Image */}
    <div
      className="absolute transition-all duration-500 "
      style={{
        left: `${totalProgressPercentage}%`,
        transform: "translateX(-20%)", // keeps it centered
        bottom: '1px',
      }}
    >
      <img src="/images/flyinglady.png" alt="Car" className="lg:h-[65px] h-[45px] lg:w-[70px] w-[50px]" />
    </div>
  </div>
</div>

<div className="flex items-center justify-between text-sm text-gray-600 lg:mt-3 mt-1">
            <span className="text-[#797474] text-center font-[Poppins] text-[20px] italic font-light leading-none tracking-[0.2px] capitalize">
              Progress
            </span>
            <span className="text-[#797474] text-center font-[Poppins] text-[20px] not-italic font-light leading-none tracking-[0.2px] capitalize">
              {percent}%
            </span>
          </div>

        </div>

     

        {/* ... The rest of your component remains the same from the previous response ... */}
        {currentStep !== 99 ? (
          hasMultiLineSubtitle ? (
            <div
            
              className="
              
                  flex flex-col gap-6
                  lg:mt-5  mt-5 mb-5
                  w-full
                   
                  p-5 md:p-[30px_30px]
                  bg-white rounded-[8px] border border-[#1E1E1E]
                  shadow-[6px_5px_0px_0px_#262626]
                "
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="lg:text-[24px] text-[20px] font-poppins font-[700] text-black">
                      {currentQuestion.questionText}
                    </h3>
                    {currentQuestion.questionIcon?.startsWith("data:image") ? (
                      <img src={currentQuestion.questionIcon} alt="icon" className="w-6 h-6" />
                    ) : (
                      <span>{currentQuestion.questionIcon}</span>
                    )}
                  </div>
                  <p className="text-[#797474] font-poppins text-[16px] font-[400]">
                    {currentQuestion.questionSubText}
                  </p>
                </div>

                <div className="flex items-center gap-1 sm:ml-10">
                  <span className="font-poppins text-[14px] font-[400] capitalize text-[#1E1E1E]">
                    Pick One
                  </span>
                  <svg
                    className="w-[15px] h-[10px] mt-[2px]"
                    viewBox="0 0 6 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.3 1C3.3 0.834315 3.16569 0.7 3 0.7C2.83431 0.7 2.7 0.834315 2.7 1H3.3ZM2.78787 9.21213C2.90503 9.32929 3.09497 9.32929 3.21213 9.21213L5.12132 7.30294C5.23848 7.18579 5.23848 6.99584 5.12132 6.87868C5.00416 6.76152 4.81421 6.76152 4.69706 6.87868L3 8.57574L1.30294 6.87868C1.18579 6.76152 0.995837 6.76152 0.87868 6.87868C0.761522 6.99584 0.761522 7.18579 0.87868 7.30294L2.78787 9.21213ZM3 1H2.7L2.7 9H3H3.3L3.3 1H3Z"
                      fill="#1E1E1E"
                    />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 lg:gap-10 gap-5">
            {currentQuestion.options.map((opt, i) => {
  const active = selectedOptions[originalIndex]?.title === opt.title;
  return (
    <button
      key={i}
      type="button"
      onClick={() => handleOptionSelect(opt)}
      className={`flex flex-col justify-between gap-2 rounded-[8px] border transition-colors px-4 py-4 text-left w-full lg:w-[280px] h-[180px] relative ${
        active
          ? "bg-[#F9B31B] border-[#1E1E1E] text-white shadow-[2px_2px_0px_0px_#1E1E1E]"
          : "bg-white border-[#1E1E1E] text-[#1E1E1E] hover:bg-[#FFE19F]"
      }`}
    >
      {/* This container ensures consistent spacing for the icon and title. */}
      <div className="flex flex-col items-center justify-center w-full relative">
        {/* This div *always* renders, reserving a fixed space for the icon. */}
        <div className="w-10 h-10 mb-2 flex items-center justify-center">
          {opt.icon && (
            opt.icon.startsWith("data:image") ? (
              <img src={opt.icon} alt="icon" className="w-full h-full object-contain" />
            ) : (
              <span>{opt.icon}</span>
            )
          )}
        </div>

        {/* This div wraps the title, allowing you to control its overflow. */}
        <div className="w-full text-center">
          {/* We've added `truncate` to handle long titles. */}
          <h4 className="md:text-[16px] lg:text-[16px] text-[12px] font-bold font-poppins text-black truncate">
            {opt.title}
          </h4>
        </div>

        {Number(opt.price) > 0 && (
          <span
            className={`absolute top-0 right-0 border rotate-[18deg] text-black border-black px-2 py-0.5 text-xs font-semibold rounded-md`}
            style={{ borderRadius: "5px", border: "2px solid #000" }}
          >
            ₹{Number(opt.price).toLocaleString("en-IN")}
          </span>
        )}
      </div>

      {opt.subtitle && opt.subtitle.trim() !== '' ? (

  <ul className="flex flex-wrap md:text-[12px] lg:text-[14px] text-[15px] leading-tight font-poppins text-[#444] list-disc ml-5 ">
    {opt.subtitle.split("|").map((item, i) => (
      <li key={i} className="basis-1/2 flex-shrink-0 break-words">
        {item.trim()}
      </li>
    ))}
  </ul>
) : null} 
    </button>
  );
})}



              </div>
 {currentStep !== 99 && (
  <div className="w-full flex justify-between items-center  gap-3
    
  ">

    {/* Previous Button */}
    <button
      onClick={() => {
        if (currentVisibleIdx > 0 && questions && visibleQuestions.length > 0) {
          const newSelectedOptions = { ...selectedOptions };
          const origIdx = questions.findIndex(
            (q) =>
              q.questionText === visibleQuestions[currentVisibleIdx].questionText
          );
          newSelectedOptions[origIdx] = null;
          setSelectedOptions(newSelectedOptions);
          setCurrentVisibleIdx((prev) => prev - 1);
        }
      }}
      disabled={currentVisibleIdx === 0}
      className={`
        cursor-pointer
        w-[120px] sm:w-[130px] md:w-[150px] /* responsive width */
        py-2 sm:py-3                      /* responsive height */
        text-[14px] sm:text-[16px]        /* responsive text */
        flex items-center justify-center gap-2 rounded-[5px] italic
        border shadow-[2px_2px_0px_0px_#262626] transition-colors
        ${
          currentVisibleIdx > 0
            ? "bg-[#F9B31B] border-[#262626] text-[#262626]"
            : "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed shadow-none"
        }
      `}
    >
      Previous
    </button>

    {/* Next Button */}
    <button
      onClick={() => {
        if (currentVisibleIdx === visibleQuestions.length - 1) {
          setCurrentStep(99);
        } else {
          setCurrentVisibleIdx((prev) =>
            Math.min(visibleQuestions.length - 1, prev + 1)
          );
        }
      }}
      disabled={!selectedOptions[originalIndex]}
      className={`
        cursor-pointer
        w-[120px] sm:w-[130px] md:w-[150px]   /* responsive width */
        py-2 sm:py-3                         /* responsive padding */
        text-[14px] sm:text-[16px]           /* responsive font */
        flex items-center justify-center gap-2 rounded-[5px] font-medium
        border-2 transition-colors
        ${
          selectedOptions[originalIndex]
            ? "bg-black border-black text-white hover:bg-[#1a1a1a] shadow-[2px_2px_0px_0px_#F9B31B]"
            : "bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed"
        }
      `}
    >
      {currentVisibleIdx === visibleQuestions.length - 1
        ? "See Estimate"
        : "Next"}
    </button>

  </div>
)}
            </div>
          ) : (
            <div
              className="
                  flex flex-col gap-6
                  lg:mt-5  mt-5 mb-5
                  w-full  
                  p-5 md:p-[30px_30px]
                  bg-white rounded-[8px] border border-[#1E1E1E]
                  shadow-[6px_5px_0px_0px_#262626]
                "
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 lg:w-[700px]">
                    <h3 className="lg:text-[24px] text-[20px] font-poppins font-[700] text-black">
                      {currentQuestion.questionText}
                    </h3>
                    {currentQuestion.questionIcon?.startsWith("data:image") ? (
                      <img src={currentQuestion.questionIcon} alt="icon" className="w-4 h-4" />
                    ) : (
                      <span>{currentQuestion.questionIcon}</span>
                    )}
                  </div>

                  
                  <p className="text-[#797474] font-poppins text-[16px] font-[400]">
                    {currentQuestion.questionSubText}
                  </p>
                </div>

                <div className="flex items-center gap-1 sm:ml-10">
                  <span className="font-poppins text-[14px] capitalize font-[400] text-[#1E1E1E]">
                    Pick One
                  </span>
                  <svg
                    className="w-[15px] h-[10px] mt-[2px]"
                    viewBox="0 0 6 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.3 1C3.3 0.834315 3.16569 0.7 3 0.7C2.83431 0.7 2.7 0.834315 2.7 1H3.3ZM2.78787 9.21213C2.90503 9.32929 3.09497 9.32929 3.21213 9.21213L5.12132 7.30294C5.23848 7.18579 5.23848 6.99584 5.12132 6.87868C5.00416 6.76152 4.81421 6.76152 4.69706 6.87868L3 8.57574L1.30294 6.87868C1.18579 6.76152 0.995837 6.76152 0.87868 6.87868C0.761522 6.99584 0.761522 7.18579 0.87868 7.30294L2.78787 9.21213ZM3 1H2.7L2.7 9H3H3.3L3.3 1H3Z"
                      fill="#1E1E1E"
                    />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {currentQuestion.options.map((opt, i) => {
            const active = selectedOptions[originalIndex]?.title === opt.title;
                  return (
                    
                   <button
  key={i}
  type="button"
  onClick={() => handleOptionSelect(opt)}
  className={`
    flex items-start gap-4 rounded-[8px] border transition-colors px-3 py-3 text-left w-full
    ${active
      ? "bg-[#F9B31B] border-[#1E1E1E] text-white shadow-[2px_2px_0px_0px_#1E1E1E]"
      : "bg-white border-[#1E1E1E] text-[#1E1E1E] hover:bg-[#FFE19F]"
    }
  `}
>

  {/* LEFT SIDE */}
<div className="flex gap-2 w-full">

  {/* LEFT COLUMN (icon + title + price + line + subtitle all together) */}
  <div className="flex flex-col w-full">

    {/* TOP ROW: ICON + TITLE + PRICE */}
    <div className="flex items-center justify-between w-full">

      {/* ICON */}
      {opt.icon ? (
        <span className="inline-flex items-center justify-center w-6 h-6 mr-2">
          {opt.icon.startsWith("data:image") ? (
            <img src={opt.icon} alt="icon" className="w-5 h-5" />
          ) : (
            <span>{opt.icon}</span>
          )}
        </span>
      ) : (
        <span
          className={`w-[12px] h-[12px] rounded-full border-[2px] ${
            active ? "bg-black border-black" : "border-[#F9B31B]"
          }`}
        />
      )}

      {/* TITLE */}
      <h4 className="flex-1 text-[#111827] font-poppins text-[13px] font-[600] ml-2">
        {opt.title}
      </h4>

      {/* PRICE */}
      <span
        className={`text-[14px] font-[500] ${
          active ? "text-white" : "text-[#111827]"
        }`}
      >
        {Number(opt.price) > 0 ? `₹${Number(opt.price).toLocaleString("en-IN")}` : ""}
      </span>
    </div>

    {/* FULL-WIDTH LINE BELOW ICON + TITLE */}
    {opt.subtitle?.trim() && (
      <div
        className={`w-full h-[2px] border-t border-dashed my-[6px] ${
          active ? "border-black" : "border-[#F9B31B]"
        }`}
      ></div>
    )}

    {/* SUBTITLE */}
    {opt.subtitle?.trim() && (
     <p
  className="
    font-poppins font-[500] text-[14px] leading-[1.3] text-[#111827]
    break-words whitespace-normal
  "
>
  {opt.subtitle}
</p>

    )}

  </div>
</div>


</button>

                  );
                })}

              
              </div>

             {currentStep !== 99 && (
  <div className="w-full flex justify-between items-center  gap-3
    
  ">

    {/* Previous Button */}
    <button
      onClick={() => {
        if (currentVisibleIdx > 0 && questions && visibleQuestions.length > 0) {
          const newSelectedOptions = { ...selectedOptions };
          const origIdx = questions.findIndex(
            (q) =>
              q.questionText === visibleQuestions[currentVisibleIdx].questionText
          );
          newSelectedOptions[origIdx] = null;
          setSelectedOptions(newSelectedOptions);
          setCurrentVisibleIdx((prev) => prev - 1);
        }
      }}
      disabled={currentVisibleIdx === 0}
      className={`
        cursor-pointer
        w-[120px] sm:w-[130px] md:w-[150px] /* responsive width */
        py-2 sm:py-3                      /* responsive height */
        text-[14px] sm:text-[16px]        /* responsive text */
        flex items-center justify-center gap-2 rounded-[5px] italic
        border shadow-[2px_2px_0px_0px_#262626] transition-colors
        ${
          currentVisibleIdx > 0
            ? "bg-[#F9B31B] border-[#262626] text-[#262626]"
            : "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed shadow-none"
        }
      `}
    >
      Previous
    </button>

    {/* Next Button */}
    <button
      onClick={() => {
        if (currentVisibleIdx === visibleQuestions.length - 1) {
          setCurrentStep(99);
        } else {
          setCurrentVisibleIdx((prev) =>
            Math.min(visibleQuestions.length - 1, prev + 1)
          );
        }
      }}
      disabled={!selectedOptions[originalIndex]}
      className={`
        cursor-pointer
        w-[120px] sm:w-[130px] md:w-[150px]   /* responsive width */
        py-2 sm:py-3                         /* responsive padding */
        text-[14px] sm:text-[16px]           /* responsive font */
        flex items-center justify-center gap-2 rounded-[5px] font-medium
        border-2 transition-colors
        ${
          selectedOptions[originalIndex]
            ? "bg-black border-black text-white hover:bg-[#1a1a1a] shadow-[2px_2px_0px_0px_#F9B31B]"
            : "bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed"
        }
      `}
    >
      {currentVisibleIdx === visibleQuestions.length - 1
        ? "See Estimate"
        : "Next"}
    </button>

  </div>
)}


            </div>
          )
        ) : (
        <div
  className="
    flex flex-col gap-10
    lg:flex-row
     lg:mt-5  mt-5
    w-full
    p-4 md:p-8
    bg-white border border-[#1E1E1E]
    rounded-[12px]
    shadow-[6px_6px_0px_0px_#262626]
  "
>
  {/* LEFT SECTION (Price + Cost Summary card) */}
<div className="w-full lg:w-1/2 flex flex-col ">

    {/* Cost Summary (Black card like reference) */}
{/* FLIP WRAPPER */}
<div className="relative w-full perspective">
  <div
    className={`
      duration-700 preserve-3d relative 
      ${showCallForm ? "rotate-y-180" : ""}
    `}
  >

    {/* FRONT SIDE (YOUR COST CARD) */}
    <div className="backface-hidden">
      <div 
        className="
          relative
          flex flex-col
          w-full
          lg:p-8 p-5
          bg-[#1B1B1B]
          rounded-[20px] 
          overflow-hidden
          text-white
        "
      >
        {/* RIGHT BORDER */}
        <div className="absolute right-0 top-0 w-3 sm:w-4 md:w-5 h-full bg-[#FAB31E]"></div>

        {/* Yellow Price Box */}
        <div className="text-center py-5 rounded-[12px] bg-[#F9B31B]">
         <h3 className="
  text-white 
  font-poppins 
  font-[700]
  text-[22px]       /* mobile */
  sm:text-[24px]    /* small screens */
  md:text-[26px]    /* tablets */
  lg:text-[28px]    /* desktop */
">
  ₹{totalEstimate.toLocaleString()}/-
</h3>

          <p className="text-[#1E1E1E] text-[15px] font-[300]">
            Here&lsquos What It&lsquoll Take to Build Your Vision
          </p>
        </div>

        <h2 className="text-[22px] font-[700] mb-4 flex items-center gap-2 mt-4">
          Cost Summary
        </h2>

        {costItems.map((item, index) => (
          <div key={index} className="flex justify-between text-[15px] mb-3">
                                <p>

                       <span className="text-white text-center font-[Poppins] text-[14px] font-[700] leading-normal not-italic">
{item.type}:
</span>
{" "}
                      <span className="text-white font-[Poppins] text-[14px] font-[300] not-italic  leading-normal">
                           {item.value}
                      </span>
                    </p>

            <span className="font-[500] text-white">
              ₹{item.price.toLocaleString()}
            </span>
          </div>
        ))}

        <hr className="my-3 border-[#F9B31B]" />

        <div className="flex justify-between font-[700] text-[16px]">
          <p>Estimated Cost:</p>
          <p>₹{totalEstimate.toLocaleString()}</p>
        </div>

        {/* SCHEDULE BUTTON → FLIPS CARD */}
        {!showCallForm ? (





          <div className="w-full flex justify-center mt-3">
  <Button
    onClick={() => setShowCallForm(true)}
    disabled={disableCallBtn}
    text="Schedule Free Call"
    className="relative justify-center text-white transition-colors"
  />
</div>

        ) : null}

      
      </div>
    </div>

    {/* BACK SIDE — YOUR FORM PAGE */}
    <div className="absolute inset-0 rotate-y-180 backface-hidden ">
  <div className="w-full h-auto min-h-full bg-[#1B1B1B] rounded-[20px] lg:p-8 p-5 text-white relative overflow-hidden">


         {/* RIGHT BORDER */}
<div className="absolute right-0 top-0 w-3 sm:w-4 md:w-5 h-full bg-[#FAB31E]"></div>

        <button
          onClick={() => setShowCallForm(false)}
          className="text-sm mb-3"
        >
          ← <span  className="underline " > See Quotation </span>
        </button>

        <h2 className="text-[22px] font-[700] mb-6 flex items-center gap-2">
          Need Your Details 📒
        </h2>

        {/* INLINE FORM EXACTLY LIKE YOUR IMAGE */}
           <div className="grid grid-cols-1 gap-6 mb-6 w-full">

  {/* First Name */}
  <div className="flex flex-col gap-1 w-full">
    {/* <label htmlFor="name" className="text-sm font-medium text-black"> Name </label> */}
     <input 
     type="text" 
     id="name" 
     name="name" 
     value={formData.name}
      onChange={(e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value, })) }
      className={`px-3 py-2 border-b bg-transparent text-white placeholder:text-white focus:outline-none 
      focus:ring-0 
      focus:border-[#F9B31B] ${
        errors.name
          ? "border-red-500 focus:ring-red-300"
          : "border-[#F9B31B] focus:ring-[#F9B31B]"
      }`}
      placeholder="Name"
    />
   {errors.name && ( <p className="text-red-500 text-sm mt-1">{errors.name}</p> )}
  </div>

  {/* Last Name */}
  <div className="flex flex-col gap-1 w-full">
    {/* <label htmlFor="phone" className="text-sm font-medium text-black">
      Phone
    </label> */}
    <input
      type="tel"
      id="phone"
      name="phone"
      value={formData.phone}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          [e.target.name]: e.target.value,
        }))
      }
      className={`px-3 py-2 border-b bg-transparent text-white placeholder:text-white focus:outline-none 
      focus:ring-0 
      focus:border-[#F9B31B]  ${
        errors.phone
          ? "border-red-500 focus:ring-red-300"
          : "border-[#F9B31B] focus:ring-[#F9B31B]"
      }`}
      placeholder="Phone"
    />
   {errors.phone && (
      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
    )}
  </div>

  {/* Email */}
  <div className="flex flex-col gap-1 w-full">
    {/* <label htmlFor="email" className="text-sm font-medium text-white">
      Email
    </label> */}
    <input
      type="email"
      id="email"
      name="email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      className={`px-3 py-2 border-b bg-transparent text-white placeholder:text-white focus:outline-none 
      focus:ring-0 
      focus:border-[#F9B31B] ${
        errors.email
          ? "border-red-500 focus:ring-red-300"
          : "border-[#F9B31B] focus:ring-[#F9B31B]"
      }`}
      placeholder="Email"
    />
    {errors.email && (
      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
    )}
  </div>
</div>


       <div className="w-full flex justify-end mt-3">
  <button
    onClick={handleSubmit}
    className="py-[8px] px-[23px] rounded-[5px] bg-[#262626] 
    shadow-[2px_2px_0px_0px_#F9B31B] text-white italic"
  >
  {isSubmitting ? "Submitting..." : "Submit"}
  </button>
</div>


      </div>
    </div>

  </div>
</div>

  </div>

  {/* RIGHT SECTION */}
<div className="w-full lg:w-1/2 flex flex-col p-2">
    {/* What's Always Included */}
    <div>
    <h4 className="
  font-[700] 
  mb-4 
  flex 
  items-center 
  gap-2
  text-[20px]      /* mobile */
  sm:text-[22px]   /* small screens */
  md:text-[24px]   /* tablets */
  lg:text-[26px]   /* desktop */
">
  What’s Always Included
</h4>


      <ul className="space-y-3 mb-5">
        {includedItems.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-3 h-3 bg-[#76CA21] rounded-full mt-1"></span>
            <span className="text-[15px] text-[#1E1E1E] leading-[22px]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>

<div className="w-full h-[2px] border-t border-dashed border-[#F9B31B] my-[6px]"></div>

   
      {/* <Testimonials /> */}

  </div>
</div>

        )}


      </section>    
        </div>     
      </div>
     <div ref={footerRef}>
  {/* <Footer /> */}
</div>

    </div>
  );
}




