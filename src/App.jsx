Import React, { useState } from "react";
import Nav from "./components/Nav";
import Today from "./pages/Today";
import Jobs from "./pages/Jobs";
import Customers from "./pages/Customers";
import Money from "./pages/Money";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";

export default function App() {
  const admin = window.location.pathname.startsWith("/admin");
  const [p, setP] = useState("today");

  if (admin) {
    return (
      <main className="shell">
        <Admin />
      </main>
    );
  }

  const pages = {
    today: <Today />,
    jobs: <Jobs />,
    customers: <Customers />,
    money: <Money />,
    settings: <Settings />,
  };

  return (
    <>
      <main className="shell">
        {pages[p] || <Today />}
      </main>

      <Nav p={p} set={setP} />
    </>
  );
}
