import React, { useEffect, useState } from "react";
import { authClient } from "../lib/auth";
import Login from "../pages/Login";
export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(authClient));
  useEffect(() => {
    if (!authClient) return;
    let active = true;
    const check = () => authClient.auth.getUser().then(({data,error}) => {
      if (active) { setUser(!error && data.user?.email_confirmed_at ? data.user : null); setLoading(false); }
    }).catch(() => { if (active) { setUser(null); setLoading(false); } });
    check();
    const {data:{subscription}} = authClient.auth.onAuthStateChange(()=>{setTimeout(check,0);});
    return ()=>{active=false;subscription.unsubscribe();};
  }, []);
  if (loading) return <main className="login-page" role="status">Checking your sign-in…</main>;
  if (!user) return <Login onSignedIn={setUser} />;
  return <><div className="login-session"><button onClick={async()=>{setUser(null);await authClient.auth.signOut();}}>Sign out</button></div>{children}</>;
}
