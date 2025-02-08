import express from 'express';
import { authMiddleware } from './authMiddleware.js'
var router = express.Router();

/* GET home page. */
router.get('/', authMiddleware, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

export default router;
