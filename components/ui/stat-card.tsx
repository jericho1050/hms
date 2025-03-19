import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
} from "lucide-react"

export function StatsCard({
    title,
    value,
    description,
    icon,
    trend,
    trendDirection,
  }: {
    title: string
    value: string
    description: string
    icon: React.ReactNode
    trend: number
    trendDirection: "up" | "down" | "neutral"
  }) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            {trendDirection === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trendDirection === "down" && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
            <span
              className={
                trendDirection === "up"
                  ? "text-green-500"
                  : trendDirection === "down"
                    ? "text-red-500"
                    : "text-muted-foreground"
              }
            >
              {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-muted-foreground ml-1">vs. last month</span>
          </div>
        </CardContent>
      </Card>
    )
  }