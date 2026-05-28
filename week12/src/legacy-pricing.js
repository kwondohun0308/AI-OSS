function parseLegacyOrder(orderText = '') {
  const parts = String(orderText)
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

  const order = {
    sku: '',
    price: 0,
    qty: 1,
    coupon: '',
    customerType: 'standard',
  };

  for (const part of parts) {
    if (!part.includes('=')) {
      order.sku = part;
      continue;
    }

    const [rawKey, ...rest] = part.split('=');
    const key = rawKey.trim();
    const value = rest.join('=').trim();

    if (key === 'price') {
      order.price = Number(value) || 0;
    } else if (key === 'qty') {
      order.qty = Number.parseInt(value, 10) || 1;
    } else if (key === 'coupon') {
      order.coupon = value;
    } else if (key === 'customerType') {
      order.customerType = value || 'standard';
    }
  }

  return order;
}

function resolveDiscountPercent(order) {
  if (order.coupon === 'SAVE10') {
    return 10;
  }

  if (order.customerType === 'vip') {
    return 5;
  }

  return 0;
}

function calculateOrderTotal(order) {
  const subtotal = Number(order.price || 0) * Number(order.qty || 0);
  const discountPercent = resolveDiscountPercent(order);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const finalTotal = subtotal - discountAmount;

  return {
    subtotal,
    discountPercent,
    discountAmount,
    finalTotal,
  };
}

function formatCurrency(amount, currency = 'KRW') {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

module.exports = {
  parseLegacyOrder,
  resolveDiscountPercent,
  calculateOrderTotal,
  formatCurrency,
};