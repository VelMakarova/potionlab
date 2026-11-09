import { useEffect, useState } from "react";

export function useDesktopViewport() {
  const [desktop, setDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches,
  );
  const [started, setStarted] = useState(desktop);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const change = () => {
      setDesktop(query.matches);
      if (query.matches) setStarted(true);
    };
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);

  return { desktop, started };
}
