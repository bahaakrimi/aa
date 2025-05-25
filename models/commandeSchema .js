const mongoose = require("mongoose");

const commandeSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },
    prix: { type: Number, required: true },
    matricula: { type: String, required: true },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    produits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produit' }],
    tel: { type: Number, required: true },
    email: { type: String, required: true }, 
    status: {
      type: String,
      enum: ["en_attente", "en_traitement", "livre", "annule"],
      default: "en_attente"
    },
  },
  { timestamps: true }
);

const Commande = mongoose.model("Commande", commandeSchema);

module.exports = Commande;