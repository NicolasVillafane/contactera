import mongoose from 'mongoose';

const newC = new mongoose.Schema({
  name: String,
  surname: String,
  nickname: String,
  email: String,
  dayB: Number,
  monthB: Number,
  yearB: Number,
  bornDate: String,
  age: String,
  phoneNumber: Number,
  adress: String,
});
export const Contact = mongoose.model('Contact', newC);
