/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Get all available cars
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: List of all cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   preview_image:
 *                     type: string
 *                   thumbnail_image:
 *                     type: string
 *                   price:
 *                     type: number
 *                   model_path:
 *                     type: string
 *                   category:
 *                     type: string
 *                   specs:
 *                     type: object
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/cars/category/{category}:
 *   get:
 *     summary: Get cars by category
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category of cars to retrieve
 *     responses:
 *       200:
 *         description: List of cars in category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Car'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Get car by ID
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Car ID
 *     responses:
 *       200:
 *         description: Car details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       404:
 *         description: Car not found
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         preview_image:
 *           type: string
 *         thumbnail_image:
 *           type: string
 *         price:
 *           type: number
 *         model_path:
 *           type: string
 *         category:
 *           type: string
 *         specs:
 *           type: object
 *         owned:
 *           type: boolean
 */
const sequelize = require('../config/database');

// Obtener todos los autos disponibles
const getAllCars = async (req, res) => {
  try {
    const [cars] = await sequelize.query(`
      SELECT 
        id,
        name,
        description,
        preview_image,
        thumbnail_image,
        price,
        model_path,
        category,
        specs
      FROM "Cars"
      ORDER BY price ASC
    `);
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los autos' });
  }
};

// Obtener autos por categoría
const getCarsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const [cars] = await sequelize.query(`
      SELECT 
        id,
        name,
        description,
        preview_image,
        thumbnail_image,
        price,
        model_path,
        category,
        specs
      FROM "Cars"
      WHERE category = ?
      ORDER BY price ASC
    `, {
      replacements: [category]
    });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los autos por categoría' });
  }
};

// Obtener un auto específico
const getCarById = async (req, res) => {
  const { id } = req.params;
  try {
    const [cars] = await sequelize.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.preview_image,
        c.thumbnail_image,
        c.price,
        c.model_path,
        c.category,
        c.specs,
        CASE 
          WHEN uc.userId IS NOT NULL THEN true 
          ELSE false 
        END as owned
      FROM "Cars" c
      LEFT JOIN "UserCars" uc ON c.id = uc.carId AND uc.userId = ?
      WHERE c.id = ?
    `, {
      replacements: [req.user.id, id]
    });

    if (cars.length === 0) {
      return res.status(404).json({ error: 'Auto no encontrado' });
    }

    res.json(cars[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el auto' });
  }
};

// Obtener autos del usuario (garage)
const getUserCars = async (req, res) => {
  const { userId } = req.params;
  try {
    const [cars] = await sequelize.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.preview_image,
        c.thumbnail_image,
        c.price,
        c.model_path,
        c.category,
        c.specs,
        uc.id as userCarId
      FROM "Cars" c
      JOIN "UserCars" uc ON c.id = uc.carId
      WHERE uc.userId = ?
    `, {
      replacements: [userId]
    });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los autos del usuario' });
  }
};

// Obtener conteo de autos por categoría
const getCategoryCounts = async (req, res) => {
  try {
    const [counts] = await sequelize.query(`
      SELECT LOWER(category) as category, COUNT(*) as count
      FROM "Cars"
      GROUP BY category
    `);
    res.json(counts);
  } catch (error) {
    console.error('Error en getCategoryCounts:', error);
    res.status(500).json({ error: 'Error al obtener el conteo por categoría', details: error.message });
  }
};

module.exports = {
  getAllCars,
  getCarsByCategory,
  getCarById,
  getUserCars,
  getCategoryCounts
}; 