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
module.exports.searchProduitByName = async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: "Veuillez fournir un nom valide pour la recherche." 
      });
    }

    const produits = await Produit.find({
      name: { $regex: name.trim(), $options: "i" }
    }).lean();

    const produitsAvecImages = produits.map(produit => {
      const imageUrl = produit.image
        ? `${req.protocol}://${req.get('host')}/files/${produit.image}`
        : `${req.protocol}://${req.get('host')}/files/default-product.png`;

      return {
        _id: produit._id,
        name: produit.name,
        price: produit.price,
        imageUrl: imageUrl,
        nbrproduit: produit.nbrproduit
      };
    });

    res.status(200).json({
      success: true,
      count: produitsAvecImages.length,
      produits: produitsAvecImages
    });

  } catch (error) {
    console.error("Erreur de recherche:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur lors de la recherche",
      error: error.message 
    });
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
    const { name, price,promotionprice, category,promotion, nbrproduit } = req.body;
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const filename = req.file.filename;

    // Rest of your code remains the same...
    const newProduit = new Produit({
      name,
      price,
      promotionprice,
      category,
      promotion,
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
      return res.status(404).json({ message: "Aucun produit trouvé" });
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

    res.status(200).json(produitsWithImgUrl);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error.message);
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
exports.filterByPrice = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.query;
        
        // Validation des paramètres
        if (minPrice && isNaN(parseFloat(minPrice))) {
            return res.status(400).json({ message: "Le prix minimum doit être un nombre valide" });
        }
        if (maxPrice && isNaN(parseFloat(maxPrice))) {
            return res.status(400).json({ message: "Le prix maximum doit être un nombre valide" });
        }

        let filter = {};
        
        // Construction du filtre
        if (minPrice && maxPrice) {
            const min = parseFloat(minPrice);
            const max = parseFloat(maxPrice);
            
            if (min > max) {
                return res.status(400).json({ message: "Le prix minimum ne peut pas être supérieur au prix maximum" });
            }
            filter.price = { $gte: min, $lte: max };
        } else if (minPrice) {
            filter.price = { $gte: parseFloat(minPrice) };
        } else if (maxPrice) {
            filter.price = { $lte: parseFloat(maxPrice) };
        }

        // Récupération des produits avec les champs nécessaires
        const produits = await Produit.find(filter)
            .select('name price promotionprice category nbrproduit image')
            .lean();

        // Ajout de l'URL complète de l'image pour chaque produit
        const produitsWithImageUrl = produits.map(produit => ({
            ...produit,
            imageUrl: produit.image 
                ? `${req.protocol}://${req.get('host')}/files/${produit.image}`
                : `${req.protocol}://${req.get('host')}/files/default-product.png`
        }));

        res.status(200).json(produitsWithImageUrl);
    } catch (error) {
        console.error("Erreur dans filterByPrice:", error);
        res.status(500).json({ 
            message: "Erreur serveur lors du filtrage des produits",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};