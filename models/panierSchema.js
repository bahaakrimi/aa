const mongoose = require("mongoose");

const panierSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // كل مستخدم له سلة واحدة فقط
    },
    produits: [
      {
        produit: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Produit",
          required: true,
        },
        quantite: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false, // تعطيل __v
  }
);

module.exports = mongoose.model("Panier", panierSchema);
