const sequelize = require('../config/database');

// Listar autos en venta
const getListings = async (req, res) => {
  try {
    // Primero obtenemos todos los autos disponibles
    const [cars] = await sequelize.query(`
      SELECT 
        c.*,
        COALESCE(mt.price, c.price) as current_price,
        COALESCE(mt.status, 'available') as market_status,
        COALESCE(mt.seller_id, NULL) as seller_id
      FROM "Cars" c
      LEFT JOIN car_market_transactions mt ON c.id = mt.car_id 
        AND (mt.status = 'pending' OR mt.status = 'en_venta')
      ORDER BY c.price ASC
    `);
    
    res.json(cars);
  } catch (error) {
    console.error('Error al obtener listings:', error);
    res.status(500).json({ error: 'Error al obtener los autos disponibles' });
  }
};

// Comprar un auto
const buyCar = async (req, res) => {
  const { listingId, buyerId } = req.body;
  try {
    // 1. Obtener la información del listado
    const [listingRows] = await sequelize.query(`
      SELECT * FROM car_market_transactions WHERE id = ? AND (status = 'en_venta' OR status = 'pending')
    `, { replacements: [listingId] });
    const listing = listingRows[0];
    if (!listing) return res.status(404).json({ error: 'El auto no está disponible para la venta.' });

    // 2. Obtener vendedor y comprador
    const [sellerRows] = await sequelize.query('SELECT * FROM "Users" WHERE id = ?', { replacements: [listing.seller_id] });
    const [buyerRows] = await sequelize.query('SELECT * FROM "Users" WHERE id = ?', { replacements: [buyerId] });
    const seller = sellerRows[0];
    const buyer = buyerRows[0];
    if (!seller || !buyer) return res.status(404).json({ error: 'Vendedor o comprador no encontrado.' });

    // 3. Verificar que el comprador tiene suficientes tokens SPL (simulado, solo consulta balance en Wallet)
    const [buyerWalletRows] = await sequelize.query('SELECT * FROM "Wallets" WHERE userId = ?', { replacements: [buyerId] });
    const [sellerWalletRows] = await sequelize.query('SELECT * FROM "Wallets" WHERE userId = ?', { replacements: [seller.id] });
    const buyerWallet = buyerWalletRows[0];
    const sellerWallet = sellerWalletRows[0];
    if (!buyerWallet) return res.status(400).json({ error: 'El comprador no tiene wallet.' });
    if (!sellerWallet) return res.status(400).json({ error: 'El vendedor no tiene wallet.' });
    if (parseFloat(buyerWallet.balance) < parseFloat(listing.price)) {
      return res.status(400).json({ error: 'Saldo insuficiente para comprar el auto.' });
    }

    // 4. Transferir tokens SPL (simulado: actualizar balances y registrar en token_exchanges)
    // Restar saldo al comprador
    await sequelize.query('UPDATE "Wallets" SET balance = balance - ? WHERE userId = ?', { replacements: [listing.price, buyerId] });
    // Sumar saldo al vendedor
    await sequelize.query('UPDATE "Wallets" SET balance = balance + ? WHERE userId = ?', { replacements: [listing.price, seller.id] });
    // Registrar en token_exchanges
    const signature = require('crypto').randomBytes(32).toString('hex');
    await sequelize.query(`
      INSERT INTO token_exchanges (
        from_addr, to_addr, token, amount, signature, from_username, to_username
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        buyerWallet.address,
        sellerWallet.address,
        process.env.MINT_ADDRES_SOLANA || 'TOKEN',
        listing.price,
        signature,
        buyer.username,
        seller.username
      ]
    });

    // 5. Actualizar el propietario del auto en UserCars
    // Eliminar el auto del vendedor
    await sequelize.query('DELETE FROM "UserCars" WHERE userId = ? AND carId = ?', { replacements: [seller.id, listing.car_id] });
    // Asignar el auto al comprador
    await sequelize.query('INSERT INTO "UserCars" (userId, carId, quantity) VALUES (?, ?, 1)', { replacements: [buyerId, listing.car_id] });

    // 6. Marcar el auto como vendido en car_market_transactions
    await sequelize.query('UPDATE car_market_transactions SET status = ? WHERE id = ?', { replacements: ['vendido', listingId] });

    // 7. Registrar la transacción en el historial (ya se hace en token_exchanges)

    res.json({
      status: 'ok',
      message: 'Compra realizada con éxito',
      carId: listing.car_id,
      buyerId,
      sellerId: seller.id,
      price: listing.price,
      signature
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al realizar la compra', details: error.message });
  }
};

// Vender un auto (listar)
const sellCar = async (req, res) => {
  const { carId, sellerId, price, currency } = req.body;
  await sequelize.query(`
    INSERT INTO car_market_transactions (car_id, seller_id, price, currency, status, tx_type)
    VALUES (?, ?, ?, ?, 'en_venta', 'sell')
  `, { replacements: [carId, sellerId, price, currency] });
  res.json({ status: 'ok', message: 'Auto listado para venta' });
};

module.exports = {
  getListings,
  buyCar,
  sellCar
};