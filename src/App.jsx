import React, { useState } from "react";
import Landing from "./pages/Landing";
import AuthGate from "./components/AuthGate";
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
        <AuthGate><Admin /></AuthGate>
      </main>
    );
  }

  if (window.location.pathname === "/" || window.location.pathname === "/landing") {
    return <Landing />;
  }

  const pages = {
    today: <Today />,
    jobs: <Jobs />,
    customers: <Customers />,
    money: <Money />,
    settings: <Settings />,
  };

  return (
    <AuthGate>
      <main className="shell">
        {pages[p] || <Today />}
      </main>

      <Nav p={p} set={setP} />
    </AuthGate>
  );
}
