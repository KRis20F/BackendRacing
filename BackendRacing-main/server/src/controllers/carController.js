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

module.exports = {
  getAllCars,
  getCarsByCategory,
  getCarById,
  getUserCars
}; 