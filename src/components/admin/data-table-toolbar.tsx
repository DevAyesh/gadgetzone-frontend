"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DataTableToolbarProps {
  searchPlaceholder?: string;
  filterOptions?: { label: string; value: string }[];
  filterPlaceholder?: string;
}

export function DataTableToolbar({
  searchPlaceholder = "Search...",
  filterOptions = [],
  filterPlaceholder = "Filter by...",
}: DataTableToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") || "";
  const currentFilter = searchParams.get("filter") || "all";

  const [searchValue, setSearchValue] = useState(currentSearch);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        router.push(`${pathname}?${createQueryString("q", searchValue)}`);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue, currentSearch, pathname, router, createQueryString]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
      <div className="relative w-full sm:max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9 bg-background/50"
        />
      </div>

      {filterOptions.length > 0 && (
        <select
          value={currentFilter}
          onChange={(e) => {
            router.push(`${pathname}?${createQueryString("filter", e.target.value)}`);
          }}
          className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">{filterPlaceholder}</option>
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
