import { ChargeCalculator } from './charge-calculator';

export function calculateMonthCharge(customer, usage, provider) {
  const monthCharge = charge(customer, usage, provider);
  return monthCharge;
}

function charge(customer, usage, provider) {
  return new ChargeCalculator(customer, usage, provider).charge();
}
