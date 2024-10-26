import { ChargeCalculator } from './index';

describe('ChargeCalculator', () => {
  it('calculates the charge', () => {
    const usage = 100;
    const customer = { baseRate: 10 };
    const provider = { connectionCharge: 5 };

    const chargeCalculator = new ChargeCalculator(provider);

    expect(chargeCalculator.charge(customer, usage)).toBe(1005);
  });
});
