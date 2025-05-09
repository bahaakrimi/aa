var express = require('express');
var router = express.Router();
const commandeController = require('../controllers/commandeController'); // تأكد من اسم الملف

/* Routes pour la gestion des commandes */
router.get('/getAllCommande', commandeController.getAllCommande);
router.get('/getCommandeById/:id', commandeController.getCommandeById);
router.post('/addCommande', commandeController.addCommande);
router.put('/updateCommande/:id', commandeController.updateCommande);
router.put('/affect', commandeController.affect);
router.put('/desaffect', commandeController.desaffect);
router.delete('/deleteCommandeById/:id', commandeController.deleteCommandeById);

module.exports = router;
