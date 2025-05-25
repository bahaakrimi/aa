const Produit = require("../models/produitModel");

exports.addFeedback = async (req, res) => {
    try {
        const { produitId } = req.params;
        const { rating, comment } = req.body;

        // Validation
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "La note doit être entre 1 et 5 étoiles." });
        }

        const produit = await Produit.findById(produitId);
        if (!produit) {
            return res.status(404).json({ message: "Produit non trouvé." });
        }

        // Ajouter le feedback
        produit.feedbacks.push({ rating, comment });
        await produit.save();

        res.status(201).json({ message: "Feedback ajouté avec succès!", produit });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};