import React,{useEffect,useState} from 'react';
import {list} from '../lib/api';
import AI from '../components/AI';
export default function Jobs({navigate}) {
 const [jobs,setJobs]=useState([]),[error,setError]=useState(false),[assistant,setAssistant]=useState(false);
 async function load(){try{setJobs(await list('jobs'));setError(false);}catch{setError(true);}}
 useEffect(()=>{load();},[]);
 return <div><h1>Jobs</h1><p>Keep your scheduled work in view. Start a job or quote with the assistant below.</p>
  <button className="assistant-secondary" onClick={()=>setAssistant(previous=>!previous)}>{assistant?'Close job and quote assistant':'New job or quote'}</button>
  {assistant&&<><p>Use Chat on Today for customer and invoice notes. Earlier voice reviews are also available here.</p><AI done={load} onSettings={()=>navigate?.('settings')}/></>}
  {error?<p role="alert">Jobs could not be loaded. <button onClick={load}>Try again</button></p>:jobs.length===0?<div className="card"><h3>No jobs yet</h3><p>Start with New job or quote above.</p></div>:jobs.map(job=><div className="card" key={job.id}><b>{job.customer_name||'Customer'}</b><p>{job.title}</p><p>{job.description}</p><small>{job.scheduled_for?new Date(job.scheduled_for).toLocaleString()+' · ':''}{job.status}</small></div>)}
 </div>;
}
