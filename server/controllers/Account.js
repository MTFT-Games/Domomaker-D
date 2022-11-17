const { Account } = require('../models');

/**
 * Renders the login page.
 * @param {Express.Request} req The client request.
 * @param {Express.Response} res The server response.
 */
function loginPage(req, res) {
  return res.render('login', { csrfToken: req.csrfToken() });
}

/**
 * Renders the password reset page.
 * @param {Express.Request} req The client request.
 * @param {Express.Response} res The server response.
 */
function resetPage(req, res) {
  return res.render('passReset', { accountName: req.session.account.username, email: req.session.account.email });
}

/**
 * Redirects to /
 * @param {Express.Request} req The client request.
 * @param {Express.Response} res The server response.
 */
function logout(req, res) {
  req.session.destroy();
  return res.redirect('/');
}

/**
 *
 * @param {Express.Request} req The client request.
 * @param {Express.Response} res The server response.
 */
function login(req, res) {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
}

/**
 * Saves a new account to the database.
 * @param {Express.Request} req The client request.
 * @param {Express.Response} res The server response.
 */
async function signup(req, res) {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  const email = `${req.body.email}`;

  if (!username || !pass || !pass2 || !email) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash, email });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already in use.' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
}

/**
 * Changes the password of an account.
 * @param {Express.Request} req The client request.
 * @param {Express.Response} res The server response.
 */
async function resetPass(req, res) {
  const username = `${req.session.account.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  const pass3 = `${req.body.pass3}`;

  if (!pass || !pass2 || !pass3) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass2 !== pass3) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  return Account.authenticate(username, pass, async (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong password!' });
    }

    try {
      const hash = await Account.generateHash(pass3);
      const modifiedAccount = account;
      modifiedAccount.password = hash;
      await modifiedAccount.save();

      return res.json({ redirect: '/maker' });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'An error occurred' });
    }
  });
}

/**
 * Generates and sends a csrf token.
 * @param {Express.Request} req The client request.
 * @param {Express.Response} res The server response.
 */
function getToken(req, res) {
  return res.json({ csrfToken: req.csrfToken() });
}

module.exports = {
  loginPage,
  resetPage,
  resetPass,
  login,
  signup,
  logout,
  getToken,
};
