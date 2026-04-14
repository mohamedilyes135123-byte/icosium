"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, MapPin, Star, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { mockDoctors } from "@/lib/mock-data";
import { useState } from "react";

export default function DoctorDirectory() {
  const [search, setSearch] = useState("");

  const filteredDoctors = mockDoctors.filter(doc => 
    doc.name.includes(search) || doc.specialty.includes(search)
  );

  return (
    <div className="px-5 pt-16 pb-28 min-h-full">
      <header className="mb-6 bg-white/60 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-white">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">ابحث عن طبيبك</h1>
        <p className="text-slate-500 mb-6">تصفح قائمة الأطباء المعتمدين والموثوقين في منطقتك، واحجز موعداً بسهولة.</p>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="ابحث بالاسم، التخصص..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-6 pr-12 rounded-2xl border-0 bg-white/50 backdrop-blur-sm shadow-inner focus:ring-2 focus:ring-emerald-400 outline-none transition-all text-sm font-medium text-slate-700"
          />
          <Search className="absolute top-3.5 right-4 text-emerald-600/50 w-5 h-5 pointer-events-none" />
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {filteredDoctors.map((doc) => (
          <Card key={doc.id} className="hover:border-emerald-300 transition-all group bg-white/70 backdrop-blur-lg shadow-sm border-white/60">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-[18px] bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-100/50 flex-shrink-0 flex items-center justify-center overflow-hidden relative shadow-inner">
                  {/* Avatar Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-blue-50"></div>
                  <UserAvatar name={doc.name} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">{doc.name}</h3>
                      <div className="flex items-center text-emerald-600 text-[11px] font-bold gap-1 mt-1 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                        <Award className="w-3.5 h-3.5" />
                        <span>{doc.specialty}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-sm font-bold">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>
                  
                  <div className="text-slate-500 text-sm flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{doc.clinicName} - {doc.address}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/50">
                    <div className="text-slate-800 font-black text-sm">
                      {doc.fees} د.ج <span className="text-[10px] font-bold text-slate-400">/ استشارة</span>
                    </div>
                    <button className="flex items-center gap-1 bg-[#022c22] text-emerald-50 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors shadow-md">
                      استشارة
                      <ChevronRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredDoctors.length === 0 && (
          <div className="col-span-2 text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">لم يتم العثور على أطباء يطابقون بحثك.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
  return (
    <span className="relative z-10 text-2xl font-bold text-brand-700">{initials}</span>
  )
}
