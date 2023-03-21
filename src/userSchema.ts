import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const newU = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
});

newU.plugin(passportLocalMongoose);

export const User = mongoose.model('User', newU);
