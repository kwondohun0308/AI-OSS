const {
  parseLegacyOrder,
  resolveDiscountPercent,
  calculateOrderTotal,
  formatCurrency,
} = require('../src/legacy-pricing');

describe('legacy pricing', () => {
  test('parses the legacy order string', () => {
    const order = parseLegacyOrder('SKU-9|price=1250|qty=3|coupon=SAVE10|customerType=vip');

    expect(order).toEqual({
      sku: 'SKU-9',
      price: 1250,
      qty: 3,
      coupon: 'SAVE10',
      customerType: 'vip',
    });
  });

  test('falls back to defaults when the legacy string is empty', () => {
    expect(parseLegacyOrder()).toEqual({
      sku: '',
      price: 0,
      qty: 1,
      coupon: '',
      customerType: 'standard',
    });
  });

  test('resolves discount percent by coupon and customer type', () => {
    expect(resolveDiscountPercent({ coupon: 'SAVE10', customerType: 'standard' })).toBe(10);
    expect(resolveDiscountPercent({ coupon: '', customerType: 'vip' })).toBe(5);
    expect(resolveDiscountPercent({ coupon: '', customerType: 'standard' })).toBe(0);
  });

  test('calculates totals with discounts', () => {
    const totals = calculateOrderTotal({ price: 1000, qty: 2, coupon: 'SAVE10', customerType: 'standard' });

    expect(totals).toEqual({
      subtotal: 2000,
      discountPercent: 10,
      discountAmount: 200,
      finalTotal: 1800,
    });
  });

  test('formats money for the dashboard', () => {
    expect(formatCurrency(1800)).toContain('₩');
    expect(formatCurrency(1800, 'USD')).toContain('$');
  });

  test('handles zero and empty legacy fields safely', () => {
    const order = parseLegacyOrder('SKU-0|price=0|qty=0|coupon=|customerType=');

    expect(order).toEqual({
      sku: 'SKU-0',
      price: 0,
      qty: 1,
      coupon: '',
      customerType: 'standard',
    });
    expect(calculateOrderTotal(order)).toEqual({
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      finalTotal: 0,
    });
  });
});