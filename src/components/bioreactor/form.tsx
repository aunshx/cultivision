"use client";

import { useEffect, useState } from "react";
import { useCalculations } from "@/context/calculation-context";
import { defaultProductionCosts } from "@/lib/bioreactors";
import Title from "@/components/title";
import cn from "classnames";
import { trackButtonClick, trackFormSubmission, trackUserBehavior } from "@/lib/analytics";

interface ParameterProps {
  id: string;
  label: string;
  unit: string;
  step: string;
  default: number;
  description: string;
}

const costInputs: ParameterProps[] = [
  {
    id: "mediaCost",
    label: "Media Cost",
    unit: "$/L",
    step: "0.1",
    default: defaultProductionCosts.mediaCost,
    description: `Base case cost: $${defaultProductionCosts.mediaCost}/L`,
  },
  {
    id: "laborCost",
    label: "Labor Cost Change",
    unit: "%",
    step: "1",
    default: defaultProductionCosts.laborCost,
    description: "Labor cost as a percent difference from base labor cost",
  }
];

const utilitiesInput: ParameterProps[] = [
  {
    id: "electricityCost",
    label: "Electricity",
    unit: "$/kWh",
    step: "0.01",
    default: defaultProductionCosts.electricityCost,
    description: `Base case cost: $${defaultProductionCosts.electricityCost}/kW-h`,
  },
  {
    id: "steamCost",
    label: "Steam",
    unit: "$/MT",
    step: "0.1",
    default: defaultProductionCosts.steamCost,
    description: `Base case cost: $${defaultProductionCosts.steamCost}/MT`,
  },
  {
    id: "coolingWaterCost",
    label: "Cooling Water",
    unit: "$/MT",
    step: "0.01",
    default: defaultProductionCosts.coolingWaterCost,
    description: `Base case cost: $${defaultProductionCosts.coolingWaterCost}/MT`,
  },
  {
    id: "chilledWaterCost",
    label: "Chilled Water",
    unit: "$/MT",
    step: "0.01",
    default: defaultProductionCosts.chilledWaterCost,
    description: `Base case cost: $${defaultProductionCosts.chilledWaterCost}/MT`,
  },
];

