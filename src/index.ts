import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Contact } from './contactSchema';
import * as data from './data.json';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

const error400 = {
  status: 400,
  message: 'Bad Request',
};

mongoose.connect(process.env.DB_URL!);

//GET

app.get('/contacts', async (req: Request, res: Response) => {
  try {
    if (req.query) {
      const allContacts = await Contact.find(req.query);
      res.send(allContacts);
    } else {
      const allContacts = await Contact.find({});

      res.send(allContacts);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/contacts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const foundContact = await Contact.findById(id);
    res.send(foundContact);
  } catch (error) {
    res.status(404).send(error);
  }
});

app.get('/about', async (req: Request, res: Response) => {
  res.send(data);
});

//POST

app.post('/contacts', async (req: Request, res: Response) => {
  let fechaHoy: Date | string = new Date();
  const dd = String(fechaHoy.getDate()).padStart(2, '0');
  const mm = String(fechaHoy.getMonth() + 1).padStart(2, '0');
  const yyyy = fechaHoy.getFullYear();

  let dayB = req.body.dayB;
  let monthB = req.body.monthB;
  let yearB = req.body.yearB;

  let edadActual = yyyy - Number(yearB);
  if (mm <= monthB || dd < dayB) {
    edadActual -= 1;
  }

  const newContact = new Contact({
    name: req.body.name,
    surname: req.body.surname,
    nickname: req.body.nickname,
    email: req.body.email,
    bornDate: `${dayB}/${monthB}/${yearB}`,
    age: edadActual,
    phoneNumber: req.body.phoneNumber,
    adress: req.body.adress,
  });

  if (
    dayB <= 31 &&
    monthB <= 12 &&
    yyyy > yearB &&
    req.body.name &&
    req.body.surname &&
    req.body.email &&
    req.body.phoneNumber &&
    req.body.adress
  ) {
    await newContact.save();

    res.json(newContact);
  } else {
    res.status(400);
    res.json(error400);
  }
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
