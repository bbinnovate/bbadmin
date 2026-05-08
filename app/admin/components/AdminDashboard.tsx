"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  ResponsiveContainer,
  BarChart,
  Area,
  AreaChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";
import CalculatorForm from './CalculatorForm';
import { format } from "date-fns"; 

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [careerForms, setCareerForms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formsData, setFormsData] = useState<any[]>([]);
  const [ClientsData, setClientsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const adminCount = users.filter(u => u.role === "admin").length;
  const userCount = users.filter(u => u.role === "user").length;



  // 🔹 Fetch Firestore data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsSnap, formsSnap, usersSnap, calculatorformsSnap ,clientsSnap] = await Promise.all([
          getDocs(collection(db, "blogs")),
          getDocs(collection(db, "careerApplications")),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "calculatorApplications")),
          getDocs(collection(db, "clientApplications")),
          
        ]);

        setBlogs(blogsSnap.docs.map((d) => d.data()));
        setCareerForms(formsSnap.docs.map((d) => d.data()));
        setUsers(usersSnap.docs.map((d) => d.data()));
        setFormsData(calculatorformsSnap.docs.map((d) => d.data()));
        setClientsData(clientsSnap.docs.map((d) => d.data()));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);


// ✅ Blogs per date using scheduledAt (NOT postedAt)
const blogsData = Object.values(
  blogs.reduce(
    (acc: Record<string, { name: string; value: number }>, blog) => {
      const ts = blog.scheduledAt || blog.postedAt; 
      // ✅ fallback only if old blogs still have postedAt

      if (!ts?.seconds) return acc;

      const date = new Date(ts.seconds * 1000).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      );

      if (!acc[date]) acc[date] = { name: date, value: 0 };
      acc[date].value += 1;

      return acc;
    },
    {}
  )
).sort(
  (a: any, b: any) =>
    new Date(a.name).getTime() - new Date(b.name).getTime()
);

// clients data 
const clientsData = Object.values(
  ClientsData.reduce(
    (acc: Record<string, { name: string; value: number }>, client) => {

      // ✅ correct field for clientApplications
      if (!client.createdAt?.seconds) return acc;

      const date = new Date(
        client.createdAt.seconds * 1000
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!acc[date]) acc[date] = { name: date, value: 0 };
      acc[date].value += 1;

      return acc;
    },
    {}
  )
).sort(
  (a: any, b: any) =>
    new Date(a.name).getTime() - new Date(b.name).getTime()
);




  // 🔸 Users by Role


  const usersPieData = [
  { name: "Admins", value: adminCount },
  { name: "Users", value: userCount },
];


  // 🔸 Career Form Submissions by Date
  const formsLineData = Object.values(
    careerForms.reduce(
      (acc: Record<string, { name: string; value: number }>, form) => {
        if (!form.createdAt?.seconds) return acc;
        const date = new Date(form.createdAt.seconds * 1000).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" }
        );
        if (!acc[date]) acc[date] = { name: date, value: 0 };
        acc[date].value += 1;
        return acc;
      },
      {}
    )
  );

  const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#eab308",
    "#ef4444",
    "#8b5cf6",
    "#f97316",
    "#0ea5e9",
  ];

  return (
    <div className="p-8 bg-white rounded-lg shadow text-black">
      <h3 className="text-2xl font-semibold mb-4">Welcome, Admin!</h3>
      {/* <p className="text-gray-600 mb-8">
        Overview of Blogs, Career Applications, and Users
      </p> */}

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* 🟦 Blogs (Bar Chart by Date) */}
          <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg">
            <h4 className="text-xl font-semibold mb-4">Blogs </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={blogsData}>
                <XAxis dataKey="name" stroke="black" />
                <YAxis stroke="black" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1D1D1B",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.1)" }}
                />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 🟩 Users (Pie Chart) */}
          <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg">
            <h4 className="text-xl font-semibold mb-4">Users</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usersPieData}
                  dataKey="value"
                  outerRadius={100}
                  label={(entry) => entry.name}
                >
                  {usersPieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1D1D1B",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.1)" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 🟧 Career Forms (Line Chart) */}
          <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg col-span-1 md:col-span-2">
            <h4 className="text-xl font-semibold mb-4">Career Form Submissions</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formsLineData}>
                <XAxis dataKey="name" stroke="black" />
                <YAxis stroke="black" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1D1D1B",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>


                  {/* Calculator data */}
            {/* <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="grid grid-cols-1 md:grid-cols-2 gap-8"
  > */}
    
