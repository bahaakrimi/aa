const mongoose = require("mongoose");

const produitSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "اسم المنتج مطلوب"],
        trim: true
    },
    price: { 
        type: Number, 
        required: [true, "سعر المنتج مطلوب"],
        min: [0, "السعر لا يمكن أن يكون سالباً"]
    },
    promotionprice
    : { 
        type: Number, 
        required: [true, "سعر المنتج مطلوب"],
       
    },
    
    category: { 
        type: String,
        trim: true
    },
    promotion: { 
        type: String,
        trim: true
    },
    nbrproduit: { 
        type: Number, 
        required: [true, "الكمية المتاحة مطلوبة"],
        min: [0, "الكمية لا يمكن أن تكون سالبة"]
    },
    image: {
        type: String,
        default: "default-product.png"
    },
    feedbacks: [{
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now }
    }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    commandes: [{ 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Commande' 
        }],
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, // لإضافة الحقول الافتراضية عند التحويل إلى JSON
    toObject: { virtuals: true }
});

// حقل افتراضي لرابط الصورة (لا يتم تخزينه في قاعدة البيانات)
produitSchema.virtual('imageUrl').get(function() {
    return this.image 
        ? `/files/${this.image}`
        : '/files/default-product.png';
});

const Produit = mongoose.model("Produit", produitSchema);
module.exports = Produit;