const express = require("express");
const router = express.Router();
const paiementController = require("../controllers/paiementController");

// Créer un paiement
router.post("/createPaiement", paiementController.createPaiement);

// Mettre à jour le statut
router.put("/updateStatus/:id", paiementController.updatePaiementStatus);

// Obtenir tous les paiements
router.get("/", paiementController.getAllPaiements);

module.exports = router;
