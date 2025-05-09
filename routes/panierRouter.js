const express = require("express");
const router = express.Router();
const panierController = require("../controllers/panierController");

// ✅ Ajouter un produit au panier
router.post("/add", panierController.addProduitToCart);

// ✅ Supprimer un produit du panier
router.post("/remove", panierController.removeProduitFromCart);

// ✅ Obtenir le contenu du panier d’un utilisateur
router.get("/user/:userId", panierController.getCartByUser);

// ✅ Calculer le total du panier d’un utilisateur
router.get("/user/:userId/total", panierController.getCartTotal);

module.exports = router;
