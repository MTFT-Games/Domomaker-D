const { Domo } = require('../models');

/**
 * Renders the app page with any owned domos.
 * @param {Express.Request} req The client request.
 * @param {Express.Response} res The server response.
 */
function makerPage(req, res) {
  return res.render('app', { accountName: req.session.account.username, email: req.session.account.email });
}

/**
 * Creates and saves a new Domo.
 * @param {Express.Request} req The client request.
 * @param {Express.Response} res The server response.
 */
async function makeDomo(req, res) {
  if (!req.body.name || !req.body.age) {
    return res.status(400).json({ error: 'Both name and age are required!' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    owner: req.session.account._id,
  };

  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({ name: newDomo.name, age: newDomo.age });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists!' });
    }
    return res.status(400).json({ error: 'An error occured' });
  }
}

function getDomos(req, res) {
  return Domo.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: 'An error occurred!' });
    }

    return res.json({ domos: docs });
  });
}

module.exports = {
  makerPage,
  makeDomo,
  getDomos,
};
