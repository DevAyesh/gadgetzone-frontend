"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface ChartDataPoint {
  name: string;
  rawDate?: string;
  total: number;
  orders?: number;
}

interface RevenueChartProps {
  data?: ChartDataPoint[];
  loading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataPoint;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="rounded-lg border border-border/70 bg-popover/95 backdrop-blur-sm p-3 shadow-lg text-xs space-y-1.5 transition-all">
        <p className="font-semibold text-foreground text-xs">{dataPoint.rawDate || label}</p>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#10B981] shadow-xs shrink-0" />
          <span className="text-muted-foreground">Revenue:</span>
          <span className="font-bold text-foreground text-sm">
            {formatPrice(dataPoint.total)}
          </span>
        </div>
        {typeof dataPoint.orders === "number" && (
          <p className="text-[11px] text-muted-foreground pl-4.5">
            {dataPoint.orders} completed {dataPoint.orders === 1 ? "order" : "orders"}
          </p>
        )}
      </div>
    );
  }
  return null;
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  if (loading) {
    return (
      <div className="w-full h-[260px] flex flex-col justify-end gap-3 p-4">
        <div className="flex items-end gap-2 h-full w-full">
          {[40, 25, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85].map((h, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  const chartData = data && data.length > 0 ? data : [];
  const hasNonZeroData = chartData.some((d) => d.total > 0);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[260px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground border border-dashed border-border/50 rounded-xl bg-muted/20">
        <BarChart3 className="h-9 w-9 mb-2 stroke-[1.5] text-muted-foreground/60" />
        <p className="text-sm font-medium text-foreground">No sales data available</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Completed order revenue will automatically plot here for the selected timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[260px] relative">
      {!hasNonZeroData && (
        <div className="absolute top-2 right-4 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40 z-10">
          Zero completed orders in this window
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueEmeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.20} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
            opacity={0.4}
          />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            minTickGap={20}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              const inRupees = value / 100;
              if (inRupees >= 1000000) return `Rs. ${(inRupees / 1000000).toFixed(1)}M`;
              if (inRupees >= 1000) return `Rs. ${(inRupees / 1000).toFixed(0)}k`;
              return `Rs. ${inRupees}`;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#059669"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#revenueEmeraldGradient)"
            dot={(props: any) => {
              const { cx, cy, payload, index } = props;
              if (payload && payload.total > 0) {
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="#059669"
                    stroke="hsl(var(--background))"
                    strokeWidth={1.5}
                  />
                );
              }
              return null;
            }}
            activeDot={{
              r: 5,
              fill: "#059669",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}


