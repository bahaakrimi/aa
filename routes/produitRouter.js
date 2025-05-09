const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');
const upload = require('../middlewares/uploadFile');
// تعريف المسارين بشكل صحيح
router.post('/addProduitWithImg', upload.single("image_produit"), produitController.addProduitWithImg);
router.get('/with-images', produitController.getProduitWithImg);
router.put('/updateProduit/:id', produitController.updateProduit);
router.delete('/deleteProduit/:id', produitController.deleteProduit);

module.exports = router;