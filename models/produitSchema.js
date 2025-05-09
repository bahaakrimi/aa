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
    category: { 
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
    }
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