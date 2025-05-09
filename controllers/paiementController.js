const Paiement = require("../models/paiementSchema");
const Commande = require("../models/commandeSchema ");

// 🔹 إنشاء دفع جديد (مُحسّن)
exports.createPaiement = async (req, res) => {
  try {
    const { commandeId, paymentMethod, userId } = req.body; // أضفنا userId

    // التحقق من وجود البيانات المطلوبة
    if (!commandeId || !paymentMethod) {
      return res.status(400).json({ message: "Veuillez fournir tous les champs requis." });
    }

    // التحقق من صحة طريقة الدفع
    const methodesValides = ['carte', 'espèce', 'virement'];
    if (!methodesValides.includes(paymentMethod)) {
      return res.status(400).json({ message: "Méthode de paiement non valide." });
    }

    // البحث عن الطلب والتأكد من وجوده
    const commande = await Commande.findById(commandeId);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable." });
    }

    // إنشاء الدفع مع الربط بالمستخدم
    const paiement = new Paiement({
      commande: commandeId,
      paymentMethod,
      user: userId, // إضافة مرجع المستخدم
      status: "en_attente" // توحيد تسمية الحالة
    });

    const savedPaiement = await paiement.save();
    
    // تحديث حالة الطلب
    await Commande.findByIdAndUpdate(commandeId, { status: "en_traitement" });

    res.status(201).json(savedPaiement);
  } catch (error) {
    console.error("Erreur création paiement:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du paiement." });
  }
};

// 🔹 تحديث حالة الدفع (مُحسّن)
exports.updatePaiementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // التحقق من القيم المسموحة
    const statutsValides = ['en_attente', 'completé', 'échoué', 'remboursé'];
    if (!statutsValides.includes(status)) {
      return res.status(400).json({ message: "Statut de paiement non valide." });
    }

    const paiement = await Paiement.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true, runValidators: true }
    ).populate('commande');

    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé." });
    }

    // تحديث حالة الطلب تلقائياً عند اكتمال الدفع
    if (status === 'completé') {
      await Commande.findByIdAndUpdate(
        paiement.commande._id, 
        { status: "livré" }
      );
    }

    res.status(200).json(paiement);
  } catch (error) {
    console.error("Erreur mise à jour paiement:", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du paiement." });
  }
};

// 🔹 الحصول على جميع المدفوعات (مُحسّن)
exports.getAllPaiements = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const paiements = await Paiement.find()
      .populate({
        path: 'commande',
        populate: { path: 'user' }
      })
      .populate('user')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Paiement.countDocuments();

    res.status(200).json({
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      paiements
    });
  } catch (error) {
    console.error("Erreur récupération paiements:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des paiements." });
  }
};