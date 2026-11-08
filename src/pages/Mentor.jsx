import React,{useEffect,useState} from 'react';
import {ArrowRight,CheckCircle2,Compass,BookOpen} from 'lucide-react';
import {api} from '../lib/api';
import Chat from '../components/Chat';
const blank={idea:'',skills:'',location:'',budget:null,hours:null,stage:'exploring',risk:'unsure'};
function Milestone({module,record,onSaved}) {
 const [notes,setNotes]=useState(record?.notes||'');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>setNotes(record?.notes||''),[record?.id,record?.version]);
 async function save(completed) {
  setBusy(true);setMessage('');
  try{const row=await api('/api/mentor/progress/'+module.id,{method:'PUT',body:JSON.stringify({notes,completed,version:record?.version||0})});onSaved(row);setMessage(completed?'Milestone completed. Your next step is ready.':'Notes saved. Come back whenever you’re ready.');}
  catch(error){setMessage(error.message||'Could not save. Your notes are still here.');}finally{setBusy(false);}
 }
 return <article className="milestone-detail card"><span className="eyebrow">YOUR NEXT PRACTICAL STEP</span><h2>{module.title}</h2><p className="milestone-outcome">{module.outcome}</p><p>{module.lesson}</p>
  <div className="exercise-box"><h3>Your exercise</h3><p>{module.exercise}</p><label htmlFor={'milestone-'+module.id}>Your notes and evidence</label><textarea id={'milestone-'+module.id} rows={6} maxLength={5000} value={notes} onChange={event=>setNotes(event.target.value)} placeholder="Start with a few notes. You can save and return later."/></div>
  <div className="draft-actions"><button disabled={busy} onClick={()=>save(record?.completed||false)}>Save notes</button><button disabled={busy||(!record?.completed&&!notes.trim())} onClick={()=>save(!record?.completed)}>{record?.completed?'Reopen milestone':'Mark milestone complete'}</button></div>
  {message&&<p role="status">{message}</p>}
  <p><b>Then:</b> {module.next}</p>
  {module.links.length>0&&<div className="mentor-links">{module.links.map(link=><a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.title} ↗</a>)}</div>}
 </article>;
}
function PricingSketch() {
 const [values,setValues]=useState({materials:'',hours:'',hourly:'',overheads:''});
 const hasValues=Object.values(values).some(value=>value!=='');
 const total=Math.round(((Number(values.materials)||0)+(Number(values.hours)||0)*(Number(values.hourly)||0)+(Number(values.overheads)||0))*100)/100;
 return <section className="card pricing-sketch"><h3>Try a price estimate</h3><p>A rough starting point for one job, before tax, VAT or a profit allowance.</p><div className="profile-grid">{[['materials','Materials (£)'],['hours','Hours for the job'],['hourly','Value of an hour of your time (£)'],['overheads','Overhead allowance (£)']].map(([key,label])=><label key={key}>{label}<input type="number" min="0" step="0.01" value={values[key]} onChange={event=>setValues({...values,[key]:event.target.value})}/></label>)}</div><p className="price-estimate">{hasValues?'Illustrative cost base: £'+total.toFixed(2):'Add estimates to explore a starting cost.'}</p><small>Not a market price or guaranteed margin. Copy useful estimates into your milestone notes to keep them.</small></section>;
}
export default function Mentor({onTrade,onSettings}) {
 const [state,setState]=useState(null),[profile,setProfile]=useState(blank),[selected,setSelected]=useState('direction');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[tab,setTab]=useState('plan');
 async function load(){try{const result=await api('/api/mentor');setState(result);setProfile({...blank,...result.profile?.data});setSelected(result.modules.find(m=>!result.progress.some(p=>p.milestone===m.id&&p.completed))?.id||result.modules[0].id);setMessage('');}catch{setMessage('Your plan could not be loaded. Please retry.');}}
 useEffect(()=>{load();},[]);
 async function saveProfile(event){event.preventDefault();setBusy(true);setMessage('');try{const row=await api('/api/mentor/profile',{method:'PUT',body:JSON.stringify({data:profile,version:state.profile?.version||0})});setState(previous=>({...previous,profile:row}));setMessage('Your starting point is saved. You can change it as your idea develops.');}catch(error){setMessage(error.message||'Could not save your plan.');}finally{setBusy(false);}}
 const completed=state?.progress.filter(p=>p.completed).length||0;
 const current=state?.modules.find(m=>m.id===selected);
 const next=state?.modules.find(m=>!state.progress.some(p=>p.milestone===m.id&&p.completed));
 return <div className="mentor-page"><header className="mentor-hero"><span className="eyebrow"><Compass size={16}/> BUILD MY BUSINESS</span><h1>Turn “one day”<br/>into a next step.</h1><p>Build an idea around your skills, time and budget. Try small steps, keep the evidence and move at your own pace.</p><div className="mentor-hero-bottom"><span>{completed} of {state?.modules.length||6} milestones complete</span><button onClick={onTrade}>Open my business tools <ArrowRight size={16}/></button></div>{state&&<progress value={completed} max={state.modules.length} aria-label="Business-building milestone progress"/>}</header>
  <div className="mentor-tabs" role="group" aria-label="Business-building views"><button aria-pressed={tab==='plan'} onClick={()=>setTab('plan')}><BookOpen size={18}/>My action plan</button><button aria-pressed={tab==='chat'} onClick={()=>setTab('chat')}>Ask my mentor</button></div>
  {!state?<div className="card"><p role="status">{message||'Loading your plan…'}</p><button onClick={load}>Reload plan</button></div>:tab==='chat'?<Chat experience="mentor" onSettings={onSettings}/>:<>
   <section className="next-step card"><span className="eyebrow">FOCUS FOR NOW</span><h2>{next?next.title:'Review what you learned'}</h2><p>{profile.idea?'Your idea: '+profile.idea:'You can start without a business name or a finished idea.'}</p><p>{profile.hours!==null?`Plan around the ${profile.hours} hours a week you have available. `:''}{profile.budget!==null?`Keep your first experiment within your £${Number(profile.budget).toLocaleString('en-GB')} starting budget.`:''}</p>{next&&<button onClick={()=>setSelected(next.id)}>Work on this milestone <ArrowRight size={16}/></button>}</section>
   <details className="card mentor-onboarding" open={!state.profile}><summary>Your starting point <span>All fields optional</span></summary><form className="record-form" onSubmit={saveProfile}><fieldset disabled={busy}>
    <label>What business or service are you exploring?<textarea rows={2} maxLength={1000} value={profile.idea} onChange={event=>setProfile({...profile,idea:event.target.value})}/></label>
    <label>Skills and experience<textarea rows={2} maxLength={2000} value={profile.skills} onChange={event=>setProfile({...profile,skills:event.target.value})}/></label>
    <div className="profile-grid">{[['location','Your location','text'],['budget','Available startup budget (£)','number'],['hours','Hours available each week','number']].map(([key,label,type])=><label key={key}>{label}<input type={type} value={profile[key]??''} min={type==='number'?0:undefined} max={key==='hours'?168:key==='budget'?10000000:undefined} maxLength={200} onChange={event=>setProfile({...profile,[key]:type==='number'?(event.target.value===''?null:Number(event.target.value)):event.target.value})}/></label>)}</div>
    <label>Where are you now?<select value={profile.stage} onChange={event=>setProfile({...profile,stage:event.target.value})}>{[['exploring','Exploring ideas'],['employed','Employed and exploring'],['starting','Preparing to start'],['trading','Already trading']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <label>How do you feel about financial risk?<select value={profile.risk} onChange={event=>setProfile({...profile,risk:event.target.value})}>{[['unsure','Still working that out'],['cautious','Keep initial risk low'],['balanced','A measured experiment'],['comfortable','Comfortable testing with a set budget']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <button type="submit">{busy?'Saving…':'Save my starting point'}</button>
   </fieldset></form></details>
   {message&&<p role="status">{message}</p>}
   <div className="mentor-workspace"><nav className="milestone-list" aria-label="Business milestones">{state.modules.map((module,index)=>{const done=state.progress.some(p=>p.milestone===module.id&&p.completed);return <button key={module.id} aria-current={selected===module.id?'step':undefined} onClick={()=>setSelected(module.id)}><span>{done?<CheckCircle2 size={20}/>:String(index+1).padStart(2,'0')}</span><div><b>{module.title}</b><small>{done?'Completed':'Take this at your pace'}</small></div></button>;})}</nav>
    <div>{current&&<Milestone key={current.id} module={current} record={state.progress.find(p=>p.milestone===current.id)} onSaved={row=>setState(previous=>({...previous,progress:[...previous.progress.filter(p=>p.milestone!==row.milestone),row]}))}/>} {selected==='pricing'&&<PricingSketch/>}</div>
   </div>
  </>}
  <p className="mentor-boundary">Practical education, not a promise of income or professional legal, tax or financial advice. Check the rules for your work and location before acting.</p>
 </div>;
}
