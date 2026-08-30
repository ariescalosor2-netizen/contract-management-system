import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

export default function ViewerReports(){const [d,setD]=useState(null);useEffect(()=>{api.get("/viewer/dashboard").then(r=>setD(r?.data?.data||null))},[]);return <MainLayout><div className="mb-6"><h1 className="text-3xl font-bold text-gray-900">Reports</h1><p className="mt-1 text-gray-500">Read-only organization summary.</p></div><div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">{[["Contracts","total_contracts"],["Active Contracts","active_contracts"],["Expiring Soon","expiring_contracts"],["Parties","total_parties"]].map(([a,k])=><div key={k} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">{a}</p><p className="mt-2 text-3xl font-bold text-slate-800">{d?.[k]??"..."}</p></div>)}</div></MainLayout>}