{/* Routes Distribution (Top Right) */}
<div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg">
  <h4 className="text-xl font-semibold mb-4 ml-5">Calculators Overview</h4>

  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={(() => {
          const serviceCounts: Record<string, number> = {};
          formsData.forEach((form) => {
            const service = form.serviceCalculator || "N/A";
            serviceCounts[service] = (serviceCounts[service] || 0) + 1;
          });

          return Object.entries(serviceCounts).map(([service, count]) => ({
            name: service,
            value: count,
          }));
        })()}
        dataKey="value"
        outerRadius={100}
        label
      >
        {formsData.map((_, index) => (
          <Cell
            key={index}
            fill={[
              "#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6",
              "#ec4899", "#14b8a6", "#f97316", "#0ea5e9", "#84cc16",
              "#f43f5e", "#6366f1", "#06b6d4", "#d946ef", "#f59e0b",
              "#10b981", "#4b5563", "#71717a", "#a855f7", "#f87171"
            ][index % 20]}
          />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: "#1D1D1B",
          border: "none",
          borderRadius: "0.5rem",
          color: "#fff",
          textTransform: "capitalize",
        }}
        itemStyle={{ color: "#fff" ,textTransform: "capitalize", }}
        cursor={{ fill: "rgba(255,255,255,0.1)" }}
      />
      <Legend wrapperStyle={{
          textTransform: "capitalize",   // 🔹 Legend capitalized
        }} />
    </PieChart>
  </ResponsiveContainer>
</div>

{/* 🟦 clients applications data  (Bar Chart by Date) */}
          <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg">
            <h4 className="text-xl font-semibold mb-4">Clients Form Submissions </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientsData}>
                <XAxis dataKey="name" stroke="black" />
                <YAxis stroke="black" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1D1D1B",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.1)" }}
                />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
 

 {/* Form Submissions (Bottom, Full Width, Area Chart) */}
<div className=" text-black bg-[#ffffff] p-2 rounded-2xl shadow-lg  col-span-1 md:col-span-2">
  <h4 className="text-xl font-semibold mb-4 ml-5">Calculator Form Submissions</h4>
  <ResponsiveContainer width="100%" height={300}>
<AreaChart
  data={Object.values(
    formsData.reduce(
      (acc: Record<string, { name: string; submissions: number }>, f) => {

        // ✅ guard (VERY IMPORTANT)
        if (!f.createdAt?.seconds) return acc;

        const date = format(
          new Date(f.createdAt.seconds * 1000),
          "MMM dd"
        );

        if (!acc[date]) {
          acc[date] = { name: date, submissions: 0 };
        }

        acc[date].submissions += 1;
        return acc;
      },
      {}
    )
  )}
>


      
      <defs>
        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
      </defs>
      <XAxis dataKey="name" stroke="black" />
       <YAxis stroke="black" />
     <Tooltip
        contentStyle={{
          backgroundColor: "#1D1D1B", // dark tooltip background
          border: "none",
          borderRadius: "0.5rem",
          color: "#fff"
        }}
        itemStyle={{ color: "#fff" }} // tooltip text color
        cursor={{ fill: "rgba(255,255,255,0.1)" }} // soft hover cursor
      />
      <Area
        type="monotone"
        dataKey="submissions"
        stroke="#3b82f6"
        strokeWidth={2}
        fillOpacity={1}
        fill="url(#colorSubmissions)"
      />
    </AreaChart>
  </ResponsiveContainer>
</div>

  {/* </motion.div> */}
        </motion.div>
      )}
    </div>
  );
}















// "use client";

// import React, { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import { collection, getDocs } from "firebase/firestore";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Area,
//   AreaChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
// } from "recharts";
// import { DateRange } from "react-date-range";
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";
// import {
//   startOfDay,
//   endOfDay,
//   subDays,
//   subMonths,
//   subYears,
//   differenceInMonths,
//   isWithinInterval,
// } from "date-fns";
// import { motion } from "framer-motion";
// import CalculatorForm from './CalculatorForm';
// import { format } from "date-fns"; 

