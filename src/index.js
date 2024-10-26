export function calculateMonthCharge(customer, usage, provider) {
  const monthCharge = charge(customer, usage, provider);
  return monthCharge;
}

function charge(customer, usage, provider) {
  const baseCharge = customer.baseRate * usage;
  return baseCharge + provider.connectionCharge;
}
