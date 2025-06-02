import { Bioreactor, ProductionCosts, CalculatedExpenses } from "@/types";

export const bioreactors: Bioreactor[] = [
  {
    id: "40K_STR",
    name: "42,000 L Stirred Tank",
    image: "/images/40K_STR.png",
    annualProduction: 4003226,
    capitalExpense: 437200000,
    consumableCosts: 123000,
    wasteTreatmentCost: 697000,
    steamUsage: 22166,
    coolingWaterUsage: 1944436,
    chilledWaterUsage: 89448,
    powerUsage: 8790694,
    mediaVolume: 40732424,
    facilityCosts: 77202000,
    otherMaterialsCost: 2519278,
    // TODO: Change the below from a ratio to the cost directly as given in the csv 
    depreciation: 5.14,

    baseLaborCost: 722 * 34.5 + 24076 * 46.0 + 261 * 57.5,
  },
  {
    id: "210K_STR",
    name: "211,000 L Stirred Tank",
    image: "/images/210K_STR.png",
    annualProduction: 20170140,
    mediaVolume: 205220306,
    baseLaborCost: 1443 * 34.5 + 20302 * 46.0 + 261 * 57.5,
    otherMaterialsCost: 4566256,
    wasteTreatmentCost: 2486000,
    facilityCosts: 205003000,
    consumableCosts: 246000,
    powerUsage: 8790694,
    steamUsage: 22166,
    coolingWaterUsage: 1944436,
    chilledWaterUsage: 89448,
    capitalExpense: 1172900000,
    depreciation: 9.76,
    // reactors: {
    //   '17h': {
    //     '100gpl': {

    //     },
    //   },
    //   '20h': {
    //     '100gpl': {},
    //   },
    //   '23h': {
    //     '100gpl': {},
    //   },
    //   '26h': {
    //     '100gpl': {},
    //   },
    //   '29h': {
    //     '100gpl': {},
    //   },
    // },
  },
  {
    id: "260K_ALR",
    name: "262,000 L Airlift",
    image: "/images/260K_ALR.png",
    annualProduction: 25000000,
    mediaVolume: 253758783,
    baseLaborCost: 2756 * 34.5 + 20353 * 46.0 + 261 * 57.5,
    otherMaterialsCost: 5464682,
    wasteTreatmentCost: 3034484,
    facilityCosts: 59461000,
    consumableCosts: 246000,
    powerUsage: 3116542,
    steamUsage: 27232,
    coolingWaterUsage: 1263320,
    chilledWaterUsage: 110527,
    capitalExpense: 365900000,
    depreciation: 1.2,
  },
];

export const defaultProductionCosts: ProductionCosts = {
  mediaCost: 1.4,
  laborCost: 0,
  electricityCost: 0.1,
  steamCost: 12,
  coolingWaterCost: 0.05,
  chilledWaterCost: 0.4,
};

export function getBioreactorById(id: string): Bioreactor | undefined {
  return bioreactors.find((reactor) => reactor.id === id);
}

export function calculateExpenses(
  bioreactor: Bioreactor,
  costs: ProductionCosts
): CalculatedExpenses {
  // Calculate utilities
  const power = costs.electricityCost * bioreactor.powerUsage;
  const steam = costs.steamCost * bioreactor.steamUsage;
  const coolingWater = costs.coolingWaterCost * bioreactor.coolingWaterUsage;
  const chilledWater = costs.chilledWaterCost * bioreactor.chilledWaterUsage;
  const utilities = power + steam + coolingWater + chilledWater;

  // Calculate operating expenses
  const media = costs.mediaCost * bioreactor.mediaVolume;
  const otherMaterials = bioreactor.otherMaterialsCost;
  const labor = (1 + costs.laborCost / 100) * bioreactor.baseLaborCost;
  const waste = bioreactor.wasteTreatmentCost;
  //  ! Change the below facility to otherFacilityCosts
  const facility = bioreactor.facilityCosts;
  const consumables = bioreactor.consumableCosts;
  const operatingExpenses =
    media + otherMaterials + labor + waste + facility + consumables + utilities;

  // ! The below calc is the operating expense with deprecation (but depreciation has to be in $ and not a ratio so change that below!)
    // const operatingExpenses =
    //   media +
    //   otherMaterials +
    //   labor +
    //   waste +
    //   facility +
    //   consumables +
    //   utilities +
    //   bioreactor.depreciation;

  // Capital expense
  const capitalExpense = bioreactor.capitalExpense;

  // Costs of goods sold
  const cogsWithDepreciation = operatingExpenses / bioreactor.annualProduction;
  const cogsWithoutDepreciation =
    cogsWithDepreciation - bioreactor.depreciation;

  // Facilities needed
  const facilitiesNeeded = Math.ceil(100000000 / bioreactor.annualProduction);

  return {
    annualProduction: bioreactor.annualProduction,
    facilitiesNeeded,
    capitalExpenses: capitalExpense / 1000000, // Convert to millions
    operatingExpenses: operatingExpenses / 1000000, // Convert to millions
    cogsWithDepreciation,
    cogsWithoutDepreciation,
    chartData: {
      media,
      otherMaterials,
      labor,
      waste,
      facility,
      consumables,
      utilities,
    },
  };
}
