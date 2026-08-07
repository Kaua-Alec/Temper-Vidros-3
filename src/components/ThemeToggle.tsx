import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setTheme("light");
      document.documentElement.classList.add("light");
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggle = () => {
    if (theme === "dark") {
      setTheme("light");
      localStorage.setItem("theme", "light");
      document.documentElement.classList.add("light");
    } else {
      setTheme("dark");
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.remove("light");
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-md border border-[color:var(--navy-border)] text-[color:var(--muted-foreground)] hover:text-[color:var(--gold)] hover:border-[color:var(--gold-dim)] transition flex items-center justify-center bg-[color:var(--navy-surface)]"
      aria-label="Alternar Tema"
      title="Alternar Tema"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
