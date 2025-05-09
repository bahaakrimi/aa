// controllers/produitController.js
const Produit = require("../models/produitSchema");

// ✅ Ajouter un nouveau produit
exports.addProduit = async (req, res) => {
  try {
    const { name, price, category, nbrproduit, image } = req.body;

    if (!name || !price || !nbrproduit) {
      return res.status(400).json({ message: "Le nom, le prix et la quantité sont obligatoires." });
    }

    const newProduit = new Produit({ name, price, category, nbrproduit, image });
    const savedProduit = await newProduit.save();

    res.status(201).json(savedProduit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







// ✅ Supprimer un produit
exports.deleteProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Produit.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Produit non trouvé" });
    res.status(200).json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Recherche des produits par nom
exports.searchProduits = async (req, res) => {
  try {
    const searchQuery = req.query.query;
    const produits = await Produit.find({
      nom: { $regex: searchQuery, $options: "i" }
    });

    res.status(200).json(produits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ إضافة منتج جديد مع صورة
exports.addProduitWithImg = async (req, res) => {
  try {
    const { name, price, category, nbrproduit } = req.body;
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const filename = req.file.filename;

    // Rest of your code remains the same...
    const newProduit = new Produit({
      name,
      price,
      category,
      nbrproduit,
      image: filename
    });

    const savedProduit = await newProduit.save();
    res.status(201).json(savedProduit);
  } catch (error) {
    console.error("Error adding product with image:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ استرجاع جميع المنتجات مع رابط الصورة
exports.getProduitWithImg = async (req, res) => {
  try {
      const produits = await Produit.find();
      if (!produits || produits.length === 0) {
          return res.status(404).json({ message: "لا يوجد منتجات" });
      }

      const produitsWithImgUrl = produits.map(produit => {
          const imageUrl = produit.image
              ? `${req.protocol}://${req.get('host')}/files/${produit.image}`
              : `${req.protocol}://${req.get('host')}/files/default-product.png`;

          return {
              ...produit._doc,
              imageUrl: imageUrl,
          };
      });

      res.status(200).json(produitsWithImgUrl); // ✔ المتغير الصحيح
  } catch (error) {
      console.error("خطأ أثناء جلب المنتجات:", error.message);
      res.status(500).json({ message: error.message });
  }
};
// ✅ Mettre à jour un produit

const fs = require('fs');
const path = require('path');

// Mettre à jour un produit
exports.updateProduit = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Vérifier si le produit existe
        const existingProduit = await Produit.findById(id);
        if (!existingProduit) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }

        // Préparer les données de mise à jour
        const updateData = {
            name: req.body.name || existingProduit.name,
            price: req.body.price || existingProduit.price,
            category: req.body.category || existingProduit.category,
            nbrproduit: req.body.nbrproduit || existingProduit.nbrproduit
        };

        // Gérer l'image si elle est fournie
        if (req.file) {
            // Supprimer l'ancienne image si elle existe
            if (existingProduit.image && existingProduit.image !== 'default-product.png') {
                const oldImagePath = path.join(__dirname, '../public/files', existingProduit.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.image = req.file.filename;
        }

        // Mettre à jour le produit
        const updatedProduit = await Produit.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            ...updatedProduit.toObject(),
            imageUrl: `/files/${updatedProduit.image}`
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        res.status(500).json({ 
            message: "Erreur serveur",
            error: error.message 
        });
    }
};