// export default function AdminDashboard() {
//   const [blogs, setBlogs] = useState<any[]>([]);
//   const [careerForms, setCareerForms] = useState<any[]>([]);
//   const [users, setUsers] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [formsData, setFormsData] = useState<any[]>([]);
//   const [ClientsData, setClientsData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const adminCount = users.filter(u => u.role === "admin").length;
//   const userCount = users.filter(u => u.role === "user").length;
//   const [filterType, setFilterType] = useState("all");
//   const [open, setOpen] = useState(false);
//   // const calculatorAreaData = groupByDate(formsData, "createdAt", "submissions");



//   const [dateRange, setDateRange] = useState<any[]>([
//   {
//     startDate: startOfDay(subMonths(new Date(), 1)),
//     endDate: endOfDay(new Date()),
//     key: "selection",
//   },
//   ]);






// const groupByDate = (
//   data: any[],
//   dateField: string,
//   valueKey: string = "value"
// ) => {
//   if (!data?.length) return [];

//  const extractDate = (item: any) => {
//   const tsObj =
//     item[dateField] ||
//     item.scheduledAt ||
//     item.postedAt;

//   if (!tsObj) return null;

//   // 🔥 Case 1: Firestore Timestamp
//   if (tsObj.seconds) {
//     return new Date(tsObj.seconds * 1000);
//   }

//   // 🔥 Case 2: JS Date
//   if (tsObj instanceof Date) {
//     return tsObj;
//   }

//   // 🔥 Case 3: ISO String
//   if (typeof tsObj === "string") {
//     return new Date(tsObj);
//   }

//   return null;
// };

//   let workingData = [...data];

//   // 🔥 If NOT "all", apply filtering
//   if (filterType !== "all") {
//     const { start, end } = getSelectedRange();

//     workingData = data.filter((item) => {
//       const date = extractDate(item);
//       if (!date) return false;
//       return isWithinInterval(date, { start, end });
//     });

//     // 🔥 Fallback logic only when filtering
//     if (workingData.length === 0) {
//       const allDates = data
//         .map(extractDate)
//         .filter(Boolean) as Date[];

//       if (allDates.length === 0) return [];

//       const nearest = allDates.reduce((prev, curr) =>
//         Math.abs(curr.getTime() - end.getTime()) <
//         Math.abs(prev.getTime() - end.getTime())
//           ? curr
//           : prev
//       );

//       const fallbackStart = startOfDay(subDays(nearest, 3));
//       const fallbackEnd = endOfDay(subDays(nearest, -3));

//       workingData = data.filter((item) => {
//         const date = extractDate(item);
//         if (!date) return false;
//         return isWithinInterval(date, {
//           start: fallbackStart,
//           end: fallbackEnd,
//         });
//       });
//     }
//   }

//   // 🔥 Decide grouping logic
//   let groupByMonth = false;

//   if (filterType === "all") {
//     groupByMonth = true; // all data → monthly grouping
//   } else {
//     const { start, end } = getSelectedRange();
//     const monthDiff = differenceInMonths(end, start);
//     groupByMonth = monthDiff >= 3;
//   }

//   const result: any = {};

//   workingData.forEach((item) => {
//     const date = extractDate(item);
//     if (!date) return;

//     const label = groupByMonth
//       ? format(date, "MMM yyyy")
//       : format(date, "MMM dd");

//     if (!result[label]) {
//       result[label] = {
//         name: label,
//         [valueKey]: 0,
//         ts: date.getTime(),
//       };
//     }

//     result[label][valueKey] += 1;
//   });

//   return Object.values(result).sort(
//     (a: any, b: any) => a.ts - b.ts
//   );
// };




//   // const blogsData = groupByDate(blogs, "scheduledAt");
//   // const formsLineData = groupByDate(careerForms, "createdAt");

// const getSelectedRange = () => {
//   const today = new Date();

//   switch (filterType) {
//     case "today":
//       return { start: startOfDay(today), end: endOfDay(today) };

//     case "yesterday":
//       const y = subDays(today, 1);
//       return { start: startOfDay(y), end: endOfDay(y) };

