import { AlertCircle, LoaderCircle, Search, Ticket } from "lucide-react";
export function Loading({ label = "Loading..." }) { return <div className="loading"><LoaderCircle className="spin" size={22}/>{label}</div>; }
export function ErrorMessage({ children }) { return children ? <div className="alert alert-error"><AlertCircle size={17}/>{children}</div> : null; }
export function Empty({ title = "Nothing here yet", detail = "Try again later." }) { return <div className="empty"><Ticket size={28}/><h3>{title}</h3><p>{detail}</p></div>; }
export function SearchBox({ value, onChange, placeholder = "Search movies..." }) { return <label className="search-box"><Search size={18}/><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/></label>; }
export function SectionHeading({ eyebrow, title, action }) { return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>; }