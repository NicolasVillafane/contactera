import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Contact } from './contactSchema';
import * as data from './data.json';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  res.status(404); // using response here
  next(err);
});

app.use(
  (
    error: { status: any; message: any },
    req: any,
    res: {
      status: (arg0: any) => void;
      json: (arg0: { error: { message: any } }) => void;
    },
    next: any
  ) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message,
      },
    });
  }
);

mongoose.connect(process.env.DB_URL!);

//GET

app.get('/contacts', async (req: Request, res: Response) => {
  const allContacts = await Contact.find({});
  res.send(allContacts);
});

app.get('/contacts/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const foundContact = await Contact.findById(id);
  res.send(foundContact);
});

app.get('/about', async (req: Request, res: Response) => {
  res.send(data);
});

//POST

app.post('/contacts', async (req: Request, res: Response) => {
  const newContact = new Contact({
    name: req.body.name,
    surname: req.body.surname,
    nickname: req.body.nickname,
    email: req.body.email,
    bornDate: req.body.bornDate,
    age: req.body.age,
    phoneNumber: req.body.phoneNumber,
    adress: req.body.adress,
  });
  await newContact.save();

  res.json(newContact);
});

app.post(`/contacts/:id/mail`, async (req: Request, res: Response) => {
  const { id } = req.params;
  const foundContact = await Contact.findById(id);

  const mailOptions = {
    from: 'teyema1630@hotmail.com',
    to: foundContact!.email,
    subject: req.body.subject,
    text: req.body.text,
  };

  const transporter = nodemailer.createTransport({
    service: 'Hotmail',
    port: 467,
    secure: false, // use SSL
    auth: {
      user: 'teyema1630@hotmail.com',
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(mailOptions);
    }
  });
  res.send(mailOptions);
});

//PUT

app.put(`/contacts/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;
  const contact = await Contact.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  res.send(contact);
});

//DELETE

app.delete(`/contacts/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedContact = await Contact.findByIdAndDelete(id);
  res.send(deletedContact);
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
