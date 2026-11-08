import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { dashboard } from "../lib/api";
import Chat from "../components/Chat";
import BrandMark from "../components/BrandMark";

export default function Today({ navigate }) {
 const [data, setData] = useState(null);
 const [error, setError] = useState(false);
 async function load() {
   try { setData(await dashboard()); setError(false); }
   catch { setError(true); }
 }
 useEffect(() => { load(); }, []);
 const hour = new Date().getHours();
 const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
 return <>
   <header className="home-header"><div><p className="eye">YOUR DAY, A LITTLE LIGHTER</p><h1>{greeting}.</h1><p className="muted">You do the work. Let’s make the admin easier.</p></div><BrandMark className="home-brand"/></header>
   <Chat onRecordsChange={load} onSettings={() => navigate?.('settings')}/>
   <section className="attention-section" aria-label="Business overview">
     <div className="section-heading"><div><p className="eye">AT A GLANCE</p><h2>A little clarity for your day.</h2></div><span>Live business records</span></div>
     {error && <p role="alert" className="load-error">We couldn’t load your business overview. <button onClick={load}>Try again</button></p>}
     <div className="stats">{[['Jobs',data?.jobs,'jobs'],['Unpaid invoices',data?.unpaidInvoices,'money'],['Overdue invoices',data?.overdueInvoices,'money'],['Quotes',data?.quotes,'money']].map(([label,count,page]) => <button className="stat-card" key={label} onClick={() => navigate?.(page)}><span>{label}<ArrowUpRight size={17}/></span><b>{count ?? '—'}</b><small>View records</small></button>)}</div>
     {data && <div className="day-note"><span className="note-icon" aria-hidden="true">✦</span><div><h3>{data.overdueInvoices || data.completedNotInvoiced ? 'A couple of things to keep an eye on.' : 'A clear view of where things stand.'}</h3><p>{data.overdueInvoices} overdue invoices · {data.completedNotInvoiced} completed jobs not invoiced · {data.quotes} quotes.</p></div></div>}
   </section>
 </>;
}
