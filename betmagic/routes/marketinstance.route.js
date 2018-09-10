const express = require('express');
const router = express.Router();

const marketinstance_controller = require('../controllers/marketinstance.controller');

router.get('/test', marketinstance_controller.test);

router.get('/:id', marketinstance_controller.marketinstance_details);

router.post('/create', marketinstance_controller.marketinstance_create);

router.put('/:id/update', marketinstance_controller.marketinstance_update);

router.delete('/:id/delete', marketinstance_controller.marketinstance_delete);


module.exports = router;