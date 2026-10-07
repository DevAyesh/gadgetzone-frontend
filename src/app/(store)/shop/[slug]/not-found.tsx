import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-10 md:px-8">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-muted-foreground">This product may have been removed or is no longer available.</p>
        <Link href="/shop"><Button>Back to shop</Button></Link>
      </div>
    </div>
  );
}
