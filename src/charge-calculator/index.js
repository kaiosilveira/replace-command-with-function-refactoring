export class ChargeCalculator {
  constructor(provider) {
    this._provider = provider;
  }

  charge(customer, usage) {
    const baseCharge = customer.baseRate * usage;
    return baseCharge + this._provider.connectionCharge;
  }
}
