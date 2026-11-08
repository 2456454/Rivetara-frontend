import React, {useState} from 'react';
import Nav from './components/Nav';
import Account from './components/Account';
import Today from './pages/Today';
import Jobs from './pages/Jobs';
import Customers from './pages/Customers';
import Money from './pages/Money';
import Mentor from './pages/Mentor';
import Settings from './pages/Settings';
import Welcome from './pages/Welcome';

function Workspace() {
  const [experience, setExperience] = useState('trade');
  const [page, setPage] = useState('today');
  const pages = {today: <Today navigate={setPage}/>, jobs: <Jobs navigate={setPage}/>, customers: <Customers/>, money: <Money/>, settings: <Settings/>};
  return <><main className="shell"><div className="experience-switch" role="group" aria-label="Choose your experience"><button aria-pressed={experience==='trade'} onClick={()=>setExperience('trade')}>Run my business</button><button aria-pressed={experience==='mentor'} onClick={()=>setExperience('mentor')}>Build my business</button></div>
    {experience==='mentor'?<Mentor onTrade={()=>setExperience('trade')} onSettings={()=>{setExperience('trade');setPage('settings');}}/>:pages[page]||pages.today}
    </main>{experience==='trade'&&<Nav p={page} set={setPage}/>}</>;
}
export default function App() {
  const [screen, setScreen] = useState('welcome');
  if (screen === 'account') return <Account onBack={() => setScreen('welcome')}>{tenant => <Workspace key={tenant}/>}</Account>;
  if (screen === 'demo') return <main className="shell"><div className="card">
    <h1>A look inside Rivetara</h1><p>Illustrative examples only. These are not saved business records.</p>
    <h2>Today</h2><p>Kitchen repair · Tomorrow at 9 am</p>
    <h2>Customers</h2><p>Alex Taylor · Example customer</p>
    <h2>Voice to job</h2><p>Speak or type → review the proposed details → confirm to save.</p>
    <button onClick={() => setScreen('account')}>Sign in to your business</button>
    <button onClick={() => setScreen('welcome')}>Back to welcome</button>
  </div></main>;
  return <Welcome onExplore={() => setScreen('demo')} onSignIn={() => setScreen('account')}/>;
}
