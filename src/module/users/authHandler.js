const router = require('express').Router();
const { logger } = require('../../core/logger');
const authService = require('./authService');

const { authenticate } = require('./authMiddleware');

const namespace = 'users.authHandler';

router.post('/register', async (req, res) => {
  if (
    typeof req.body.username !== 'string' ||
    req.body.username.length === 0 ||
    typeof req.body.password !== 'string' ||
    req.body.password.length === 0 ||
    typeof req.body.role !== 'string' ||
    req.body.role.length === 0
  ) {
    return res.status(400).json({ status: 'BAD_REQUEST' });
  }

  try {
    const user = {
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
    };
    const data = await authService.registerUser(user);
    return res.json({
      status: 'SUCCESS',
      data,
    });
  } catch (error) {
    logger.error({
      service: `${namespace}.post.register`,
      messaage: error.message,
    });
    return res.status(500).json({ status: 'INTERNAL_SERVER_ERROR' });
  }
});

router.post('/sign-in', async (req, res) => {
  try {
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;

    const verified = await authService.verifyUser(username, password);
    if (verified.status === 'ERROR') {
      return res.json({
        status: 'ERROR',
        message: verified.message,
      });
    }

    const token = authService.generateJWT(verified.data);

    return res.json({
      status: 'SUCCESS',
      data: `Bearer ${token.data}`,
    });
  } catch (error) {
    logger.error({
      service: `${namespace}.post.sign-in`,
      messaage: error.message,
    });
    return res.status(500).json({ status: 'INTERNAL_SERVER_ERROR' });
  }
});

router.get('/guarded', authenticate('ADMIN'), (req, res) => {
  return res.json('access granted');
});

module.exports = router;
