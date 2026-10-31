import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingEventsLoading() {
  return (
    <main
      aria-label="Loading upcoming events"
      className="flex-1 bg-[#fbfdf9] dark:bg-slate-950"
    >
      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto mb-10 max-w-2xl space-y-4 text-center sm:mb-14">
          <Skeleton className="mx-auto h-9 w-52 rounded-full" />
          <Skeleton className="mx-auto h-12 w-72 max-w-full" />
          <Skeleton className="mx-auto h-5 w-full max-w-xl" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              key={index}
            >
              <Skeleton className="h-52 w-full rounded-2xl" />
              <Skeleton className="mt-5 h-6 w-3/4" />
              <Skeleton className="mt-3 h-12 w-full" />
              <Skeleton className="mt-5 h-4 w-1/2" />
              <Skeleton className="mt-3 h-4 w-2/3" />
              <Skeleton className="mt-5 h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
