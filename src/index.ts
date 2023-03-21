import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Contact } from './contactSchema';
import { User } from './userSchema';
import * as data from './data.json';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import amqp from 'amqplib/callback_api';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { isLoggedIn } from './middleware';

const app = express();

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.currentUser = req.user;
  next();
});

const error400 = {
  status: 400,
  message: 'Bad Request',
};

mongoose.connect(process.env.DB_URL!);

//GET

app.get('/contacts', isLoggedIn, async (req: Request, res: Response) => {
  try {
    if (req.query) {
      const allContacts = await Contact.find(req.query);

      res.send(allContacts);
      queue(req);
    } else {
      const allContacts = await Contact.find({});

      res.json(allContacts);
      queue(req);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/contacts/:id', isLoggedIn, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const foundContact = await Contact.findById(id);
    res.send(foundContact);
    queue(req);
  } catch (error) {
    res.status(404).send(error);
  }
});

app.get('/about', async (req: Request, res: Response) => {
  res.send(data);
  queue(req);
});

app.get('/logout', async (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    console.log('logged out');
    res.redirect('/home');
  });
});

//POST

app.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return err;
      res.redirect('/contacts');
    });
  }
);

app.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
  }),
  (req: Request, res: Response) => {
    console.log('logged in!'), res.redirect('/contacts');
  }
);

app.post('/contacts', isLoggedIn, async (req: Request, res: Response) => {
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
    dayB: req.body.dayB,
    monthB: req.body.monthB,
    yearB: req.body.yearB,
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
    queue(req);
  } else {
    res.status(400);
    res.json(error400);
  }
});

app.post(
  `/contacts/:id/mail`,
  isLoggedIn,
  async (req: Request, res: Response) => {
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
    queue(req);
  }
);

//PUT

app.put(`/contacts/:id`, isLoggedIn, async (req: Request, res: Response) => {
  const { id } = req.params;
  const contact = await Contact.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  res.send(contact);
  queue(req);
});

//DELETE

app.delete(`/contacts/:id`, isLoggedIn, async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedContact = await Contact.findByIdAndDelete(id);
  res.send(deletedContact);
  queue(req);
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});

const queue = (req: Request) => {
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      let date = new Date();
      let event = {};

      event = {
        dateTime: date,
        userId: Math.random().toString(36).slice(2),
        uri: req.url,
        method: req.method,
        payload: {
          name: req.body.name,
          surname: req.body.surname,
          nickname: req.body.nickname,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          adress: req.body.adress,
        },
        parameters: req.query,
      };

      var queue = 'hello';
      var msg = `${req.method}`;

      channel.assertQueue(queue, {
        durable: false,
      });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(event)));

      console.log(' [x] Sent %s', event);
    });
  });
};
