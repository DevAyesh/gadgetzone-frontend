import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailsLoading() {
  return (
    <div className="container mx-auto px-4 py-10 md:px-8 lg:py-16">
      <Skeleton className="mb-8 h-5 w-72" />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-12 w-56" />
        </div>
      </div>
    </div>
  );
}
