const userModel = require("../models/userSchema");
const commandeModel = require('../models/commandeSchema ');
const jwt = require('jsonwebtoken');
const maxTime = 24 *60 * 60 //24H
//const maxTime = 1 * 60 //1min
const createToken = (id) => {
    return jwt.sign({id},'net secret pfe', {expiresIn: maxTime })
}
//67a73ce6ce362ba943c4c9d3 + net secret pfe + 1m
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Yjc0MjE5ZTFhMTM2OWRlZmZkNzJiMCIsImlhdCI6MTc0MDA2MzI2MCwiZXhwIjoxNzQwNjY4MDYwfQ.38r9wuoAG-Toz_e5yPf1uBdv8bAxgWqU58FaZHUBYeA
module.exports.addUserClient = async (req,res) => {
    try {
        console.log("Données reçues :", req.body);
        console.log("Session :", req.session);

        const { username , email , password , age } = req.body;
        const roleClient = 'client';

        const user = await userModel.create({
            username, email, password, role: roleClient, age
        });

        res.status(200).json({ user });

    } catch (error) {
        console.error("Erreur ajout utilisateur :", error.message);
        res.status(500).json({ message: error.message });
    }
}

module.exports.addUserClientWithImg = async (req,res) => {
    try {
        const {username , email , password } = req.body;
        const roleClient = 'client'
        const {filename} = req.file

        const user = await userModel.create({
            username,email ,password,role :roleClient , user_image : filename
        })
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}



module.exports.addUserAdmin = async (req,res) => {
    try{

        const{ username , email , password , age } = req.body;
        const roleAdmin = 'admin';
        const user = await userModel.create({
            username, email, password, role: roleAdmin , age

        })

        res.status(200).json({user});

    }catch (error) {
        res.status(500).json({message: error.message});

    }
}
module.exports.getAllUsers= async (req,res) => {
    try {
        const userListe = await userModel.find()

        res.status(200).json({userListe});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}
module.exports.getUserById= async (req,res) => {
    try {
        //const id = req.params.id
        const {id} = req.params
        //console.log(req.params.id)
        const user = await userModel.findById(id).populate('panier');

        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}
module.exports.deleteUserById= async (req,res) => {
    try {
        const {id} = req.params

        const checkIfUserExists = await userModel.findById(id);
        if (!checkIfUserExists) {
          throw new Error("User not found");
        }

        await commandeModel.updateMany({owner : id},{
            $unset: { owner: 1 },// null "" 
          });

        await userModel.findByIdAndDelete(id)

        res.status(200).json("deleted");
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}
module.exports.updateuserById = async (req, res) => {
    try {
        const {id} = req.params
        const {email , username , age } = req.body;
    
        await userModel.findByIdAndUpdate(id,{$set : {email , username , age}})
        const updated = await userModel.findById(id)
    
        res.status(200).json({updated})
    } catch (error) {
        res.status(500).json({message: error.message});
    }
    }
    module.exports.searchUserByUsername = async (req, res) => {
        try {
    
            const { username } = req.query
            if(!username){
                throw new Error("Veuillez fournir un nom pour la recherche.");
            }
    
            const userListe = await userModel.find({
                username: {$regex: username , $options: "i"}
            })
    
            if (!userListe) {
                throw new Error("User not found");
              }
              const count = userListe.length
            res.status(200).json({userListe,count})
        } catch (error) {
            res.status(500).json({message: error.message});
        }
        }
        module.exports.getAllUsersSortByAge= async (req,res) => {
            try {
                const userListe = await userModel.find().sort({age : 1}).limit(2)
                //const userListe = await userModel.find().sort({age : -1}).limit(2)
        
                res.status(200).json({userListe});
            } catch (error) {
                res.status(500).json({message: error.message});
            }
        }
        module.exports.getAllUsersAge= async (req,res) => {
            try {
                const {age} = req.params
                const userListe = await userModel.find({ age : age})
        
                res.status(200).json({userListe});
            } catch (error) {
                res.status(500).json({message: error.message});
            }
        }
        module.exports.getAllUsersAgeBetMaxAgeMinAge= async (req,res) => {
            try {
                const MaxAge = req.query.MaxAge
                const MinAge = req.query.MinAge
                const userListe = await userModel.find({age : { $gt : MinAge , $lt : MaxAge}}).sort({age : 1})
        
                res.status(200).json({userListe});
            } catch (error) {
                res.status(500).json({message: error.message});
            }
        }
        module.exports.getAllClient= async (req,res) => {
            try {
    
                const userListe = await userModel.find({role : "client"})
        
                res.status(200).json({userListe});
            } catch (error) {
                res.status(500).json({message: error.message});
            }
        }
        module.exports.getAllAdmin= async (req,res) => {
            try {
    
                const userListe = await userModel.find({role : "admin"})
        
                res.status(200).json({userListe});
            } catch (error) {
                res.status(500).json({message: error.message});
            }
        }
        module.exports.login= async (req,res) => {
            try {
                const { email , password } = req.body;
                const user = await userModel.login(email, password)
                const token = createToken(user._id)
                res.cookie("jwt_token_9antra", token, {httpOnly:false,maxAge:maxTime * 1000})
                res.status(200).json({user})
            } catch (error) {
                res.status(500).json({message: error.message});
            }
        }
        // Dans votre contrôleur d'authentification (authController.js)
module.exports.logout = async (req, res) => {
    try {
        res.clearCookie("jwt_token_9antra", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.status(200).json({ success: true, message: "Déconnexion réussie" });
    } catch (error) {
        console.error("Erreur de déconnexion:", error);
        res.status(500).json({ success: false, message: "Échec de la déconnexion" });
    }
};
// Dans userController.js
exports.getUserCommandes = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate({
        path: 'commandes',
        populate: {
          path: 'produits',
          model: 'Produit'
        }
      });
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(user.commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


