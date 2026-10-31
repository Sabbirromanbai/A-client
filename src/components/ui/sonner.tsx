"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "@/components/providers/ThemeProvider";

export function Toaster(props: ToasterProps) {
  const { isDark } = useTheme();

  return (
    <Sonner
      className="toaster group"
      position="top-right"
      theme={isDark ? "dark" : "light"}
      toastOptions={{
        classNames: {
          toast:
            "group-[.toaster]:border-emerald-200/80 group-[.toaster]:bg-white/95 group-[.toaster]:text-slate-900 group-[.toaster]:shadow-lg dark:group-[.toaster]:border-slate-700 dark:group-[.toaster]:bg-slate-900/95 dark:group-[.toaster]:text-slate-100",
          description:
            "group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-emerald-700 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-700 dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-200",
        },
      }}
      {...props}
    />
  );
}
