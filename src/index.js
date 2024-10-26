import { ChargeCalculator } from './charge-calculator';

export function calculateMonthCharge(customer, usage, provider) {
  const monthCharge = new ChargeCalculator(customer, usage, provider).charge;
  return monthCharge;
}
