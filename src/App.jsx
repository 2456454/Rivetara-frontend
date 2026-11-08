import React, {useState} from 'react';
import Nav from './components/Nav';
import Account from './components/Account';
import Today from './pages/Today';
import Jobs from './pages/Jobs';
import Customers from './pages/Customers';
import Money from './pages/Money';
import Settings from './pages/Settings';
import Welcome from './pages/Welcome';

function Workspace() {
  const [page, setPage] = useState('today');
  const pages = {today: <Today navigate={setPage}/>, jobs: <Jobs/>, customers: <Customers/>, money: <Money/>, settings: <Settings/>};
  return <><main className="shell">{pages[page] || pages.today}</main><Nav p={page} set={setPage}/></>;
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
