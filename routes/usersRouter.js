const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/uploadFile');
const { requireAuthUser } = require('../middlewares/authMiddleware');

// ✅ Auth & Register
router.post('/login', userController.login);
router.post('/logout',userController.logout); 
router.post('/addUserClient', userController.addUserClient);
router.post('/addUserAdmin', userController.addUserAdmin);
router.post('/addUserClientWithImg', upload.single("image_user"), userController.addUserClientWithImg);

// ✅ Get users (certaines protégées par session)
router.get('/getAllUsers', requireAuthUser, userController.getAllUsers);
router.get('/getUserById/:id', userController.getUserById);
router.get('/searchUserByUsername', userController.searchUserByUsername);
router.get('/getAllUsersSortByAge', userController.getAllUsersSortByAge);
router.get('/getAllUsersAge/:age', userController.getAllUsersAge);
router.get('/getAllUsersAgeBetMaxAgeMinAge', userController.getAllUsersAgeBetMaxAgeMinAge);
router.get('/getAllClient', userController.getAllClient);
router.get('/getAllAdmin', userController.getAllAdmin);

// Dans votre fichier de routes (ex: userRoutes.js)
router.get('/:userId/commandes', userController.getUserCommandes);

// ✅ Update & Delete
router.put('/updateuserById/:id', userController.updateuserById);
router.delete('/deleteUserById/:id', requireAuthUser, userController.deleteUserById); // الحذف يحتاج صلاحيات

module.exports = router;
