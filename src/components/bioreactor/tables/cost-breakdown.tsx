"use client";

import { BRAND_COLORS } from "@/lib/constants";
import { CalculatedExpenses } from "@/types";
import TableDownloadButton from "@/components/bioreactor/tables/download-button"; 
import Title from "@/components/title";

interface ExpenseTableProps {
  expenses: CalculatedExpenses;
}

const ExpenseTable = ({ expenses }: ExpenseTableProps) => {
  const chartData = expenses.chartData;

  const total = Object.values(chartData).reduce((sum, value) => sum + value, 0);

  const expenseItems = [
    { name: "Media", value: chartData.media, color: BRAND_COLORS.media },
    {
      name: "Other Raw Materials",
      value: chartData.otherMaterials,
      color: BRAND_COLORS.rawMaterials,
    },
    { name: "Labor", value: chartData.labor, color: BRAND_COLORS.labor },
    {
      name: "Waste Treatment",
      value: chartData.waste,
      color: BRAND_COLORS.waste,
    },
    {
      name: "Facility Dependent Cost",
      value: chartData.facility,
      color: BRAND_COLORS.facility,
    },
    {
      name: "Consumables",
      value: chartData.consumables,
      color: BRAND_COLORS.consumables,
    },
    {
      name: "Utilities",
      value: chartData.utilities,
      color: BRAND_COLORS.utilities,
    },
  ];

  expenseItems.sort((a, b) => b.value - a.value);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className='h-full flex flex-col pb-2'>
      <div className='flex items-center justify-start gap-x-2 mb-4'>
        <Title title={"Cost Breakdown"} />
        <TableDownloadButton
          filename='expense-breakdown.csv'
          headers={["Category", "Cost", "Percentage"]}
          rows={[
            ...expenseItems.map((item) => [
              item.name,
              formatCurrency(item.value),
              ((item.value / total) * 100).toFixed(1) + "%",
            ]),
            ["Total", formatCurrency(total), "100%"],
          ]}
        />
      </div>
      <div className='overflow-scroll border border-gray-200 rounded-lg'>
        <table
          className='min-w-full divide-y divide-gray-200'
          aria-label='Table showing detailed cost breakdown by category, cost in dollars, and percentage'
        >
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Category
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center'
              >
                Cost
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {expenseItems.map((item, index) => (
              <tr key={index} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div
                      className='h-3 w-3 rounded-full mr-2'
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className='text-sm font-medium text-gray-900'>
                      {item.name}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium'>
                  {formatCurrency(item.value)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900'>
                  {((item.value / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr className='bg-gray-50'>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm font-bold text-gray-900'>Total</div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-bold'>
                {formatCurrency(total)}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-bold'>
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpenseTable;