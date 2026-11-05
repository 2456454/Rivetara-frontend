import React, { useState } from "react";
import Nav from "./components/Nav";
import Today from "./pages/Today";
import Jobs from "./pages/Jobs";
import Customers from "./pages/Customers";
import Money from "./pages/Money";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Welcome from "./pages/Welcome";

export default function App() {
  const admin = window.location.pathname.startsWith("/admin");
  const [p, setP] = useState("today");
  const [exploring, setExploring] = useState(false);

  if (admin) {
    return (
      <main className="shell">
        <Admin />
      </main>
    );
  }

  if (!exploring) return <Welcome onExplore={() => setExploring(true)} />;

  const pages = {
    today: <Today navigate={setP} />,
    jobs: <Jobs />,
    customers: <Customers />,
    money: <Money />,
    settings: <Settings />,
  };

  return (
    <>
      <main className="shell">
        <div className="demo-banner"><span>Development demo · Test data only</span><button onClick={() => setExploring(false)}>Back to welcome</button></div>
        {pages[p] || <Today />}
      </main>

      <Nav p={p} set={setP} />
    </>
  );
}
