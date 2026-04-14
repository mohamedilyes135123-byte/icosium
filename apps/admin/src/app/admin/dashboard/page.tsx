"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Ban, Users, Activity, Lock, AlertTriangle, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  return (
    <div className="pb-32 w-full">
      <motion.header 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10 flex justify-between items-end border-b border-rose-100/50 pb-6"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight flex items-center gap-3">
             مركز المراقبة والتحكم
             <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-lg text-sm font-black border border-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.1)] animate-pulse">LIVE</span>
          </h1>
          <p className="text-slate-500 text-lg">مراقبة شاملة لمنصة عناية، إدارة الصلاحيات RBAC، وسجلات التدقيق.</p>
        </div>
        <div className="bg-white border border-rose-100 text-rose-700 px-5 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-sm">
          <Fingerprint className="w-5 h-5 text-rose-500" /> وضع مدير النظام النشط 
        </div>
      </motion.header>

      {/* RBAC Rule Display for Demo */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 border border-slate-200 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/50 mix-blend-multiply blur-3xl rounded-full"></div>
        <div className="bg-rose-50 p-3 rounded-2xl text-rose-600 mt-1 border border-rose-100 relative z-10 shadow-sm">
          <Lock className="w-6 h-6" />
        </div>
        <div className="relative z-10">
           <h4 className="font-bold text-slate-800 text-xl">صلاحيات النظام المطلقة (RBAC: System Admin)</h4>
           <div className="text-sm text-slate-600 mt-2 flex gap-6 flex-wrap">
              <span className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-emerald-600"/> اعتماد وحظر الحسابات</span>
              <span className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-emerald-600"/> الاطلاع على سجلات التدقيق اللحظية</span>
              <span className="flex items-center gap-2 text-rose-700 font-bold bg-rose-50 px-3 py-1 rounded-lg border border-rose-200"><Ban className="w-4 h-4"/> يمنع قطعيًا: الاطلاع على الملفات الطبية وقرارات العلاج (شفافية كاملة)</span>
           </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
      >
        <StatCard title="إجمالي المستخدمين" value="1,245" color="text-slate-800" trend="+12 اليوم" trendColor="text-emerald-600" />
        <StatCard title="أطباء معتمدين" value="84" color="text-blue-600" trend="3 بانتظار الاعتماد" trendColor="text-amber-600" />
        <StatCard title="صيدليات معتمدة" value="42" color="text-fuchsia-600" trend="1 بانتظار الاعتماد" trendColor="text-amber-600" />
        <StatCard title="محاولات اختراق محظورة" value="7" color="text-rose-600" trend="آخر محاولة منذ ساعة" trendColor="text-slate-500" ring="ring-rose-200" bg="bg-rose-50" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.3 }}
        >
          <Card className="shadow-xl shadow-rose-500/5 border-white bg-white/60 backdrop-blur-3xl rounded-3xl overflow-hidden h-full">
            <CardHeader className="bg-white/50 border-b border-rose-50">
              <CardTitle className="text-slate-800 flex items-center gap-3 text-xl font-bold">
                <ShieldCheck className="w-6 h-6 text-emerald-500"/>
                تراخيص بانتظار الموافقة
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 p-6">
              
              <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-slate-200 hover:shadow-md transition-all shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">د. مروان حداد</h3>
                    <p className="text-sm text-slate-500 font-bold mt-1">طبيب مختص (أمراض القلب)</p>
                  </div>
                  <span className="bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-black font-mono shadow-sm">ID: DOC-4829</span>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-5 text-sm border border-slate-100 font-mono shadow-inner">
                   <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                     <span className="text-slate-500 font-sans">الرقم المهني المسجل</span>
                     <span className="font-bold text-slate-700 text-base tracking-widest">16-8859-A</span>
                   </div>
                   <div className="flex justify-between items-center pt-1">
                     <span className="text-slate-500 font-sans">الملفات المرفقة المطلوبة</span>
                     <span className="text-blue-600 font-bold underline decoration-blue-500/50 cursor-pointer hover:text-blue-500">الشهادة والبطاقة (PDF)</span>
                   </div>
                </div>

                <div className="flex gap-3">
                   <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 h-12 rounded-xl font-bold">الموافقة (تفعيل الحساب)</Button>
                   <Button variant="outline" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-300 border-slate-200 bg-white shadow-sm rounded-xl w-16 h-12">رفض</Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.4 }}
        >
          <Card className="shadow-xl shadow-rose-500/5 border-white bg-white/60 backdrop-blur-3xl rounded-3xl overflow-hidden h-full relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 mix-blend-multiply blur-3xl rounded-full"></div>
            <CardHeader className="bg-white/50 border-b border-rose-50 relative z-10">
              <CardTitle className="flex items-center gap-3 text-slate-800 text-xl font-bold">
                <Activity className="w-6 h-6 text-slate-500"/>
                سجل التدقيق الحي (Audit Terminal)
                <span className="flex h-3 w-3 relative mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative z-10 p-6 bg-slate-50 font-mono shadow-inner flex-1 min-h-[400px]">
              
              <div className="space-y-4 relative">
                {/* terminal overlay line */}
                <div className="absolute top-0 left-0 w-px h-full bg-slate-200 ml-3"></div>

                <AuditLogItem 
                  action="USER_LOGIN" 
                  user="doc-1 (يوسف خليل)" 
                  time="منذ دقيقتين" 
                  ip="197.112.5.88" 
                  status="SUCCESS"
                />
                <AuditLogItem 
                  action="PRESCRIPTION_CREATED" 
                  user="doc-1 (يوسف خليل)" 
                  time="منذ 5 دقائق" 
                  ip="197.112.5.88" 
                  status="ENCRYPTED"
                />
                <AuditLogItem 
                  action="UNAUTHORIZED_ACCESS_ATTEMPT" 
                  user="pharm-1 (صيدلية النور)" 
                  time="منذ ساعة" 
                  ip="41.220.10.15" 
                  status="BLOCKED"
                  alert
                />
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, trend, trendColor, ring = "ring-transparent", bg = "bg-white" }: any) {
  return (
    <Card className={`bg-white/70 backdrop-blur-xl border-white shadow-lg shadow-black/5 relative group hover:${ring} ring-1 transition-all duration-500 rounded-3xl overflow-hidden`}>
      <CardContent className={`p-6 relative z-10 ${bg}`}>
        <p className="text-slate-500 text-sm font-bold tracking-wide mb-3">{title}</p>
        <h3 className={`text-5xl font-black ${color} mb-3`}>{value}</h3>
        <p className={`text-xs font-bold ${trendColor}`}>{trend}</p>
      </CardContent>
    </Card>
  )
}

function AuditLogItem({ action, user, time, ip, status, alert = false }: any) {
  return (
    <div className={`flex items-start justify-between p-4 rounded-xl border border-l-[6px] backdrop-blur-md relative z-10 shadow-sm ${alert ? 'bg-rose-50 border-rose-100 border-l-rose-500' : 'bg-white border-slate-100 border-l-blue-500'}`}>
      <div>
        <h4 className={`text-sm font-bold mb-1.5 ${alert ? 'text-rose-600' : 'text-blue-700'}`}>{action}</h4>
        <div className="flex gap-4 text-xs text-slate-500">
          <span className="font-sans">{user}</span>
          <span className="opacity-50">|</span>
          <span>{ip}</span>
        </div>
      </div>
      <div className="text-left flex flex-col items-end">
        <span className={`text-[10px] px-2.5 py-1 flex items-center justify-center rounded-md font-black tracking-widest ${alert ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
          {status}
        </span>
        <p className="text-[10px] text-slate-400 mt-2 font-sans">{time}</p>
      </div>
    </div>
  )
}

function CheckCircleIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="m9 11 3 3L22 4" />
        </svg>
    )
}
