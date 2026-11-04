const Product = require('../models/Product');

// @desc    Get all catalogue products with filtering
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { category, cityTier, gstinOnly, search } = req.query;
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (cityTier) {
      query.cityTier = { $in: [cityTier, 'Tier 1 / Tier 2 / Tier 3', 'Tier 1 / Tier 2'] };
    }

    if (gstinOnly === 'true') {
      query.gstinRequired = true;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ category: 1, monthlyPrice: 1 });

    res.status(200).json({
      success: true,
      message: `Retrieved ${products.length} products.`,
      data: products,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [{ productId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product '${req.params.id}' not found.`,
        data: null,
        error: { code: 'PRODUCT_NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product retrieved.',
      data: product,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate product bundle selection dependencies & tier constraints
// @route   POST /api/products/validate-selection
// @access  Public
exports.validateSelection = async (req, res, next) => {
  try {
    const { productIds = [], cityTier = 'Tier 1', hasGstin = false } = req.body;

    const products = await Product.find({ productId: { $in: productIds } });
    const selectedProductIds = new Set(products.map((p) => p.productId));

    const errors = [];
    const warnings = [];

    for (const prod of products) {
      // Check GSTIN Requirement
      if (prod.gstinRequired && !hasGstin) {
        errors.push({
          productId: prod.productId,
          productName: prod.productName,
          issue: `Product requires a verified GSTIN registration.`,
        });
      }

      // Check City Tier
      const isTierValid = prod.cityTier.some((t) => t.includes(cityTier));
      if (!isTierValid) {
        errors.push({
          productId: prod.productId,
          productName: prod.productName,
          issue: `Product is not available in ${cityTier}.`,
        });
      }

      // Check Dependencies
      if (prod.dependencies && prod.dependencies.length > 0) {
        const hasDependencyMet = prod.dependencies.some((dep) => selectedProductIds.has(dep));
        if (!hasDependencyMet) {
          errors.push({
            productId: prod.productId,
            productName: prod.productName,
            issue: `Prerequisite service missing. Requires at least one of: ${prod.dependencies.join(', ')}.`,
          });
        }
      }
    }

    const isValid = errors.length === 0;

    res.status(200).json({
      success: true,
      message: isValid ? 'Product selection is valid.' : 'Selection contains constraint violations.',
      data: {
        isValid,
        errors,
        warnings,
        validatedProducts: products,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
