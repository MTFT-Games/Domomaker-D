function requiresLogin(req, res, next) {
  if (!req.session.account) {
    return res.redirect('/');
  }
  return next();
}

function requiresLogout(req, res, next) {
  if (req.session.account) {
    return res.redirect('/maker');
  }
  return next();
}

function requiresSecure(req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
}

function bypassSecure(req, res, next) {
  next();
}

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;

if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
