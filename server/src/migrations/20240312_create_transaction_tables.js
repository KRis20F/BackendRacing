const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create billing_transactions table if it doesn't exist
    await queryInterface.createTable('billing_transactions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create car_market_transactions table if it doesn't exist
    await queryInterface.createTable('car_market_transactions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      car_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Cars',
          key: 'id'
        }
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      price: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'RCF'
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending'
      },
      tx_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'sell'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create balance_history table if it doesn't exist
    await queryInterface.createTable('balance_history', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      previous_balance: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false
      },
      new_balance: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false
      },
      change_amount: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false
      },
      change_type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('billing_transactions');
    await queryInterface.dropTable('car_market_transactions');
    await queryInterface.dropTable('balance_history');
  }
}; 