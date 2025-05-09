const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema({
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Commande",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["carte", "espèce", "virement"],
    required: true,
  },
  status: {
    type: String,
    enum: ["en_attente", "completé", "échoué"],
    default: "en_attente",
  },
}, { timestamps: true });

module.exports = mongoose.model("Paiement", paiementSchema); // التصدير الصحيح