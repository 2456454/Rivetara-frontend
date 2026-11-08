import React, { useEffect, useState } from "react";
import { list } from "../lib/api";

export default function Jobs() {
 const [error, setError] = useState(false);
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
       setError(true);

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

     {error ? <p role="alert">Jobs could not be loaded. Please return to this page to retry.</p> : jobs.length === 0 ? (
       <div className="card">
         <h3>No jobs yet</h3>
         <p>Tell Rivetara when the first one comes in.</p>
       </div>
     ) : (
       jobs.map((job, index) => (
         <div className="card" key={job?.id || index}>
           <b>{job?.customer_name || "Customer"}</b>
           <p>{job.title}</p><p>{job.description}</p><small>{job.scheduled_for ? new Date(job.scheduled_for).toLocaleString() + " · " : ""}{job?.status || ""}</small>
         </div>
       ))
     )}
   </div>
 );
}
