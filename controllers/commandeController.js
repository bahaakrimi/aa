const mongoose = require("mongoose");
const commandeModel = require("../models/commandeSchema ");
const userModel = require("../models/userSchema");




const sendEmail = require("../utils/mailer");

exports.createCommande = async (req, res) => {
    try {
        const { model, prix, matricula, owner, produits, tel, email } = req.body;

        // 1. Création de la commande
        const nouvelleCommande = await commandeModel.create({
            model,
            prix,
            matricula,
            owner,
            produits,
            tel,
            email
            // Le status "en_attente" est ajouté automatiquement par le schéma
        });

        // 2. Préparation du contenu de l'email
        const emailAdmin = 'bahaakrimi145@gmail.com';
        const emailSubject = `Nouvelle commande: ${model}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Nouvelle Commande Reçue</h2>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
                    <p><strong>🆔 Référence:</strong> ${matricula}</p>
                    <p><strong>🛒 Produit:</strong> ${model}</p>
                    <p><strong>💰 Prix:</strong> ${prix} DH</p>
                    <hr style="border-top: 1px dashed #ddd;">
                    <p><strong>👤 Client:</strong> ${email}</p>
                    <p><strong>📞 Téléphone:</strong> ${tel}</p>
                    <p><strong>📅 Date:</strong> ${nouvelleCommande.createdAt.toLocaleString()}</p>
                    <p><strong>🔄 Statut:</strong> ${nouvelleCommande.status}</p>
                </div>
                <p style="margin-top: 20px; font-size: 0.9em; color: #7f8c8d;">
                    Connectez-vous à votre dashboard pour traiter cette commande.
                </p>
            </div>
        `;

        // 3. Envoi de l'email (sans attendre la réponse)
        sendEmail(emailAdmin, emailSubject, 'Nouvelle commande', emailHtml)
            .catch(err => console.error("Erreur d'envoi d'email:", err));

        // 4. Réponse au client avec le format demandé
        res.status(201).json({
            _id: nouvelleCommande._id,  // Obligatoire - l'ID de la commande
            message: 'Commande créée',
            success: true,
            commandeId: nouvelleCommande._id,
            reference: nouvelleCommande.matricula,
            status: nouvelleCommande.status,
            createdAt: nouvelleCommande.createdAt
        });

    } catch (error) {
        console.error('Erreur:', error);
        
        // Gestion spécifique des erreurs de validation Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Données de commande invalides',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création de la commande',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


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

module.exports.addCommande = async (req, res) => {
  try {
    const { model, prix, matricule, email, tel, produits } = req.body;

    if (!model || !prix || !matricule || !email || !tel) {
      return res.status(400).json({ 
        message: "Tous les champs sont requis : model, prix, matricule, email, tel" 
      });
    }

    const newCommande = new commandeModel({ 
      model, 
      prix, 
      matricule,
      email,
      tel,
      produits: produits || [],
      status: "en_attente" // Valeur par défaut
    });
    
    const savedCommande = await newCommande.save();
    res.status(201).json(savedCommande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports.updateCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const { model, prix, matricule , status } = req.body;

    const commande = await commandeModel.findById(id);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (!model && !prix && !matricule && !status) {
      return res.status(400).json({ message: "Données invalides, au moins un champ doit être mis à jour." });
    }

    const updatedCommande = await commandeModel.findByIdAndUpdate(
      id,
      { model, prix, matricule , status },
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

    // Mise à jour de la commande avec le propriétaire
    await commandeModel.findByIdAndUpdate(commandeId, { owner: userId });
    
    // Ajout de la commande à l'utilisateur
    await userModel.findByIdAndUpdate(userId, { 
      $addToSet: { commandes: commandeId } // Utilisation de $addToSet pour éviter les doublons
    });

    // Récupération des données mises à jour avec populate
    const updatedCommande = await commandeModel.findById(commandeId)
      .populate("owner")
      .populate("produits");
      
    const updatedUser = await userModel.findById(userId)
      .populate("commandes")
      .populate("panier");

    res.status(200).json({ 
      message: "Commande affectée avec succès", 
      commande: updatedCommande, 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur serveur: " + error.message 
    });
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


