"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function usePhotoViewer() {
  const [state, setState] = useState<{ list: string[]; i: number } | null>(null);
  const view = state ? (
    <div className="fixed inset-0 z-[90] bg-black/92 flex items-center justify-center h-fade" role="dialog" aria-label="الصور" onClick={() => setState(null)}>
      <button aria-label="إغلاق" className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center"><X /></button>
      {state.list.length > 1 && (
        <>
          <button aria-label="السابقة" onClick={(e) => { e.stopPropagation(); setState({ ...state, i: (state.i - 1 + state.list.length) % state.list.length }); }}
            className="absolute start-3 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center"><ChevronRight /></button>
          <button aria-label="التالية" onClick={(e) => { e.stopPropagation(); setState({ ...state, i: (state.i + 1) % state.list.length }); }}
            className="absolute end-3 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center"><ChevronLeft /></button>
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={state.list[state.i]} alt="صورة" className="max-w-[94vw] max-h-[88dvh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
      <span className="absolute bottom-6 text-white/80 text-sm">{state.i + 1} / {state.list.length}</span>
    </div>
  ) : null;
  return { open: (list: string[], i = 0) => setState({ list, i }), view };
}
