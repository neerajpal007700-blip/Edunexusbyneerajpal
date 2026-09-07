const r=require('express').Router();
const PYQ=require('../models/PYQ');
const MockTest=require('../models/MockTest');const crud=require('./crud.routes');r.use('/notes',crud(require('../models/Note')));r.use('/mindmaps',crud(require('../models/MindMap')));r.use('/live-classes',crud(require('../models/LiveClass')));r.use('/videos',crud(require('../models/Video')));r.use('/quizzes',crud(require('../models/Quiz')));module.exports=r;

r.use('/pyqs',crud(PYQ));
r.use('/mock-tests',crud(MockTest));
