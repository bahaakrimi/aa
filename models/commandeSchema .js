const mongoose = require("mongoose");

const commandeSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },
    prix: { type: Number, required: true },
    matricule: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    produits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produit' }],
    email: { type: String, required: true } // Nouveau champ email ajouté
  },
  { timestamps: true }
);

const Commande = mongoose.model("Commande", commandeSchema);

module.exports = Commande;