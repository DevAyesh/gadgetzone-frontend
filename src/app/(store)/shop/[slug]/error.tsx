"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProductDetailsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-10 md:px-8">
      <div className="max-w-md space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold">Unable to load this product</h1>
        <p className="text-muted-foreground">Please check your connection and try again.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
