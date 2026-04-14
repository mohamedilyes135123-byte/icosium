export default function PlaceholderPage() {
  return (
    <div className='flex flex-col items-center justify-center h-[70vh] text-center'>
      <div className='w-24 h-24 mb-6 relative animate-pulse'>
        <div className='absolute inset-0 bg-slate-200 rounded-full blur-xl'></div>
        <div className='relative w-full h-full bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm'>
          <svg className='w-10 h-10 text-slate-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6'></path></svg>
        </div>
      </div>
      <h2 className='text-2xl font-bold text-slate-800 mb-2'>هذه الصفحة قيد التطوير</h2>
      <p className='text-slate-500 max-w-md'>الوحدة الخاصة بهذه الشاشة ستكون متاحة قريباً بعد ربط قاعدة البيانات الفعالة. (Prototype Phase)</p>
    </div>
  )
}
