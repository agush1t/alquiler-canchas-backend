const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { engine } = require('express-handlebars');

const apiRoutes = require('./routes');
const viewsRoutes = require('./routes/views.routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.engine(
  'handlebars',
  engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '..', 'views', 'layouts'),
    helpers: {
      eq: (a, b) => a === b,
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '..', 'views'));

app.get('/', (req, res) => res.redirect('/canchas'));
app.use('/', viewsRoutes);
app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
