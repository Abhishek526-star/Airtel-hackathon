const Product = require('../../models/Product');

class PricingService {
  /**
   * Server-Authoritative Price Calculation
   * @param {Array} items [{ productId, quantity }]
   * @param {Number} contractDurationMonths 12, 24, or 36
   */
  async calculateQuote(items = [], contractDurationMonths = 12) {
    if (!items || items.length === 0) {
      throw new Error('Quote must contain at least one product.');
    }

    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ productId: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p.productId, p]));

    let baseMrc = 0;
    let totalSetupFee = 0;
    const itemizedDetails = [];

    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new Error(`Product '${item.productId}' not found in catalogue.`);
      }

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const itemMrc = prod.monthlyPrice * quantity;
      const itemSetup = prod.setupFee * quantity;

      baseMrc += itemMrc;
      totalSetupFee += itemSetup;

      itemizedDetails.push({
        product: prod._id,
        productId: prod.productId,
        productName: prod.productName,
        category: prod.category,
        quantity,
        unitMonthlyPrice: prod.monthlyPrice,
        unitSetupFee: prod.setupFee,
        totalItemMrc: itemMrc,
        totalItemSetup: itemSetup,
      });
    }

    // Apply contract duration discounts:
    // 12 months: 0% discount
    // 24 months: 5% discount on MRC
    // 36 months: 10% discount on MRC
    let contractDiscountPercent = 0;
    if (contractDurationMonths === 24) contractDiscountPercent = 5;
    else if (contractDurationMonths === 36) contractDiscountPercent = 10;

    const discountAmount = Math.round(baseMrc * (contractDiscountPercent / 100));
    const discountedMrc = baseMrc - discountAmount;

    // GST Calculation (18% standard Indian GST for telecom & IT services)
    const gstRatePercent = 18;
    const gstMrc = Math.round(discountedMrc * (gstRatePercent / 100));
    const gstSetup = Math.round(totalSetupFee * (gstRatePercent / 100));

    // Total Monthly Amount (recurring)
    const totalMonthlyAmount = discountedMrc + gstMrc;

    // Total One-Time Initial Payable (first month bill + setup fees + setup GST)
    const totalOneTimePayable = totalMonthlyAmount + totalSetupFee + gstSetup;

    return {
      items: itemizedDetails,
      contractDurationMonths,
      contractDiscountPercent,
      baseMrc,
      discountAmount,
      discountedMrc,
      totalSetupFee,
      gstRatePercent,
      gstMrc,
      gstSetup,
      totalMonthlyAmount,
      totalOneTimePayable,
    };
  }
}

module.exports = new PricingService();

