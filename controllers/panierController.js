const Panier = require("../models/panierSchema");
const Produit = require("../models/produitSchema");

// ✅ Ajouter un produit au panier
module.exports.addProduitToCart = async (req, res) => {
  try {
    const { userId, produitId, quantite } = req.body;

    if (!userId || !produitId || !quantite || quantite <= 0) {
      return res.status(400).json({ message: "Données invalides." });
    }

    let panier = await Panier.findOne({ user: userId });

    if (!panier) {
      panier = new Panier({ user: userId, produits: [] });
    }

    const index = panier.produits.findIndex(p => p.produit.toString() === produitId);
    if (index > -1) {
      panier.produits[index].quantite += quantite;
    } else {
      panier.produits.push({ produit: produitId, quantite });
    }

    await panier.save();
    res.status(200).json(panier);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l’ajout : " + error.message });
  }
};

// ✅ Supprimer un produit du panier
module.exports.removeProduitFromCart = async (req, res) => {
  try {
    const { userId, produitId } = req.body;

    if (!userId || !produitId) {
      return res.status(400).json({ message: "ID utilisateur ou produit manquant." });
    }

    const panier = await Panier.findOne({ user: userId });
    if (!panier) return res.status(404).json({ message: "Panier non trouvé" });

    panier.produits = panier.produits.filter(p => p.produit.toString() !== produitId);
    await panier.save();

    res.status(200).json({ message: "Produit retiré du panier", panier });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression : " + error.message });
  }
};

// ✅ Obtenir le contenu du panier
module.exports.getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const panier = await Panier.findOne({ user: userId }).populate("produits.produit");

    if (!panier) return res.status(404).json({ message: "Panier introuvable" });
    res.status(200).json(panier);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération : " + error.message });
  }
};

// ✅ Calculer le total du panier
module.exports.getCartTotal = async (req, res) => {
  try {
    const { userId } = req.params;
    const panier = await Panier.findOne({ user: userId }).populate("produits.produit");

    if (!panier) return res.status(404).json({ message: "Panier introuvable" });

    const total = panier.produits.reduce((acc, item) => {
      if (!item.produit || typeof item.produit.price !== "number") return acc;
      return acc + item.produit.price * item.quantite;
    }, 0);

    res.status(200).json({ total });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du calcul du total : " + error.message });
  }
};
