"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  ChartConfiguration,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { CalculatedExpenses } from "@/types";
import { BRAND_COLOR_ORDER } from "@/lib/constants";
import useChartDownload from "@/hooks/use-chart-download";
import ChartDownloadButton from "./download-button";
import Title from "@/components/title";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface BioreactorChartProps {
  expenses: CalculatedExpenses;
}

const BioreactorChart = ({ expenses }: BioreactorChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const { downloadChart } = useChartDownload();

  const formatCurrency = (value: number, digits: number = 0): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  };

  const calculatePercentages = (chartData: Record<string, number>) => {
    const total = Object.values(chartData).reduce(
      (sum, value) => sum + value,
      0
    );
    return Object.fromEntries(
      Object.entries(chartData).map(([key, value]) => [
        key,
        (value / total) * 100,
      ])
    );
  };

  useEffect(() => {
    if (!chartRef.current || !expenses?.chartData) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const chartData = expenses.chartData as unknown as Record<string, number>;
    const percentages = calculatePercentages(chartData);

    const data = {
      labels: [
        `Media (${percentages.media.toFixed(1)}%)`,
        `Raw Materials (${percentages.otherMaterials.toFixed(1)}%)`,
        `Labor (${percentages.labor.toFixed(1)}%)`,
        `Waste (${percentages.waste.toFixed(1)}%)`,
        `Facility (${percentages.facility.toFixed(1)}%)`,
        `Consumables (${percentages.consumables.toFixed(1)}%)`,
        `Utilities (${percentages.utilities.toFixed(1)}%)`,
      ],
      datasets: [
        {
          data: [
            chartData.media,
            chartData.otherMaterials,
            chartData.labor,
            chartData.waste,
            chartData.facility,
            chartData.consumables,
            chartData.utilities,
          ],
          backgroundColor: BRAND_COLOR_ORDER,
          borderWidth: 1,
          borderColor: "#ffffff",
          hoverOffset: 6,
        },
      ],
    };

    const config: ChartConfiguration = {
      type: "doughnut",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 10,
          },
        },
        plugins: {
          legend: {
            position: "right",
            align: "center",
            labels: {
              padding: 10,
              boxWidth: 12,
              font: {
                size: 11,
              },
            },
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [expenses]);

  const totalExpenses = Object.values(expenses.chartData || {}).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <div className='h-full flex flex-col pb-2'>
      <div className='flex justify-between items-start w-full'>
        <div className='flex gap-x-2'>
          <Title title={"Cost Distribution"} />
          <ChartDownloadButton
            downloadChart={downloadChart}
            chartInstance={chartInstance}
            filename='cost-distribution-chart.png'
          />
        </div>
        <div className='text-right'>
          <div className='text-sm font-semibold text-slate-700'>
            COGS: {formatCurrency(expenses.cogsWithDepreciation, 2)}/kg
          </div>
        </div>
      </div>

      <div
        className='flex-1 relative'
        aria-label='Doughnut chart showing percentage distribution of operational expenses'
        style={{ minHeight: "300px"}}
      >
        <canvas ref={chartRef} className='w-full h-full' />
      </div>

      <div className='text-center text-sm mt-2 text-slate-500'>
        Total Operating Expenses: {formatCurrency(totalExpenses)}
      </div>
    </div>
  );
};

export default BioreactorChart;
