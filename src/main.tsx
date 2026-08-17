import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Blocks, X } from 'lucide-react';
import App from './App.tsx';
import ServiceFabric from './service-fabric/ServiceFabric.tsx';
import './index.css';

function StormFireShell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <App />
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-lg border border-cyan-700 bg-slate-950/95 px-4 py-2.5 text-[10px] font-bold tracking-widest text-cyan-300 shadow-2xl backdrop-blur hover:border-cyan-400"
        aria-label="Open Storm Fire Service Fabric"
      >
        <Blocks className="h-4 w-4" /> SERVICE FABRIC
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 p-4 md:p-8 backdrop-blur-sm overflow-y-auto">
          <div className="mx-auto max-w-7xl pt-2">
            <div className="flex justify-end mb-3"><button onClick={() => setOpen(false)} className="flex items-center gap-2 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-[10px] font-bold text-slate-300"><X className="h-4 w-4"/> CLOSE</button></div>
            <ServiceFabric />
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><StormFireShell /></StrictMode>);
