"use client";

import React, { useState ,useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Edit, Trash } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp ,deleteDoc} from "firebase/firestore";
import { useSearchParams } from "next/navigation";

/* ===================== TYPES ===================== */

type DependentOn = {
  questionIndex: number;
  optionIndex: number;
};

type Option = {
  icon: string;
  title: string;
  subtitle: string;
  price: string;
};

type Question = {
  id: string;
  questionText: string;
  questionIcon: string;
  questionSubText: string;
  type: string;
  isDependent: boolean;
  dependentOn?: DependentOn[];
  options: Option[];
};

/* ===================== COMPONENT ===================== */

const CalculatorForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
const editDeptId = searchParams.get("id"); // 👈 department name


  const [departments, setDepartments] = useState<string[]>([]);
  const [newDept, setNewDept] = useState("");
  const [formState, setFormState] = useState<Record<string, Question[]>>({});
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const [metaTitles, setMetaTitles] = useState<Record<string, string>>({});
  const [metaDescriptions, setMetaDescriptions] = useState<Record<string, string>>({});

  const [questionForm, setQuestionForm] = useState({
    text: "",
    icon: "",
    subText: "",
    type: "",
    isDependent: false,
  });

  const [option, setOption] = useState<Option>({
    icon: "",
    title: "",
    subtitle: "",
    price: "",
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [selectedDependencyOptions, setSelectedDependencyOptions] = useState<number[]>([]);
  const [selectedDependencyQuestion, setSelectedDependencyQuestion] = useState<number | null>(null);

  /* ===================== FIRESTORE SAVE (SAFE) ===================== */

  const saveDepartmentToDB = async (
    deptName: string,
    questions: Question[],
    metaTitle?: string,
    metaDescription?: string
  ) => {
    try {
      const payload: any = {
        name: deptName,
        questions,
        updatedAt: serverTimestamp(),
      };

      if (metaTitle) payload.metaTitle = metaTitle;
      if (metaDescription) payload.metaDescription = metaDescription;

      await setDoc(doc(db, "calculatorDepartments", deptName), payload, {
        merge: true,
      });
    } catch (err) {
      console.error("Firestore save error:", err);
    }
  };

  /* ===================== HELPERS ===================== */

  const showAlert = (message: string, onConfirm?: () => void) => {
    alert(message);
    if (onConfirm) onConfirm();
  };

  const autoSaveToMongo = async (deptName: string) => {
    if (!deptName || !formState[deptName]) return;

    await saveDepartmentToDB(
      deptName,
      formState[deptName],
      metaTitles[deptName],
      metaDescriptions[deptName]
    );
  };

  const saveOrder = async () => {
    if (!selectedDept) {
      showAlert("Please select a department first.");
      return;
    }

    await autoSaveToMongo(selectedDept);
    showAlert("✅ Order saved successfully!");
  };

  /* ===================== QUESTION LOGIC ===================== */

  const handleAddOrUpdateQuestion = () => {
    if (!selectedDept) return;

    setFormState(prev => {
      const updatedQuestions = [...(prev[selectedDept] || [])];

      const newQuestion: Question = {
        id: "",
        questionText: questionForm.text,
        questionIcon: questionForm.icon,
        questionSubText: questionForm.subText,
        type: questionForm.type,
        isDependent: questionForm.isDependent,
        options:
          editingQuestionIndex !== null
            ? updatedQuestions[editingQuestionIndex].options
            : [],
      };

      if (questionForm.isDependent && selectedDependencyQuestion !== null) {
        newQuestion.dependentOn = selectedDependencyOptions.map(opt => ({
          questionIndex: selectedDependencyQuestion,
          optionIndex: opt,
        }));
      }

      if (editingQuestionIndex !== null) {
        updatedQuestions[editingQuestionIndex] = newQuestion;
      } else {
        updatedQuestions.push(newQuestion);
      }

      saveDepartmentToDB(
        selectedDept,
        updatedQuestions,
        metaTitles[selectedDept],
        metaDescriptions[selectedDept]
      );

      return { ...prev, [selectedDept]: updatedQuestions };
    });

    setEditingQuestionIndex(null);
    setQuestionForm({
      text: "",
      icon: "",
      subText: "",
      type: "",
      isDependent: false,
    });
  };

  /* ===================== OPTION LOGIC ===================== */

  const handleAddOrUpdateOption = (questionIndex: number) => {
    if (!selectedDept) return;

    const updatedQuestions = [...formState[selectedDept]];
    const options = [...updatedQuestions[questionIndex].options];

    if (editingOptionIndex !== null) {
      options[editingOptionIndex] = option;
      setEditingOptionIndex(null);
    } else {
      options.push(option);
    }

    updatedQuestions[questionIndex].options = options;
    setFormState({ ...formState, [selectedDept]: updatedQuestions });

    saveDepartmentToDB(
      selectedDept,
      updatedQuestions,
      metaTitles[selectedDept],
      metaDescriptions[selectedDept]
    );

    setOption({ icon: "", title: "", subtitle: "", price: "" });
  };

  /* ===================== ORDER ===================== */

  const moveUp = (index: number) => {
    if (!selectedDept || index === 0) return;

    const updated = [...formState[selectedDept]];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];

    setFormState({ ...formState, [selectedDept]: updated });
    autoSaveToMongo(selectedDept);
  };

  const moveDown = (index: number) => {
    if (!selectedDept) return;

    const updated = [...formState[selectedDept]];
    if (index === updated.length - 1) return;

    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];

    setFormState({ ...formState, [selectedDept]: updated });
    autoSaveToMongo(selectedDept);
  };

  /* ===================== DEPARTMENT ===================== */

