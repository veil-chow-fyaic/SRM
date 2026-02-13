import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

export function PlaceholderPage({ title }: { title?: string }) {
  const location = useLocation();
  const pageName = title || location.pathname.split('/').pop()?.replace('-', ' ').toUpperCase() + ' MODULE';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-xl border border-slate-200 border-dashed">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <Construction className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{pageName}</h2>
      <p className="text-slate-500 max-w-md">
        This module is currently under development. 
        <br />
        Please check back later for updates.
      </p>
      <div className="mt-6 px-4 py-2 bg-slate-50 text-xs font-mono text-slate-400 rounded">
        Route: {location.pathname}
      </div>
    </div>
  );
}
