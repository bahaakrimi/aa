/**
 * Middleware de validation pour les ID de produit
 */
exports.validateProductId = (req, res, next) => {
  const { productId } = req.params;
  
  if (!productId || productId.length !== 24) { // Validation basique pour un ID MongoDB
    return res.status(400).json({
      success: false,
      error: 'ID de produit invalide'
    });
  }
  
  next();
};