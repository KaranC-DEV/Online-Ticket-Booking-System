import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clapperboard, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ErrorMessage } from "../components/UI";
export function Login(){
 const {login}=useAuth(),nav=useNavigate();const [form,setForm]=useState({email:"",password:""}),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 const submit=async e=>{e.preventDefault();setError("");setBusy(true);try{await login(form);nav("/");}catch(x){setError(x.message);}finally{setBusy(false);}};
 return <AuthShell title="Welcome back" subtitle="Your next movie night is waiting."><form onSubmit={submit} className="form-stack"><Field icon={<Mail/>} name="email" type="email" placeholder="Email address" value={form.email} onChange={change}/><Field icon={<LockKeyhole/>} name="password" type="password" placeholder="Password" value={form.password} onChange={change}/><ErrorMessage>{error}</ErrorMessage><button className="button button-primary button-full" disabled={busy}>{busy?"Signing in...":"Sign in"}</button></form><p className="auth-switch">New to CineBook? <Link to="/register">Create account</Link></p></AuthShell>;
}
export function Register(){
 const {register}=useAuth(),nav=useNavigate();const [form,setForm]=useState({name:"",email:"",password:""}),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 const submit=async e=>{e.preventDefault();setError("");setBusy(true);try{await register(form);nav("/login",{state:{message:"Account created. Please sign in."}});}catch(x){setError(x.message);}finally{setBusy(false);}};
 return <AuthShell title="Join the audience" subtitle="Create an account and make every movie night count."><form onSubmit={submit} className="form-stack"><Field icon={<UserRound/>} name="name" placeholder="Full name" value={form.name} onChange={change}/><Field icon={<Mail/>} name="email" type="email" placeholder="Email address" value={form.email} onChange={change}/><Field icon={<LockKeyhole/>} name="password" type="password" placeholder="Password" value={form.password} onChange={change}/><ErrorMessage>{error}</ErrorMessage><button className="button button-primary button-full" disabled={busy}>{busy?"Creating account...":"Create account"}</button></form><p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p></AuthShell>;
}
function Field({icon,...props}){return <label className="input-wrap"><span>{icon}</span><input required {...props}/></label>}
function AuthShell({title,subtitle,children}){return <div className="auth-page"><div className="auth-card"><div className="auth-logo"><Clapperboard size={25}/></div><span className="eyebrow">CINEBOOK ACCOUNT</span><h1>{title}</h1><p>{subtitle}</p>{children}</div></div>}
