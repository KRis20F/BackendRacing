const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const carController = require('../controllers/carController');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

// Metadata de los modelos 3D
const MODELS_METADATA = {
  'dodge_charger_1970_rt': {
    filename: 'dodge_charger_1970_rt.glb',
    size: '1.0MB',
    type: 'muscle'
  },
  '1978_pontiac_firebird_formula': {
    filename: '1978_pontiac_firebird_formula.glb',
    size: '35MB',
    type: 'muscle'
  },
  'formula_1_generico_modelo_exemplo': {
    filename: 'formula_1_generico_modelo_exemplo.glb',
    size: '523KB',
    type: 'formula'
  },
  '2022_porsche_911_gt3_992': {
    filename: '2022_porsche_911_gt3_992.glb',
    size: '16MB',
    type: 'sport'
  },
  'bmw_m3_e46_gtr': {
    filename: 'bmw_m3_e46_gtr.glb',
    size: '7.8MB',
    type: 'sport'
  },
  '2022_lamborghini_huracan_super_trofeo_evo2_carb': {
    filename: '2022_lamborghini_huracan_super_trofeo_evo2_carb.glb',
    size: '18MB',
    type: 'supercar'
  },
  '2011_mosler_super_gt': {
    filename: '2011_mosler_super_gt.glb',
    size: '3.5MB',
    type: 'supercar'
  }
};

// Cache control middleware
const cacheControl = (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=86400');
  next();
};

// Usar compresión para los modelos 3D
router.use('/model', compression());

// Rutas públicas
router.get('/', carController.getAllCars);
router.get('/category/:category', carController.getCarsByCategory);
router.get('/:id', carController.getCarById);

// Rutas protegidas
router.get('/user/:userId', auth, carController.getUserCars);

// GET /api/cars/listings - Obtener listado de autos con sus modelos 3D
router.get('/listings', async (req, res) => {
  try {
    const [cars] = await sequelize.query(`
      SELECT 
        id,
        id as "carId",
        name,
        price,
        category,
        model_path,
        specs->'stats' as stats
      FROM "Cars"
      ORDER BY id ASC
    `);

    const listings = cars.map(({id, carId, name, price, category, stats, model_path}) => {
      const modelId = path.basename(model_path, '.glb');
      const modelMetadata = MODELS_METADATA[modelId] || {};
      
      return {
        id,
        carId, 
        name,
        price,
        seller: category,
        stats,
        modelPath: model_path,
        modelSize: modelMetadata.size,
        modelType: modelMetadata.type
      };
    });

    res.json({ listings });
  } catch (error) {
    console.error('Error al obtener listings:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/cars/model/:modelId - Obtener un modelo 3D específico
router.get('/model/:modelId', cacheControl, (req, res) => {
  const modelId = req.params.modelId;
  const metadata = MODELS_METADATA[modelId];

  if (!metadata) {
    return res.status(404).json({ error: 'Model not found' });
  }

  const filePath = path.join(__dirname, '../models3D', metadata.filename);
  console.log('Trying to access file:', filePath); // Para debugging

  if (!fs.existsSync(filePath)) {
    console.log('File not found at path:', filePath); // Para debugging
    return res.status(404).json({ error: 'Model file not found' });
  }

  res.set({
    'Content-Type': 'model/gltf-binary',
    'Content-Disposition': `attachment; filename="${metadata.filename}"`,
    'Accept-Ranges': 'bytes'
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

// GET /api/cars/models - Obtener lista de modelos 3D disponibles
router.get('/models', (req, res) => {
  res.json({
    models: Object.entries(MODELS_METADATA).map(([id, data]) => ({
      id,
      ...data
    }))
  });
});

module.exports = router;