const handleAddDepartment = async () => {
  const name = newDept.trim();
  const existingRef = doc(db, "calculatorDepartments", name);
const existingSnap = await getDoc(existingRef);

if (existingSnap.exists()) {
  showAlert("❌ This name is already present. Please choose another name.");
  return;
}

  if (!name) return;

  // 🔴 CHECK: already exists (case-insensitive)
  const exists = departments.some(
    d => d.toLowerCase() === name.toLowerCase()
  );

  if (exists) {
    showAlert("❌ This name is already available. Please select another name.");
    return;
  }

  // ✅ SAFE TO ADD
  setDepartments(prev => [...prev, name]);
  setFormState(prev => ({ ...prev, [name]: [] }));
  setSelectedDept(name);

  saveDepartmentToDB(name, []);
  setNewDept("");
};


const handleUpdateDepartment = async () => {
  if (!selectedDept) return;

  const oldName = selectedDept;
  const newName = newDept.trim();
  // 🔴 BLOCK if another department already exists
const existingRef = doc(db, "calculatorDepartments", newName);
const existingSnap = await getDoc(existingRef);

if (existingSnap.exists()) {
  showAlert("❌ This name is already present. Please choose another name.");
  return;
}


  if (!newName) {
    showAlert("Please enter a department name.");
    return;
  }

  if (oldName === newName) {
    showAlert("No changes detected.");
    return;
  }

  const questions = formState[oldName] || [];

  // 1️⃣ Update UI state
  setDepartments(prev =>
    prev.map(d => (d === oldName ? newName : d))
  );

  setFormState(prev => {
    const updated = { ...prev };
    updated[newName] = updated[oldName];
    delete updated[oldName];
    return updated;
  });

  setSelectedDept(newName);
  setNewDept("");

  // 2️⃣ Save NEW doc
  await saveDepartmentToDB(
    newName,
    questions,
    metaTitles[oldName],
    metaDescriptions[oldName]
  );

  // 3️⃣ DELETE OLD doc (THIS WAS MISSING)
  await deleteDoc(doc(db, "calculatorDepartments", oldName));

  showAlert("✅ Department renamed successfully!");
};



  const handleDeleteQuestion = (dept: string, index: number) => {
    setFormState(prev => {
      const updated = [...prev[dept]];
      updated.splice(index, 1);

      saveDepartmentToDB(
        dept,
        updated,
        metaTitles[dept],
        metaDescriptions[dept]
      );

      return { ...prev, [dept]: updated };
    });
  };

    const handleDeptInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setNewDept(value);
};


  /* ===================== edit button data fetch ===================== */