const ParameterForm = () => {
  const { costs, setCosts, isUrlParamProcessed } = useCalculations();
  const [localCosts, setLocalCosts] = useState(costs);
  const [realTimeUpdates, setRealTimeUpdates] = useState(false);
  const [urlParamsSet, setUrlParamsSet] = useState(false);

  useEffect(() => {
    if ((isUrlParamProcessed && !urlParamsSet) || !urlParamsSet) {
      setLocalCosts(costs);
      setUrlParamsSet(true);
    }
  }, [costs, isUrlParamProcessed, urlParamsSet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const newCosts = {
      ...localCosts,
      [id]: parseFloat(value) ?? 0,
    };

    setLocalCosts(newCosts);

    if (realTimeUpdates) {
      setCosts(newCosts);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCosts(localCosts);
    trackFormSubmission("cost_parameters", "Cost Parameters Form");
  };

  const handleReset = () => {
    const defaultCosts = defaultProductionCosts;
    setLocalCosts(defaultCosts);
    setCosts(defaultCosts);
    trackButtonClick("reset_form", "Reset", {
      form_id: "cost_parameters",
      button_text: 'hasCustomSettings',
    });  
  };

  const toggleRealTimeUpdates = () => {
    const newValue = !realTimeUpdates;
    setRealTimeUpdates(newValue);
    if (newValue) setCosts(localCosts);
    trackUserBehavior("toggle_realtime_updates", {
      enabled: newValue,
    });
  };

  const hasCustomSettings = Object.entries(localCosts).some(
    ([key, value]) =>
      value !==
      defaultProductionCosts[key as keyof typeof defaultProductionCosts]
  );

  return (
    <div className='h-full flex flex-col gap-y-4'>
      <div className='flex flex-col gap-y-2 pb-2 border-b border-gray-200'>
        <div className='flex flex-col xl:flex-row justify-between items-center gap-2'>
          <Title title='Cost' />
          <div className='flex gap-x-2'>
            <button
              type='button'
              onClick={handleReset}
              className={cn(
                "flex items-center gap-x-1 text-xs font-medium transition cursor-pointer hover:text-green-500",
                { "text-slate-600 hover:text-green-600": hasCustomSettings }
              )}
              disabled={!hasCustomSettings}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-3 w-3'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
              Reset
            </button>
            <div
              className={cn(
                "flex items-center gap-x-1 bg-gray-100 px-2 py-1 rounded-md text-slate-600"
              )}
            >
              <span className='text-xs font-medium'>
                {realTimeUpdates ? "Real-time" : "Manual"}
              </span>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={realTimeUpdates}
                  onChange={toggleRealTimeUpdates}
                />
                <div className="w-8 h-4 bg-gray-300 peer-focus:ring-1 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={cn("flex-1 flex flex-col gap-y-4", {
          "pb-4": realTimeUpdates,
        })}
      >
        <div className='flex-1 space-y-3'>
          {costInputs.map((param) => (
            <div key={param.id} className='form-group'>
              <label
                htmlFor={param.id}
                className='block mb-1 text-xs font-semibold text-gray-500'
              >
                {param.label}
              </label>
              <div className='grid grid-cols-1'>
                <div
                  className={cn(
                    "flex w-full rounded-md border border-gray-300 overflow-hidden",
                    "focus-within:ring-1 focus-within:ring-slate-700 focus-within:border-slate-700"
                  )}
                >
                  <input
                    type='number'
                    id={param.id}
                    value={localCosts[param.id as keyof typeof localCosts]}
                    onChange={handleChange}
                    className={cn(
                      "flex-grow w-full px-4 py-1.5 text-sm",
                      "focus:outline-none text-gray-600 border-0"
                    )}
                    placeholder='0.00'
                    step={param.step}
                    min={0}
                    aria-describedby={`${param.id}-desc`}
                  />
                  <div
                    className={cn(
                      "flex items-center justify-center px-3 text-xs",
                      "text-gray-500 bg-gray-50 border-l border-gray-200"
                    )}
                  >
                    {param.unit}
                  </div>
                </div>
                <div
                  className={cn("text-xs text-gray-400 mt-1")}
                  id={`${param.id}-desc`}
                >
                  {param.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='flex items-center justify-center xl:justify-start text-md xl:text-lg 2xl:text-xl font-semibold text-slate-700 border-b-1 border-gray-300'>
          Utilities
        </div>

        <div className='flex-1 space-y-3'>
          {utilitiesInput.map((param) => (
            <div key={param.id} className='form-group'>
              <label
                htmlFor={param.id}
                className='block mb-1 text-xs font-semibold text-gray-500'
              >
                {param.label}
              </label>
              <div className='grid grid-cols-1'>
                <div
                  className={cn(
                    "flex w-full rounded-md border border-gray-300 overflow-hidden",
                    "focus-within:ring-1 focus-within:ring-slate-700 focus-within:border-slate-700"
                  )}
                >
                  <input
                    type='number'
                    id={param.id}
                    value={localCosts[param.id as keyof typeof localCosts]}
                    onChange={handleChange}
                    className={cn(
                      "flex-grow w-full px-4 py-1.5 text-sm",
                      "focus:outline-none text-gray-600 border-0"
                    )}
                    placeholder='0.00'
                    step={param.step}
                    min={0}
                    aria-describedby={`${param.id}-desc`}
                  />
                  <div
                    className={cn(
                      "flex items-center justify-center px-3 text-xs",
                      "text-gray-500 bg-gray-50 border-l border-gray-200"
                    )}
                  >
                    {param.unit}
                  </div>
                </div>
                <div
                  className={cn("text-xs text-gray-400 mt-1")}
                  id={`${param.id}-desc`}
                >
                  {param.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!realTimeUpdates && (
          <div>
            <button
              type='submit'
              className={cn(
                "w-full py-1.5 rounded-md text-sm font-medium",
                "bg-slate-700 text-white hover:bg-slate-800 cursor-pointer"
              )}
            >
              Run Calculation
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ParameterForm;
