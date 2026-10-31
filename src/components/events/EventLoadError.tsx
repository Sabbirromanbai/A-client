import { AlertCircle } from "lucide-react";

export default function EventLoadError() {
  return (
    <div
      className="rounded-3xl border border-rose-200 bg-white px-6 py-12 text-center dark:border-rose-900/70 dark:bg-slate-900"
      role="alert"
    >
      <AlertCircle aria-hidden="true" className="mx-auto h-10 w-10 text-rose-500" />
      <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
        Events are temporarily unavailable
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
        We couldn’t load events from the server. Please try again in a moment.
      </p>
    </div>
  );
}
