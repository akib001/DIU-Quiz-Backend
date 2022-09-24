require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const cors = require("cors");

const quizRoutes = require('./routes/r_quiz');
const authRoutes = require('./routes/r_auth');

const app = express();



app.use(bodyParser.json()); // application/json
app.use(cookieParser());

app.use(
  cors({
    origin: "*",
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
    credentials: true,
  })
);

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'OPTIONS, GET, POST, PUT, PATCH, DELETE'
//   );
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });

app.use('/quiz', quizRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASS}@node-tutorial.ps5lz.mongodb.net/diuQuiz?retryWrites=true`,  {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(result => {
    app.listen(process.env.PORT || 8080);
  })
  .catch(err => console.log(err));
