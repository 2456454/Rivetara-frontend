import React,{useEffect,useState} from 'react';
import {liveStatus} from '../lib/api';
import LiveVoice from './LiveVoice';
export default function LiveConversation({onSettings,onBusy,disabled}) {
 const [open,setOpen]=useState(false),[available,setAvailable]=useState(false);
 useEffect(()=>{
  if(!open)return;
  let active=true;
  liveStatus().then(result=>{if(active)setAvailable(result.available);}).catch(()=>setAvailable(false));
  return()=>{active=false;};
 },[open]);
 return <div className="optional-live"><button disabled={disabled&&!open} onClick={()=>setOpen(previous=>!previous)}>{open?'Close Live voice':'Live voice for questions'}</button>
  {open&&<LiveVoice available={available} onSettings={onSettings} onBusy={onBusy}/>}
 </div>;
}