useEffect(() => {
  if (!editDeptId) return;

  const fetchDepartment = async () => {
    try {
      const ref = doc(db, "calculatorDepartments", editDeptId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Department not found");
        return;
      }

      const data = snap.data();

      // 1️⃣ Set department list
      setDepartments([editDeptId]);

      // 2️⃣ Select department
      setSelectedDept(editDeptId);
      setNewDept(editDeptId);

      // 3️⃣ Load questions
      setFormState({
        [editDeptId]: data.questions || [],
      });

      // 4️⃣ Load SEO
      setMetaTitles({
        [editDeptId]: data.metaTitle || "",
      });

      setMetaDescriptions({
        [editDeptId]: data.metaDescription || "",
      });
    } catch (err) {
      console.error("Failed to load department:", err);
    }
  };

  fetchDepartment();
}, [editDeptId]);





  return (

     <div className="flex min-h-screen text-gray-900 font-sans antialiased"
     >

         <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-300 flex-1">
            <h2 className="text-2xl font-semibold mb-4">Services Management</h2>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
  <input
    type="text"
    placeholder="Add or edit department"
    value={newDept}
    onChange={handleDeptInput}
    className="border border-gray-300 bg-white p-2 rounded-lg text-black w-full sm:w-auto focus:ring-2 focus:ring-[#FFD54F] focus:border-transparent"
  />

  {selectedDept ? (
    <button
      onClick={handleUpdateDepartment}

      className="rounded-[5px] bg-[#F9B31B] shadow-[2px_2px_0_0_#262626] flex justify-center items-center gap-[10px] px-[30px] py-[10px] text-[#262626] font-semibold transition-colors w-full sm:w-auto"
    >
      Update Depaartment
    </button>
  ) : (
    <button
      onClick={handleAddDepartment}
      className="rounded-[5px] bg-[#262626] shadow-[2px_2px_0px_0px_#F9B31B] flex justify-center items-center gap-[10px] px-[30px] py-[10px] text-[#F9B31B] font-semibold transition-colors w-full sm:w-auto"
    >
      Add Department
    </button>
  )}
</div>


            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
  setSelectedDept(dept);
  setNewDept(dept); // 👈 THIS WAS MISSING
}}

                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${selectedDept === dept ? 'bg-black text-[#FFD54F] shadow-[2px_2px_0px_0px_#262626]' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {selectedDept && (
              <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-gray-300">
                <div className="mb-6">
  {/* META TITLE */}
  <label className="block text-black mb-2 font-semibold">
    Meta Title for {selectedDept}
  </label>

  <input
    type="text"
    value={metaTitles[selectedDept] || ""}
    onChange={(e) =>
      setMetaTitles((prev) => ({
        ...prev,
        [selectedDept]: e.target.value,
      }))
    }
    className="w-full p-2 rounded bg-white border border-gray-300 text-black"
    placeholder="Enter SEO Page Title"
  />
</div>

<div className="mb-6">
  {/* META DESCRIPTION */}
  <label className="block text-black mb-2 font-semibold">
    Meta Description for {selectedDept}
  </label>

  <textarea
    value={metaDescriptions[selectedDept] || ""}
    onChange={(e) =>
      setMetaDescriptions((prev) => ({
        ...prev,
        [selectedDept]: e.target.value,
      }))
    }
    rows={3}
    className="w-full p-2 rounded bg-white border border-gray-300 text-black resize-none"
    placeholder="Enter SEO Meta Description (150–160 characters)"
  />
</div>

{/* SINGLE SAVE BUTTON */}
<button
  onClick={() => {
    if (!selectedDept) return;

    autoSaveToMongo(selectedDept);
    showAlert("✅ Meta title & description saved successfully!");
  }}
  className={`rounded-[5px] shadow-[2px_2px_0px_0px] flex justify-center items-center gap-[10px] px-[30px] py-[10px] font-semibold transition-colors w-full sm:w-auto
    ${
      metaTitles[selectedDept] || metaDescriptions[selectedDept]
        ? "bg-[#F9B31B] shadow-[2px_2px_0px_0px_#262626] text-[#262626]"
        : "bg-[#262626] shadow-[2px_2px_0px_0px_#F9B31B] text-[#F9B31B]"
    }`}
>
  Save SEO Meta
</button>


                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold capitalize">{selectedDept} Questions</h2>
                  <a href={`/${selectedDept}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline flex items-center gap-2 hover:text-purple-800">
                    Preview Page <ExternalLink size={16} />
                  </a>
                </div>

                <div className="mb-8 p-4 bg-white rounded-lg border border-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const result = reader.result;
                            setQuestionForm(prev => ({
                              ...prev,
                              icon: typeof result === "string" ? result : ""
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFD54F] file:text-black hover:file:bg-yellow-400"
                    />

                    <input
                      type="text"
                      placeholder="Main Question"
                      value={questionForm.text}
                      required
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
                      className="bg-white border border-gray-300 p-2 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle"
                      value={questionForm.subText}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, subText: e.target.value }))}
                      className="bg-white border border-gray-300 p-2 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Type of question that links to estimates page"
                      value={questionForm.type}
                      required
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, type: e.target.value }))}
                      className="bg-white border border-gray-300 p-2 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="dependency-type"
                        checked={!questionForm.isDependent}
                        onChange={() => {
                          setQuestionForm(prev => ({ ...prev, isDependent: false }));
                          setSelectedDependencyQuestion(null);
                          setSelectedDependencyOptions([]);
                        }}
                      />
                      <span>Independent Question</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="dependency-type"
                        checked={questionForm.isDependent}
                        onChange={() => setQuestionForm(prev => ({ ...prev, isDependent: true }))}
                      />
                      <span>Dependent Question</span>
                    </label>
                  </div>

                  {questionForm.isDependent && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <select
                        className="bg-white/50 backdrop-blur-md border border-gray-300 p-2 rounded-lg w-full text-black"
                        value={selectedDependencyQuestion ?? ''}
                        onChange={(e) => {
                          const index = parseInt(e.target.value);
                          setSelectedDependencyQuestion(index);
                          setSelectedDependencyOptions([]);
                        }}
                      >
                        <option value="">Select dependency question</option>
                        {formState[selectedDept]?.map((q, idx) => (
                          <option key={idx} value={idx}>{q.questionText}</option>
                        ))}
                      </select>
                      {selectedDependencyQuestion !== null && (
                        <select
                          multiple
                          className="bg-gray-200 border border-gray-300 p-2 rounded-lg w-full text-black"
                          value={selectedDependencyOptions.map(String)}
                          onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
                            setSelectedDependencyOptions(values);
                          }}
                        >
                          {formState[selectedDept]?.[selectedDependencyQuestion]?.options.map((opt, idx) => (
                            <option key={idx} value={idx}>{opt.title}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <button
                   onClick={handleAddOrUpdateQuestion}
  className={`rounded-[5px] flex justify-center items-center gap-[10px] px-[30px] py-[10px] font-semibold transition-colors w-full sm:w-auto
    ${
      editingQuestionIndex !== null
        ? "bg-[#F9B31B] text-[#262626] shadow-[2px_2px_0_0_#262626]" // Update (Save)
        : "bg-[#262626] text-[#F9B31B] shadow-[2px_2px_0px_0px_#F9B31B]" // Add
    }`}
                  >
                    {editingQuestionIndex !== null ? 'Save Question' : 'Add Question'}
                  </button>
                               <button
        onClick={saveOrder}
        className="mt-5 px-5 py-2 bg-green-600 text-white rounded"
      >
        Save Order
      </button>
                </div>

                {formState[selectedDept]?.map((q, qIndex) => (
                  <div key={qIndex} className="mb-6 p-6 border border-gray-300  rounded-2xl bg-white/50 backdrop-blur-md relative">
                    <div className="absolute top-4 right-4 flex gap-2">

<div className="flex gap-2">
              <button
    onClick={() => moveUp(qIndex)}
    className="px-3 py-1 bg-blue-500 rounded text-white"
  >
    ⬆
  </button>

  <button
    onClick={() => moveDown(qIndex)}
    className="px-3 py-1 bg-blue-500 rounded text-white"
  >
    ⬇
  </button>
            </div>



  {/* Edit */}
  <button
    className="p-2 rounded-lg text-[#FFD54F] hover:bg-gray-300 transition-colors"
    title="Edit Question"
    onClick={() => {
      setQuestionForm({
        text: q.questionText,
        icon: q.questionIcon,
        subText: q.questionSubText,
        type: q.type,
        isDependent: q.isDependent,
        // dependentOn: q.dependentOn,
      });
      if (q.isDependent && Array.isArray(q.dependentOn) && q.dependentOn.length > 0) {
        const qIdx = q.dependentOn[0].questionIndex;
        setSelectedDependencyQuestion(qIdx);
        setSelectedDependencyOptions(q.dependentOn.map(dep => dep.optionIndex));
      } else {
        setSelectedDependencyQuestion(null);
        setSelectedDependencyOptions([]);
      }
      setEditingQuestionIndex(qIndex);
    }}
  >
    <Edit size={18} />
  </button>

  {/* Delete */}
  <button
    className="p-2 rounded-lg text-red-600 hover:bg-gray-300 transition-colors"
    title="Delete Question"
    onClick={() => {
      showAlert('Are you sure you want to delete this question?', () => {
        handleDeleteQuestion(selectedDept, qIndex);
      });
    }}
  >
    <Trash size={18} />
  </button>

</div>


                    <div className="flex items-start gap-4 mb-4">
                      {q.questionIcon && (
                        q.questionIcon?.startsWith("data:image") ? (
                          <img src={q.questionIcon} alt="icon" className="w-10 h-10 object-contain rounded-lg" />
                        ) : (
                          <span className="text-4xl">{q.questionIcon}</span>
                        )
                      )}
                      <div>
                        <h3 className="text-xl font-bold">Q{qIndex + 1}: {q.questionText}</h3>
                        <p className="text-gray-600">{q.questionSubText}</p>
                        <p className="text-gray-600 font-semibold text-sm">Type: {q.type}</p>
                        {q.isDependent && Array.isArray(q.dependentOn) && q.dependentOn.length > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            Depends on Q{q.dependentOn[0].questionIndex + 1} — Option(s): {q.dependentOn.map(d => d.optionIndex + 1).join(', ')}
                          </p>
                        )}

                      </div>
                    </div>

                    <hr className="border-gray-300 my-4" />

                    <div className="p-4 bg-white rounded-lg border border-gray-300 mb-4">
                      <h4 className="text-lg font-semibold mb-3">
                        {editingOptionIndex !== null ? 'Edit Option' : 'Add New Option'} for Q{qIndex + 1}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 mb-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const result = reader.result;
                                setOption(prev => ({
                                  ...prev,
                                  icon: typeof result === "string" ? result : ""
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFD54F] file:text-black hover:file:bg-yellow-400"
                        />
                        <input
                          type="text"
                          placeholder="Title"
                          value={option.title}
                          onChange={(e) => setOption({ ...option, title: e.target.value })}
                          className="bg-white border border-gray-300 p-2 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Subtitle"
                          value={option.subtitle}
                          onChange={(e) => setOption({ ...option, subtitle: e.target.value })}
                          className="bg-white border border-gray-300 p-2 rounded-lg"
                        />
                        <input
    type="text"
    placeholder="Price"
    value={option.price}
    onChange={(e) => setOption({ ...option, price: e.target.value })}
    className="bg-white border border-gray-300 p-2 rounded-lg"
  />
</div>

<button
  onClick={() => handleAddOrUpdateOption(qIndex)}
  className={`rounded-[5px] flex justify-center items-center gap-[10px] px-[30px] py-[10px] font-semibold transition-colors w-full sm:w-auto
    ${
      editingOptionIndex !== null
        ? "bg-[#F9B31B] shadow-[2px_2px_0px_0px_#262626] text-[#262626]"
        : "bg-[#262626] shadow-[2px_2px_0px_0px_#F9B31B] text-[#F9B31B]"
    }`}
>
  {editingOptionIndex !== null ? 'Save Option' : 'Add Option'}
</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {q.options.map((opt, idx) => (
                        <div key={idx} className="relative p-4 rounded-xl shadow-md bg-white border border-gray-300">
                          <div className="absolute top-4 right-4 flex gap-2">
                            <button
                              className="p-1 rounded-md text-[#FFD54F] hover:bg-gray-300 transition-colors"
                              title="Edit Option"
                              onClick={() => {
                                setOption(opt);
                                setEditingOptionIndex(idx);
                              }}
                            >
                              <Edit size={16} />
                            </button>
                             <button
  className="p-1 rounded-md text-red-400 hover:bg-gray-700 transition-colors"
  title="Delete Option"
  onClick={() => {
    showAlert('Are you sure you want to delete this option?', () => {
      // Remove option from local state
      const updatedOptions = q.options.filter((_, i) => i !== idx);
      const updatedQuestions = [...formState[selectedDept]];
      updatedQuestions[qIndex].options = updatedOptions;
      setFormState({ ...formState, [selectedDept]: updatedQuestions });

      // ✅ Save updated department data to backend
      autoSaveToMongo(selectedDept);
    });
  }}
>
  <Trash size={16} />
</button>
                          </div>
                          {opt.icon && (
                            opt.icon.startsWith("data:image") ? (
                              <img src={opt.icon} alt="icon" className="w-12 h-12 object-contain rounded-lg mb-2" />
                            ) : (
                              <span className="text-4xl mb-2 block">{opt.icon}</span>
                            )
                          )}
                          
                          <h5 className="font-semibold text-lg">{opt.title}</h5>
                          <p className="text-sm text-gray-500">{opt.subtitle}</p>
                          <p className="text-xl font-bold mt-2 text-[#FFD54F]">₹{opt.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
       
    </div> 

  );
};

export default CalculatorForm;
