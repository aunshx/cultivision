"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  ChartConfiguration,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { CalculatedExpenses } from "@/types";
import { BRAND_COLOR_ORDER } from "@/lib/constants";
import useChartDownload from "@/hooks/use-chart-download";
import ChartDownloadButton from "./download-button";
import Title from "@/components/title";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

interface BioreactorBarChartProps {
  expenses: CalculatedExpenses;
}

const labels = [
  "Media",
  "Raw Materials",
  "Labor",
  "Waste",
  "Facility",
  "Consumables",
  "Utilities",
];

const BioreactorBarChart = ({ expenses }: BioreactorBarChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const { downloadChart } = useChartDownload();

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const chartData = expenses.chartData;

    // Convert data to millions for better readability
    const dataInMillions = [
      chartData.media / 1000000,
      chartData.otherMaterials / 1000000,
      chartData.labor / 1000000,
      chartData.waste / 1000000,
      chartData.facility / 1000000,
      chartData.consumables / 1000000,
      chartData.utilities / 1000000,
    ];

    const data = {
      labels: labels,
      datasets: [
        {
          label: "Expense ($ Million)",
          data: dataInMillions,
          backgroundColor: BRAND_COLOR_ORDER,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };

    const config: ChartConfiguration = {
      type: "bar",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw as number;
                return `${formatCurrency(value * 1000000)}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "USD (Millions)",
            },
            ticks: {
              callback: function (value) {
                return "$" + value + "M";
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

  const formatCurrency = (value: number, digits: number = 0): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  };

  return (
    <div className='h-full flex flex-col pb-2'>
      <div className='flex justify-between items-start w-full mb-4'>
        <div className='flex gap-x-2'>
          <Title title={"Cost Breakdown"} />
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
        aria-label='Horizontal bar chart showing cost breakdown across categories in USD millions'
        style={{ minHeight: "450px" }}
      >
        <canvas ref={chartRef} className='w-full h-full'></canvas>
      </div>
    </div>
  );
};

export default BioreactorBarChart;
