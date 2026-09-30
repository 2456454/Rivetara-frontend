import React, { useEffect, useState } from "react";
import { list } from "../lib/api";

export default function Jobs() {
 const [jobs, setJobs] = useState([]);

 useEffect(() => {
   let active = true;

   async function loadJobs() {
     try {
       const data = await list("jobs");

       if (active) {
         setJobs(Array.isArray(data) ? data : []);
       }
     } catch (error) {
       console.error("Failed to load jobs:", error);

       if (active) {
         setJobs([]);
       }
     }
   }

   loadJobs();

   return () => {
     active = false;
   };
 }, []);

 return (
   <div>
     <h1>Jobs</h1>

     {jobs.length === 0 ? (
       <div className="card">
         <h3>No jobs yet</h3>
         <p>Tell Rivetara when the first one comes in.</p>
       </div>
     ) : (
       jobs.map((job, index) => (
         <div className="card" key={job?.id || index}>
           <b>{job?.customer_name || "Customer"}</b>
           <small>{job?.status || ""}</small>
         </div>
       ))
     )}
   </div>
 );
}
