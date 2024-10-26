export class ChargeCalculator {
  constructor(usage, provider) {
    this._usage = usage;
    this._provider = provider;
  }

  charge(customer) {
    const baseCharge = customer.baseRate * this._usage;
    return baseCharge + this._provider.connectionCharge;
  }
}
