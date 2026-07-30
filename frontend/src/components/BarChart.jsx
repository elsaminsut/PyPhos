"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "An interactive bar chart"

const chartConfig = {
  yield: {
    label: "Energy yield",
    color: "var(--chart-2)",
  },
  radiation: {
    label: "Solar radiation",
    color: "var(--chart-1)",
  },
}

export function ChartBarInteractive({ data, height = 250 }) {
  const [activeChart, setActiveChart] = React.useState("yield")

  const totals = React.useMemo(
    () => ({
      yield: data?.reduce((acc, curr) => acc + curr.yield, 0) ?? 0,
      radiation: data?.reduce((acc, curr) => acc + curr.radiation, 0) ?? 0,
    }),
    [data]
  )

  if (!data || data.length === 0) {
    return null
  }

  const units = { yield: "kWh", radiation: "kWh/m²" }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle>Monthly results</CardTitle>
          <CardDescription>
            Energy yield and solar radiation per month
          </CardDescription>
        </div>
        <div className="flex">
          {["yield", "radiation"].map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l cursor-pointer data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[key].label}
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {totals[key].toLocaleString(undefined, { maximumFractionDigits: 0 })}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {units[key]}
                </span>
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full"
          style={{ height }}
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[160px]"
                  nameKey={activeChart}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
