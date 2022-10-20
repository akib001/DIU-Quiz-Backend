const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
        provider: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            trim: true,
            minlength: 6,
            maxlength: 60,
        },
        name: {
            type: String,
        },
        role: {
            type: String,
            default: 'user'
        },
        avatar: String,
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        }
    }, {timestamps: true}
);

userSchema.methods.generateJWT = function () {
    const token = jwt.sign(
        {
            expiresIn: '12h',
            id: this._id,
            provider: this.provider,
            email: this.email,
            role: this.role
        },
        process.env.accessTokenSecret,
    );
    return token;
};

// userSchema.methods.toJSON = function () {
//   // if not exists avatar1 default
//   const absoluteAvatarFilePath = `${join(__dirname, '../..', process.env.IMAGES_FOLDER_PATH)}${this.avatar}`;
//   const avatar = isValidUrl(this.avatar)
//       ? this.avatar
//       : fs.existsSync(absoluteAvatarFilePath)
//           ? `${process.env.IMAGES_FOLDER_PATH}${this.avatar}`
//           : `${process.env.IMAGES_FOLDER_PATH}avatar2.jpg`;
//
//   return {
//     id: this._id,
//     provider: this.provider,
//     email: this.email,
//     username: this.username,
//     avatar: avatar,
//     name: this.name,
//     role: this.role,
//     createdAt: this.createdAt,
//     updatedAt: this.updatedAt,
//   };
// };
//
// userSchema.methods.registerUser = (newUser, callback) => {
//   bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(newUser.password, salt, (errh, hash) => {
//       if (err) {
//         console.log(err);
//       }
//       // set pasword to hash
//       newUser.password = hash;
//       newUser.save(callback);
//     });
//   });
// };
//
// userSchema.methods.comparePassword = function (candidatePassword, callback) {
//   bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
//     if (err) return callback(err);
//     callback(null, isMatch);
//   });
// };
//
// export async function hashPassword(password) {
//   const saltRounds = 10;
//
//   const hashedPassword = await new Promise((resolve, reject) => {
//     bcrypt.hash(password, saltRounds, function (err, hash) {
//       if (err) reject(err);
//       else resolve(hash);
//     });
//   });
//
//   return hashedPassword;
// }

module.exports = mongoose.model('User', userSchema);
