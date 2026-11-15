export type TaxScenario = { voet: number; grenzen: number[]; tarieven: number[] };
export type TaxResult = { bruto: number; grondslag: number; belasting: number; netto: number };
export function bereken(bruto: number, scenario: TaxScenario): TaxResult;
