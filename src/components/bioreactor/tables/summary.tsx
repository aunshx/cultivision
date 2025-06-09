"use client";

import { CalculatedExpenses } from "@/types";
import cn from "classnames";
import TableDownloadButton from "@/components/bioreactor/tables/download-button"; 
import Title from "@/components/title";

interface SummaryTableProps {
  expenses: CalculatedExpenses;
}

const formatNumber = (num: number, fixed=1): string => {
  return num.toLocaleString(undefined, { maximumFractionDigits: fixed });
};

const SummaryTable = ({ expenses }: SummaryTableProps) => {


  const metrics = [
    {
      name: "Annual Production",
      value: formatNumber(expenses.annualProduction, 2),
      combinedValue: formatNumber(
        expenses.annualProduction * expenses.facilitiesNeeded, 2
      ),
      unit: "kg/yr",
    },
    {
      name: "Capital Expenses",
      value: formatNumber(expenses.capitalExpenses),
      combinedValue: formatNumber(
        expenses.capitalExpenses * expenses.facilitiesNeeded
      ),
      unit: "million $",
    },
    {
      name: "Operating Expenses",
      value: formatNumber(expenses.operatingExpenses),
      combinedValue: formatNumber(
        expenses.operatingExpenses * expenses.facilitiesNeeded
      ),
      unit: "million $/yr",
    },
    {
      name: "COGS (with Depreciation)",
      value: expenses.cogsWithDepreciation.toFixed(2),
      combinedValue: expenses.cogsWithDepreciation.toFixed(2),
      unit: "$/kg",
    },
    {
      name: "COGS (without Depreciation)",
      value: expenses.cogsWithoutDepreciation.toFixed(2),
      combinedValue: expenses.cogsWithoutDepreciation.toFixed(2),
      unit: "$/kg",
    },
  ];

  const headers = ["Metric", "Single Value", "25 Value", "Unit"];
  const rows = metrics.map((m) => [m.name, m.value, m.combinedValue, m.unit]);

  return (
    <div className='h-full flex flex-col pb-2'>
      <div className='flex items-center justify-start gap-x-2 mb-4'>
        <Title title={"Executive Summary"} />
        <TableDownloadButton
          filename='executive-summary.csv'
          headers={headers}
          rows={rows}
        />
      </div>
      <div className='overflow-scroll border border-gray-200 rounded-lg'>
        <table
          className='min-w-full divide-y divide-gray-200'
          role='table'
          aria-label='Performance metrics table'
        >
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Metric
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Single Facility
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                {expenses.facilitiesNeeded}* Facilities
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Unit
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {metrics.map((metric, index) => (
              <tr
                key={index}
                className={cn("bg-gray-50 text-left", {
                  "bg-white": index % 2 === 0,
                })}
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-900'>
                    {metric.name}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium'>
                  {metric.value}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium'>
                  {metric.combinedValue}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {metric.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='border-t border-gray-400 mx-4 my-4' />

      <div className='text-sm text-gray-500 px-4'>
        <div className='font-medium mb-1'>Notes:</div>
        <ul className='list-disc pl-5 space-y-1'>
          <li>COGS = Cost of Goods Sold</li>
          <li>*Value summary of number of facilities required to produce approximately 100M kg/yr</li>
          <li>Capital expenses are reported in millions of $</li>
          <li>All calculations based on provided cost parameters</li>
        </ul>
      </div>
    </div>
  );
};

export default SummaryTable;
