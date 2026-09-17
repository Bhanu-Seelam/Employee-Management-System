import React, { useEffect, useMemo, useState } from "react";
import {
  Users, Building2, Wallet, UserCheck, Search, Plus, Eye, Edit3,
  Trash2, X, BriefcaseBusiness, LayoutDashboard, ChevronRight
} from "lucide-react";
import api from "./api";

const emptyForm = {name:"",email:"",department:"",position:"",salary:""};
const money = v => `₹${Number(v||0).toLocaleString("en-IN",{maximumFractionDigits:0})}`;

function App() {
  const [page,setPage]=useState("dashboard");
  const [employees,setEmployees]=useState([]);
  const [stats,setStats]=useState({totalEmployees:0,departments:0,annualPayroll:0,activeEmployees:0});
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState(emptyForm);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);

  const loadEmployees=async()=>{
    try{
      setLoading(true);
      const r=await api.get("/employees",{params:search.trim()?{search:search.trim()}:{}});
      setEmployees(Array.isArray(r.data)?r.data:[]);
      setError("");
    }catch(e){setError(e.response?.data?.message||"Unable to load employees");}
    finally{setLoading(false);}
  };
  const loadStats=async()=>{
    try{const r=await api.get("/dashboard/stats");setStats(r.data);}
    catch(e){console.error(e);}
  };
  useEffect(()=>{loadEmployees()},[search]);
  useEffect(()=>{loadStats()},[employees.length]);

  const departments=useMemo(()=>{
    const m=new Map();
    employees.forEach(e=>{
      const name=e.department||"Unassigned";
      const d=m.get(name)||{name,count:0,payroll:0};
      d.count++; d.payroll+=Number(e.salary||0); m.set(name,d);
    });
    return [...m.values()].sort((a,b)=>b.count-a.count);
  },[employees]);

  const openAdd=()=>{setError("");setForm(emptyForm);setModal({type:"form"});};
  const openEdit=e=>{setError("");setForm({
    name:e.name||"",email:e.email||"",department:e.department||"",
    position:e.position||"",salary:e.salary??""
  });setModal({type:"form",employee:e});};

  const save=async ev=>{
    ev.preventDefault();setError("");
    try{
      const payload={name:form.name.trim(),email:form.email.trim(),department:form.department.trim(),
        position:form.position.trim(),salary:Number(form.salary)};
      if(modal.employee) await api.put(`/employees/${modal.employee.id}`,payload);
      else await api.post("/employees",payload);
      setModal(null);setForm(emptyForm);await loadEmployees();await loadStats();
    }catch(e){setError(e.response?.data?.message||"Unable to save employee");}
  };

  const remove=async id=>{
    if(!confirm("Delete this employee?"))return;
    try{await api.delete(`/employees/${id}`);await loadEmployees();await loadStats();}
    catch(e){setError(e.response?.data?.message||"Unable to delete employee");}
  };

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><BriefcaseBusiness size={21}/></div>
        <div><h2>EmployeeHub</h2><span>Management System</span></div></div>
      <nav>
        <button className={`nav-item ${page==="dashboard"?"active":""}`} onClick={()=>setPage("dashboard")}><LayoutDashboard/>Dashboard</button>
        <button className={`nav-item ${page==="employees"?"active":""}`} onClick={()=>setPage("employees")}><Users/>Employees</button>
        <button className={`nav-item ${page==="departments"?"active":""}`} onClick={()=>setPage("departments")}><Building2/>Departments</button>
      </nav>
      <div className="sidebar-footer"><span>Employee Management</span><small>Spring Boot + React</small></div>
    </aside>

    <main className="main">
      <header className="topbar"><div><h1>{page==="dashboard"?"Dashboard":page==="employees"?"Employees":"Departments"}</h1>
        <p>Manage your organization's employees</p></div>
        <button className="primary-btn" onClick={openAdd}><Plus/>Add Employee</button>
      </header>

      <div className="content">
        {error&&<div className="error-banner">{error}<button onClick={()=>setError("")}><X/></button></div>}

        {page==="dashboard"&&<>
          <section className="hero"><div><p className="eyebrow light">EMPLOYEE MANAGEMENT</p>
            <h2>Welcome to EmployeeHub</h2><p>Manage your people, departments and payroll from one place.</p>
          </div><button className="primary-btn" onClick={openAdd}><Plus/>Add Employee</button></section>
          <Stats stats={stats}/>
          <section className="panel"><div className="panel-head"><div><h3>Employee Directory</h3><p>View and manage employee information</p></div>
            <button className="text-link" onClick={()=>setPage("employees")}>View all <ChevronRight/></button></div>
            <EmployeeTable employees={employees.slice(0,8)} loading={loading} onView={e=>setModal({type:"view",employee:e})} onEdit={openEdit} onDelete={remove}/>
          </section>
        </>}

        {page==="employees"&&<>
          <div className="page-heading"><div><p className="eyebrow">PEOPLE</p><h2>Employee Directory</h2><p>View and manage all employees.</p></div></div>
          <div className="toolbar"><div className="search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employees..."/></div>
            <span>{employees.length} employee{employees.length===1?"":"s"}</span></div>
          <section className="panel"><EmployeeTable employees={employees} loading={loading} onView={e=>setModal({type:"view",employee:e})} onEdit={openEdit} onDelete={remove}/></section>
        </>}

        {page==="departments"&&<>
          <div className="page-heading"><div><p className="eyebrow">ORGANIZATION</p><h2>Departments</h2><p>Department overview based on current employees.</p></div></div>
          <div className="department-grid">{departments.length===0?<div className="empty full"><Building2/><strong>No departments yet</strong><span>Add an employee to create department data.</span></div>:
            departments.map(d=><div className="department-card" key={d.name}><div className="department-icon"><Building2/></div>
              <h3>{d.name}</h3><p>{d.count} employee{d.count===1?"":"s"}</p><div className="dept-payroll"><span>Annual payroll</span><strong>{money(d.payroll)}</strong></div></div>)}</div>
        </>}
      </div>
    </main>

    {modal?.type==="form"&&<div className="modal-overlay"><div className="modal"><div className="modal-header">
      <div><h2>{modal.employee?"Edit Employee":"Add Employee"}</h2><p>{modal.employee?"Update employee information":"Enter employee information"}</p></div>
      <button className="close-btn" onClick={()=>setModal(null)}><X/></button></div>
      <form onSubmit={save}><div className="form-grid">
        <Field label="Full Name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></Field>
        <Field label="Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></Field>
        <Field label="Department"><input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} required/></Field>
        <Field label="Position"><input value={form.position} onChange={e=>setForm({...form,position:e.target.value})} required/></Field>
        <Field label="Annual Salary" full><input type="number" min="0" value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})} required/></Field>
      </div>
      {error&&<div className="form-error">{error}</div>}
      <div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>setModal(null)}>Cancel</button>
        <button className="primary-btn">{modal.employee?"Update Employee":"Add Employee"}</button></div></form>
    </div></div>}

    {modal?.type==="view"&&<div className="modal-overlay"><div className="modal"><div className="modal-header">
      <div><h2>Employee Details</h2><p>Complete employee information</p></div><button className="close-btn" onClick={()=>setModal(null)}><X/></button></div>
      <div className="view-profile"><div className="big-avatar">{(modal.employee.name||"E").charAt(0).toUpperCase()}</div>
        <h2>{modal.employee.name||"Unnamed Employee"}</h2><p>{modal.employee.position||"Employee"}</p></div>
      <div className="detail-list"><div><span>Email</span><strong>{modal.employee.email||"—"}</strong></div>
        <div><span>Department</span><strong>{modal.employee.department||"—"}</strong></div>
        <div><span>Position</span><strong>{modal.employee.position||"—"}</strong></div>
        <div><span>Annual Salary</span><strong>{money(modal.employee.salary)}</strong></div></div>
    </div></div>}
  </div>;
}

