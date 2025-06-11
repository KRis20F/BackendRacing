const express = require('express');
const router = express.Router();
const { Car, UserCar } = require('../models/Car');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const carController = require('../controllers/carController');
const sequelize = require('../config/database');

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

// Log para todas las rutas de cars
router.use((req, res, next) => {
  console.log('🚗 [Cars] Ruta accedida:', req.method, req.path);
  next();
});

// GET /api/cars/listings - Obtener listado de autos con sus modelos 3D
router.get('/listings', auth, async (req, res) => {
  console.log('🎯 [Cars] Intentando obtener listings...');
  try {
    console.log('📝 [Cars] Obteniendo listado de autos...');
    
    const [cars] = await sequelize.query(`
      SELECT 
        id,
        name,
        description,
        price,
        category,
        model_path,
        preview_image,
        thumbnail_image,
        specs::text as specs
      FROM "Cars"
      ORDER BY id ASC
    `);

    console.log('📝 [Cars] Autos obtenidos:', cars ? cars.length : 'null');

    if (!cars || cars.length === 0) {
      console.log('⚠️ [Cars] No se encontraron autos');
      return res.json({ listings: [] });
    }

    const listings = cars.map(car => {
      // Convertir specs de texto a objeto JSON si es necesario
      let parsedSpecs = car.specs;
      if (typeof car.specs === 'string') {
        try {
          parsedSpecs = JSON.parse(car.specs);
        } catch (e) {
          console.error('❌ [Cars] Error parseando specs para el auto', car.id, e);
          parsedSpecs = {};
        }
      }

      return {
        id: car.id,
        carId: car.id,
        name: car.name,
        price: car.price,
        seller: car.category,
        stats: parsedSpecs,
        modelPath: car.model_path,
        modelSize: '10MB',
        modelType: 'glb',
        previewImage: car.preview_image,
        thumbnailImage: car.thumbnail_image,
        description: car.description
      };
    });

    console.log('✅ [Cars] Listings procesados correctamente');
    res.json({ listings });
  } catch (error) {
    console.error('❌ [Cars] Error al obtener listings:', error);
    res.status(500).json({ 
      error: 'Error al obtener los autos',
      details: error.message 
    });
  }
});

// Rutas públicas
router.get('/', carController.getAllCars);
router.get('/category/:category', carController.getCarsByCategory);

// Esta ruta debe ir al final para no capturar otras rutas
router.get('/:id', carController.getCarById);

/**
 * @swagger
 * /api/cars/user/{userId}:
 *   get:
 *     summary: Get user's cars (garage)
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Car'
 *                   - type: object
 *                     properties:
 *                       userCarId:
 *                         type: integer
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', auth, carController.getUserCars);

// GET /api/cars/model/:modelId - Obtener modelo 3D específico
router.get('/model/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const modelPath = path.join(__dirname, '..', '..', 'static', 'models3d', `${modelId}.glb`);

    // Verificar si el archivo existe
    if (!fs.existsSync(modelPath)) {
      return res.status(404).json({ error: 'Modelo no encontrado' });
    }

    // Servir el archivo
    res.sendFile(modelPath);
  } catch (error) {
    console.error('Error al obtener modelo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/cars/models - Obtener lista de modelos 3D disponibles
router.get('/models', auth, async (req, res) => {
  try {
    // Obtener los autos del usuario usando el modelo Sequelize
    const userCars = await UserCar.findAll({
      include: [{
        model: Car,
        as: 'carDetails',
        attributes: ['model_path']
      }],
      where: {
        userId: req.user.id
      }
    });

    // Filtrar los modelos que el usuario puede ver
    const userModels = {};
    for (const [modelId, metadata] of Object.entries(MODELS_METADATA)) {
      // Si el modelo está en los autos del usuario, incluirlo
      const isUserCar = userCars.some(uc => 
        uc.carDetails.model_path.includes(modelId)
      );
      
      if (isUserCar) {
        userModels[modelId] = metadata;
      }
    }

    res.json({
      models: userModels
    });
  } catch (error) {
    console.error('Error getting models:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;