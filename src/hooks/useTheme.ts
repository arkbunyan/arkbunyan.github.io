import { useCallback, useEffect, useState } from "react";

type Mode = "light" | "dark";

function stored(): Mode | null {
  try {
    const saved = localStorage.getItem("mode");
    return saved === "dark" || saved === "light" ? saved : null;
  } catch {
    return null;
  }
}

export default function useTheme() {
  const [mode, setMode] = useState<Mode>(() => {
    const preset = document.documentElement.getAttribute("data-mode");
    if (preset === "dark" || preset === "light") return preset;
    return stored() ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
    try {
      localStorage.setItem("mode", mode);
    } catch {
      return;
    }
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { mode, toggle };
}