//     case "last_week":
//       return {
//         start: startOfDay(subDays(today, 7)),
//         end: endOfDay(today),
//       };

//     case "last_month":
//       return {
//         start: startOfDay(subMonths(today, 1)),
//         end: endOfDay(today),
//       };

//     case "last_year":
//       return {
//         start: startOfDay(subYears(today, 1)),
//         end: endOfDay(today),
//       };

//     case "custom":
//       return {
//         start: dateRange[0]?.startDate || startOfDay(today),
//         end: dateRange[0]?.endDate || endOfDay(today),
//       };

//     default:
//       return {
//         start: startOfDay(subMonths(today, 1)),
//         end: endOfDay(today),
//       };
//   }
// };



//   // 🔹 Fetch Firestore data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [blogsSnap, formsSnap, usersSnap, calculatorformsSnap ,clientsSnap] = await Promise.all([
//           getDocs(collection(db, "blogs")),
//           getDocs(collection(db, "careerApplications")),
//           getDocs(collection(db, "users")),
//           getDocs(collection(db, "calculatorApplications")),
//           getDocs(collection(db, "clientApplications")),
          
//         ]);

//         setBlogs(blogsSnap.docs.map((d) => d.data()));
//         setCareerForms(formsSnap.docs.map((d) => d.data()));
//         setUsers(usersSnap.docs.map((d) => d.data()));
//         setFormsData(calculatorformsSnap.docs.map((d) => d.data()));
//         setClientsData(clientsSnap.docs.map((d) => d.data()));
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, []);


// // ✅ Blogs per date using scheduledAt (NOT postedAt)
// // const blogsData = Object.values(
// //   blogs.reduce(
// //     (acc: Record<string, { name: string; value: number; ts: number }>, blog) => {
// //       const tsObj = blog.scheduledAt || blog.postedAt;
// //       if (!tsObj?.seconds) return acc;

// //       const ts = tsObj.seconds * 1000;
// //       const label = format(new Date(ts), "MMM dd");

// //       if (!acc[label]) acc[label] = { name: label, value: 0, ts };
// //       acc[label].value += 1;

// //       return acc;
// //     },
// //     {}
// //   )
// // ).sort((a: any, b: any) => a.ts - b.ts);


// // clients data 
// const clientsData = Object.values(
//   ClientsData.reduce(
//     (acc: Record<string, { name: string; value: number; ts: number }>, client) => {
//       if (!client.createdAt?.seconds) return acc;

//       const ts = client.createdAt.seconds * 1000;
//       const label = format(new Date(ts), "MMM dd");

//       if (!acc[label]) acc[label] = { name: label, value: 0, ts };
//       acc[label].value += 1;

//       return acc;
//     },
//     {}
//   )
// ).sort((a: any, b: any) => a.ts - b.ts);


//   // 🔸 Users by Role

//   const usersPieData = [
//   { name: "Admins", value: adminCount },
//   { name: "Users", value: userCount },
// ];


//   // 🔸 Career Form Submissions by Date
// // const formsLineData = Object.values(
// //   careerForms.reduce(
// //     (acc: Record<string, { name: string; value: number; ts: number }>, form) => {
// //       if (!form.createdAt?.seconds) return acc;

// //       const ts = form.createdAt.seconds * 1000;
// //       const label = format(new Date(ts), "MMM dd");

// //       if (!acc[label]) acc[label] = { name: label, value: 0, ts };
// //       acc[label].value += 1;

// //       return acc;
// //     },
// //     {}
// //   )
// // ).sort((a: any, b: any) => a.ts - b.ts);


//   const COLORS = [
//     "#3b82f6",
//     "#22c55e",
//     "#eab308",
//     "#ef4444",
//     "#8b5cf6",
//     "#f97316",
//     "#0ea5e9",
//   ];

 



// const blogsData = groupByDate(blogs, "scheduledAt");
// const clientsChartData = groupByDate(ClientsData, "createdAt");
// const formsLineData = groupByDate(careerForms, "createdAt");
// // const calculatorAreaData = groupByDate(formsData, "createdAt", "submissions");


// const calculatorAreaData = (() => {
//   if (!formsData || formsData.length === 0) return [];

