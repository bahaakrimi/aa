const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
        },
        
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address']
        },
        password: {
            type: String,
            required: true,
            minLength: 8,
            match: [
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
                "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one digit, and one special character.",
            ],
        },
        role: {
            type: String,
            enum: ["admin", "client"],
        },
        user_image: {
            type: String,
            default: "client.png",
            required: false,
        },
        age : {type : Number},
        count: {
            type: Number,
          
        },
        commande: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Commande' }], // one to many
         // produits : {type : mongoose.Schema.Types.ObjectId,ref: 'produits'} ,//one to one
         panier: { type: mongoose.Schema.Types.ObjectId, ref: 'Panier' }, // ✅ relation 1:1
        
         etat:  Boolean,
         ban: Boolean,
    },
    { timestamps: true } 
);

// Hash password before saving
userSchema.pre("save", async function ( next) {
    try {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
        user.etat=false; 
        this.count = (this.count || 0) + 1;
        next();
    } catch (error) {
        next(error);
    }
});

// Log when user is created
userSchema.post("save", function () {
    console.log("User Created & Saved successfully");
});
userSchema.statics.login = async function (email, password) {
    //console.log(email, password);
    const user = await this.findOne({ email });
    //console.log(user)
    if (user) {
      const auth = await bcrypt.compare(password,user.password);
      //console.log(auth)
      if (auth) {
        // if (user.etat === true) {
        //   if (user.ban === false) {
            return user;
        //   } else {
        //     throw new Error("ban");
        //   }
        // } else {
        //   throw new Error("compte desactive ");
        // }
      } else {
        throw new Error("password invalid"); 
      }
    } else {
      throw new Error("email not found");
    }
};

const user = mongoose.model("User", userSchema);
module.exports = user;
