const User = require('./User');
const Car = require('./Car');
const UserCar = require('./UserCar');
const Wallet = require('./Wallet');
const BillingInfo = require('./BillingInfo');
const PaymentCard = require('./PaymentCard');
const RaceResult = require('./RaceResult');
const Bet = require('./Bet');
const CarMarketTransaction = require('./CarMarketTransaction');

// User associations
User.belongsToMany(Car, { 
  through: UserCar,
  foreignKey: 'userId',
  otherKey: 'carId',
  as: 'cars'
});

User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
User.hasOne(BillingInfo, { foreignKey: 'userId' });
BillingInfo.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PaymentCard, { foreignKey: 'userId' });
PaymentCard.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(RaceResult, { foreignKey: 'userId' });
RaceResult.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(RaceResult, { foreignKey: 'rival_id', as: 'rivalRaces' });
User.hasMany(CarMarketTransaction, { 
  foreignKey: 'sellerId',
  as: 'salesTransactions'
});
User.hasMany(CarMarketTransaction, {
  foreignKey: 'buyerId',
  as: 'purchaseTransactions'
});

// Car associations
Car.belongsToMany(User, { 
  through: UserCar,
  foreignKey: 'carId',
  otherKey: 'userId',
  as: 'owners'
});

Car.hasMany(CarMarketTransaction, { foreignKey: 'car_id', as: 'marketListings' });

// UserCar associations
UserCar.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
UserCar.belongsTo(Car, { foreignKey: 'carId', as: 'carDetails' });

// RaceResult associations
RaceResult.belongsTo(User, { foreignKey: 'user_id', as: 'racer' });
RaceResult.belongsTo(User, { foreignKey: 'rival_id', as: 'rivalRacer' });
RaceResult.belongsTo(Bet, { foreignKey: 'bet_id', as: 'raceBet' });

// Bet associations
Bet.belongsTo(User, { foreignKey: 'userId' });

// CarMarketTransaction associations
CarMarketTransaction.belongsTo(User, {
  foreignKey: 'sellerId',
  as: 'seller'
});

CarMarketTransaction.belongsTo(User, {
  foreignKey: 'buyerId',
  as: 'buyer'
});

module.exports = {
  User,
  Car,
  UserCar,
  Wallet,
  BillingInfo,
  PaymentCard,
  RaceResult,
  Bet,
  CarMarketTransaction
}; 