"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
export function LoginForm(){
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const router=useRouter();
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");setLoading(true);
    try{
      const res=await fetch("/api/admin/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password}),cache:"no-store"});
      const data=await res.json().catch(()=>({}));
      if(!res.ok){setError(typeof data.error==="string"?data.error:"No se pudo iniciar sesión.");return;}
      router.replace("/admin/productos");router.refresh();
    }catch{setError("No se pudo conectar con el servidor.");}
    finally{setLoading(false);}
  }
  return <form className="admin-panel admin-form" onSubmit={submit}>
    <div className="admin-field admin-full"><label htmlFor="password">Contraseña administrativa</label><input id="password" type="password" autoComplete="current-password" minLength={14} maxLength={512} value={password} onChange={e=>setPassword(e.target.value)} required/></div>
    {error&&<p className="admin-error admin-full" role="alert">{error}</p>}
    <div className="admin-actions admin-full"><button className="button" type="submit" disabled={loading}>{loading?"Validando…":"Iniciar sesión ↗"}</button></div>
  </form>
}
