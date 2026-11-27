"use client";

import { useCallback, useEffect, useState } from "react";
import { INACTIVE, readPro, type ProState } from "@/lib/pro";

/** Reads the local licence and keeps every tab in sync. */
export function usePro(): [ProState, (next?: ProState) => void] {
  const [state, setState] = useState<ProState>(INACTIVE);

  const refresh = useCallback(() => setState(readPro()), []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("fatoura:pro", onChange);
    window.addEventListener("storage", onChange);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener("fatoura:pro", onChange);
      window.removeEventListener("storage", onChange);
      window.clearInterval(timer);
    };
  }, [refresh]);

  return [state, refresh];
}
