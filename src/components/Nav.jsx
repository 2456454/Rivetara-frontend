import React from 'react';
import { House, BriefcaseBusiness, Users, Wallet, Settings } from 'lucide-react';

export default function Nav({p, set}) {
 return <nav className="nav" aria-label="Main navigation">
   {[['today', House, 'Today'], ['jobs', BriefcaseBusiness, 'Jobs'], ['customers', Users, 'Customers'], ['money', Wallet, 'Money'], ['settings', Settings, 'Settings']].map(([page, Icon, label]) =>
     <button className={p === page ? 'on' : ''} onClick={() => set(page)} key={page}
       aria-label={label} aria-current={p === page ? 'page' : undefined} title={label}>
       <Icon size={20} aria-hidden="true"/><span>{label}</span>
     </button>)}
 </nav>;
}
