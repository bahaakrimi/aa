const mongoose = require("mongoose");
const commandeModel = require("../models/commandeSchema ");
const userModel = require("../models/userSchema");

// ✅ Get all commandes
module.exports.getAllCommande = async (req, res) => {
  try {
    const commandeList = await commandeModel.find();
    if (!commandeList || commandeList.length === 0) {
      return res.status(404).json({ message: "Aucune commande trouvée" });
    }
    res.status(200).json(commandeList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get commande by ID
module.exports.getCommandeById = async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await commandeModel.findById(id)
      .populate("owner")
      .populate("produits");

    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    res.status(200).json(commande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add new commande
module.exports.addCommande = async (req, res) => {
  try {
    const { model, prix, matricule, produit, email } = req.body;

    if (!model || !prix || !matricule || !email) {
      return res.status(400).json({ 
        message: "Données invalides, tous les champs sont requis (model, prix, matricule, email)." 
      });
    }

    const newCommande = new commandeModel({ 
      model, 
      prix, 
      matricule, 
      produits: produit ? [produit] : [], 
      email 
    });
    
    const savedCommande = await newCommande.save();

    res.status(201).json(savedCommande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update commande
module.exports.updateCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const { model, prix, matricule } = req.body;

    const commande = await commandeModel.findById(id);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (!model && !prix && !matricule) {
      return res.status(400).json({ message: "Données invalides, au moins un champ doit être mis à jour." });
    }

    const updatedCommande = await commandeModel.findByIdAndUpdate(
      id,
      { model, prix, matricule },
      { new: true }
    );

    res.status(200).json(updatedCommande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete commande by ID
module.exports.deleteCommandeById = async (req, res) => {
  try {
    const id = req.params.id;

    const commandeById = await commandeModel.findById(id);
    if (!commandeById) {
      throw new Error("Commande introuvable");
    }

    await userModel.updateMany({}, {
      $pull: { commandes: id },
    });

    await commandeModel.findByIdAndDelete(id);

    res.status(200).json("deleted");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Affect commande to user
module.exports.affect = async (req, res) => {
  try {
    const { userId, commandeId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commandeId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "L'ID de la commande ou de l'utilisateur n'est pas valide" });
    }

    const commande = await commandeModel.findById(commandeId);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable dans la base de données" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable dans la base de données" });
    }

    await commandeModel.findByIdAndUpdate(commandeId, { owner: userId });
    await userModel.findByIdAndUpdate(userId, { $push: { commandes: commandeId } });

    const updatedCommande = await commandeModel.findById(commandeId).populate("owner");
    const updatedUser = await userModel.findById(userId).populate("commandes");

    res.status(200).json({ message: "Commande affectée avec succès", commande: updatedCommande, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur: " + error.message });
  }
};

// ✅ Desaffect commande from user
module.exports.desaffect = async (req, res) => {
  try {
    const { userId, commandeId } = req.body;

    const commandeById = await commandeModel.findById(commandeId);
    if (!commandeById) {
      throw new Error("Commande introuvable");
    }

    const checkIfUserExists = await userModel.findById(userId);
    if (!checkIfUserExists) {
      throw new Error("Utilisateur introuvable");
    }

    await commandeModel.findByIdAndUpdate(commandeId, {
      $unset: { owner: 1 },
    });

    await userModel.findByIdAndUpdate(userId, {
      $pull: { commandes: commandeId },
    });

    res.status(200).json('désaffectée');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
