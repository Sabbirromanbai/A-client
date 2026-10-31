import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main
      aria-label="Loading profile"
      className="flex-1 bg-[#fbfdf9] dark:bg-slate-950"
    >
      <section className="mx-auto max-w-7xl space-y-7 px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <Skeleton className="h-56 w-full rounded-[2rem]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-28 rounded-2xl" key={index} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </section>
    </main>
  );
}
