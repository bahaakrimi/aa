const multer = require("multer");
const path = require('path');
const fs = require('fs');

// تكوين التخزين
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تحديد مجلد التخزين
    const uploadPath = 'public/files';

    // التأكد من وجود المجلد
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // إنشاء المجلد إذا لم يكن موجودًا
    }

    // تحديد وجهة الملف
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname;
    const fileExtension = path.extname(originalName);
    let fileName = originalName;

    // التحقق إذا كان الملف موجودًا بالفعل، وإذا كان موجودًا نقوم بإضافة فهرس لتسمية الملف
    let fileIndex = 1;
    const uploadPath = 'public/files';
    while (fs.existsSync(path.join(uploadPath, fileName))) {
      const baseName = path.basename(originalName, fileExtension);
      fileName = `${baseName}_${fileIndex}${fileExtension}`;
      fileIndex++;
    }

    // إرسال اسم الملف
    cb(null, fileName);
  }
});

// إعداد `multer` مع التخزين المعد
var uploadfile = multer({ storage: storage });

// تصدير الوحدة لاستخدامها في ملفات أخرى
module.exports = uploadfile;
