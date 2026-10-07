import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
      <Skeleton className="mb-3 h-9 w-44" />
      <Skeleton className="mb-8 h-5 w-64" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-xl ring-1 ring-border">
            <Skeleton className="aspect-square rounded-none" />
            <div className="space-y-3 p-4 sm:p-5">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-2/5" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
