const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');
const upload = require('../middlewares/uploadFile');
// تعريف المسارين بشكل صحيح
router.post('/addProduitWithImg', upload.single("image_produit"), produitController.addProduitWithImg);
router.get('/with-images', produitController.getProduitWithImg);
router.put('/updateProduit/:id', produitController.updateProduit);
router.delete('/deleteProduit/:id', produitController.deleteProduit);
router.get('/searchProduitByName', produitController.searchProduitByName);
router.get('/filter', produitController.filterByPrice);
router.post("/addFeedback/:produitId", produitController.addFeedback);


module.exports = router;