function Field({label,children,full}){return <div className={`form-group ${full?"full-width":""}`}><label>{label}</label>{children}</div>}
function Stats({stats}){return <section className="stats-grid">
  <Stat icon={<Users/>} label="Total Employees" value={stats.totalEmployees}/>
  <Stat icon={<Building2/>} label="Departments" value={stats.departments}/>
  <Stat icon={<Wallet/>} label="Annual Payroll" value={money(stats.annualPayroll)}/>
  <Stat icon={<UserCheck/>} label="Active Employees" value={stats.activeEmployees}/>
</section>}
function Stat({icon,label,value}){return <div className="stat-card"><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong></div>}
function EmployeeTable({employees,loading,onView,onEdit,onDelete}){
  if(loading)return <div className="loading">Loading employees...</div>;
  return <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Position</th><th>Salary</th><th>Actions</th></tr></thead><tbody>
    {employees.length===0?<tr><td colSpan="5"><div className="empty"><Users/><strong>No employees found</strong><span>Add an employee to get started.</span></div></td></tr>:
      employees.map(e=>{const name=e.name||"Unnamed Employee";return <tr key={e.id}><td><div className="employee-cell"><div className="avatar">{name.charAt(0).toUpperCase()}</div>
        <div><strong>{name}</strong><span>{e.email||"No email"}</span></div></div></td><td><span className="badge">{e.department||"Unassigned"}</span></td>
        <td>{e.position||"Unassigned"}</td><td><strong>{money(e.salary)}</strong></td><td><div className="row-actions">
          <button title="View" onClick={()=>onView(e)}><Eye/></button><button title="Edit" onClick={()=>onEdit(e)}><Edit3/></button>
          <button title="Delete" onClick={()=>onDelete(e.id)}><Trash2/></button></div></td></tr>})}
  </tbody></table></div>
}
export default App;
