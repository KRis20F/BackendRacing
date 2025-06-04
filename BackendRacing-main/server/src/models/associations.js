const Car = require('./Car');
const User = require('./User');
const UserCar = require('./UserCar');
const CarMarketTransaction = require('./CarMarketTransaction');

// Car associations
Car.hasMany(UserCar, { foreignKey: 'carId' });
Car.hasMany(CarMarketTransaction, { foreignKey: 'car_id' });

// User associations
User.hasMany(UserCar, { foreignKey: 'userId' });
User.hasMany(CarMarketTransaction, { foreignKey: 'seller_id', as: 'seller' });

// UserCar associations
UserCar.belongsTo(Car, { foreignKey: 'carId' });
UserCar.belongsTo(User, { foreignKey: 'userId' });

// CarMarketTransaction associations
CarMarketTransaction.belongsTo(Car, { foreignKey: 'car_id' });
CarMarketTransaction.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

module.exports = {
  Car,
  User,
  UserCar,
  CarMarketTransaction
}; 