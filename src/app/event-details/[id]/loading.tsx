import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetailsLoading() {
  return (
    <main
      aria-label="Loading event details"
      className="flex-1 bg-[#fbfdf9] dark:bg-slate-950"
    >
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-6 h-96 w-full rounded-3xl sm:h-[30rem]" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.4fr]">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </section>
    </main>
  );
}
