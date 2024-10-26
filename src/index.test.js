import { calculateMonthCharge } from './index';

describe('calculateMonthCharge', () => {
  it('should calculate the charge of a full month', () => {
    const usage = 100;
    const customer = { baseRate: 10 };
    const provider = { connectionCharge: 5 };

    const charge = calculateMonthCharge(customer, usage, provider);

    expect(charge).toBe(1005);
  });
});