//   const result: Record<
//     string,
//     { name: string; submissions: number; ts: number }
//   > = {};

//   formsData.forEach((form) => {
//     if (!form.createdAt) return;

//     let date: Date | null = null;

//     // Firestore Timestamp
//     if (form.createdAt?.seconds) {
//       date = new Date(form.createdAt.seconds * 1000);
//     }

//     // JS Date
//     else if (form.createdAt instanceof Date) {
//       date = form.createdAt;
//     }

//     // String
//     else if (typeof form.createdAt === "string") {
//       date = new Date(form.createdAt);
//     }

//     if (!date || isNaN(date.getTime())) return;

//     const label =
//       filterType === "all"
//         ? format(date, "MMM yyyy")
//         : format(date, "MMM dd");

//     if (!result[label]) {
//       result[label] = {
//         name: label,
//         submissions: 0,
//         ts: date.getTime(),
//       };
//     }

//     result[label].submissions += 1;
//   });

//   return Object.values(result).sort((a, b) => a.ts - b.ts);
// })();

//   function extractDate(f: any) {
//     throw new Error("Function not implemented.");
//   }


//   const calculatorsPieData = (() => {
//   const serviceCounts: Record<string, number> = {};

//   formsData.forEach((form) => {
//     const service = form.serviceCalculator || "N/A";
//     serviceCounts[service] = (serviceCounts[service] || 0) + 1;
//   });

//   return Object.entries(serviceCounts).map(([name, value]) => ({
//     name,
//     value,
//   }));
// })();


//   return (
//     <div className="z-[10] p-8 bg-white rounded-lg shadow text-black">
//       <h3 className="text-2xl font-semibold mb-4">Welcome, Admin!</h3>


//       <div className="flex items-center gap-4 mb-6 relative">

//   <select
//     value={filterType}
//     onChange={(e) => {
//       setFilterType(e.target.value);
//       if (e.target.value !== "custom") setOpen(false);
//     }}
//     className="border px-4 py-2 rounded-lg"
//   >
//      <option value="all">All</option>
//     <option value="today">Today</option>
//     <option value="yesterday">Yesterday</option>
//     <option value="last_week">Last Week</option>
//     <option value="last_month">Last Month</option>
//     <option value="last_year">Last Year</option>
//     <option value="custom">Custom</option>
//   </select>

//   {filterType === "custom" && (
//     <button
//       onClick={() => setOpen(!open)}
//       className="border px-4 py-2 rounded-lg bg-gray-100"
//     >
//       Select Date
//     </button>
//   )}

//   {open && (
//     <div className="absolute top-14 z-50 bg-white shadow-lg rounded-lg">
//       <DateRange
//         editableDateInputs
//         moveRangeOnFirstSelection={false}
//         ranges={dateRange}
//         onChange={(item: any) => {
//           if (item.selection) {
//             setDateRange([item.selection]);
//           }
//         }}
//       />
//     </div>
//   )}
// </div>
//       {/* <p className="text-gray-600 mb-8">
//         Overview of Blogs, Career Applications, and Users
//       </p> */}

//       {!isLoading && (
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="grid grid-cols-1 md:grid-cols-2 gap-8"
//         >
//           {/* 🟦 Blogs (Bar Chart by Date) */}
//           <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg">
//             <h4 className="text-xl font-semibold mb-4">Blogs </h4>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={blogsData}>
//                 <XAxis dataKey="name" stroke="black" />
//                 <YAxis stroke="black" />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "#1D1D1B",
//                     border: "none",
//                     borderRadius: "0.5rem",
//                     color: "#fff",
//                   }}
//                   itemStyle={{ color: "#fff" }}
//                   cursor={{ fill: "rgba(255,255,255,0.1)" }}
//                 />
//                 <Legend />
//                 <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* 🟩 Users (Pie Chart) */}
//           <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg">
//             <h4 className="text-xl font-semibold mb-4">Users</h4>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={usersPieData}
//                   dataKey="value"
//                   outerRadius={100}
//                   label={(entry) => entry.name}
//                 >
//                   {usersPieData.map((_, index) => (
//                     <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "#1D1D1B",
//                     border: "none",
//                     borderRadius: "0.5rem",
//                     color: "#fff",
//                   }}
//                   itemStyle={{ color: "#fff" }}
//                   cursor={{ fill: "rgba(255,255,255,0.1)" }}
//                 />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           {/* 🟧 Career Forms (Line Chart) */}
//           <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg col-span-1 md:col-span-2">
//             <h4 className="text-xl font-semibold mb-4">Career Form Submissions</h4>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={formsLineData}>
//                 <XAxis dataKey="name" stroke="black" />
//                 <YAxis stroke="black" />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "#1D1D1B",
//                     border: "none",
//                     borderRadius: "0.5rem",
//                     color: "#fff",
//                   }}
//                 />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey="value"
//                   stroke="#3b82f6"
//                   strokeWidth={2}
//                   dot={{ r: 4 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>


//                   {/* Calculator data */}
//             {/* <motion.div
//     initial={{ opacity: 0, y: 30 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.6 }}
//     className="grid grid-cols-1 md:grid-cols-2 gap-8"
//   > */}
    
// {/* Routes Distribution (Top Right) */}
// <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg">
//   <h4 className="text-xl font-semibold mb-4 ml-5">Calculators Overview</h4>

//   <ResponsiveContainer width="100%" height={300}>
//     <PieChart>
//       <Pie
//   data={calculatorsPieData}
//   dataKey="value"
//   nameKey="name"
//   outerRadius={100}
//   label
// >
//   {calculatorsPieData.map((_, index) => (
//     <Cell
//       key={index}
//       fill={COLORS[index % COLORS.length]}
//     />
//   ))}
// </Pie>
//       <Tooltip
//         contentStyle={{
//           backgroundColor: "#1D1D1B",
//           border: "none",
//           borderRadius: "0.5rem",
//           color: "#fff",
//           textTransform: "capitalize",
//         }}
//         itemStyle={{ color: "#fff" ,textTransform: "capitalize", }}
//         cursor={{ fill: "rgba(255,255,255,0.1)" }}
//       />
//       <Legend wrapperStyle={{
//           textTransform: "capitalize",   // 🔹 Legend capitalized
//         }} />
//     </PieChart>
//   </ResponsiveContainer>
// </div>

// {/* 🟦 clients applications data  (Bar Chart by Date) */}
//           <div className="bg-[#ffffff] p-5 rounded-2xl shadow-lg">
//             <h4 className="text-xl font-semibold mb-4">Clients Form Submissions </h4>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={clientsChartData}>
//                 <XAxis dataKey="name" stroke="black" />
//                 <YAxis stroke="black" />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "#1D1D1B",
//                     border: "none",
//                     borderRadius: "0.5rem",
//                     color: "#fff",
//                   }}
//                   itemStyle={{ color: "#fff" }}
//                   cursor={{ fill: "rgba(255,255,255,0.1)" }}
//                 />
//                 <Legend />
//                 <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
 

//  {/* Form Submissions (Bottom, Full Width, Area Chart) */}
// <div className=" text-black bg-[#ffffff] p-2 rounded-2xl shadow-lg  col-span-1 md:col-span-2">
//   <h4 className="text-xl font-semibold mb-4 ml-5">Calculator Form Submissions</h4>
//   <ResponsiveContainer width="100%" height={300}>
// <AreaChart
// data={calculatorAreaData}
// >


      
//       <defs>
//         <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
//           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
//           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
//         </linearGradient>
//       </defs>
//       <XAxis dataKey="name" stroke="black" />
//        <YAxis stroke="black" />
//      <Tooltip
//         contentStyle={{
//           backgroundColor: "#1D1D1B", // dark tooltip background
//           border: "none",
//           borderRadius: "0.5rem",
//           color: "#fff"
//         }}
//         itemStyle={{ color: "#fff" }} // tooltip text color
//         cursor={{ fill: "rgba(255,255,255,0.1)" }} // soft hover cursor
//       />
//       <Area
//         type="monotone"
//         dataKey="submissions"
//         stroke="#3b82f6"
//         strokeWidth={2}
//         fillOpacity={1}
//         fill="url(#colorSubmissions)"
//       />
//     </AreaChart>
//   </ResponsiveContainer>
// </div>

//   {/* </motion.div> */}
//         </motion.div>
//       )}
//     </div>
//   );
// }
