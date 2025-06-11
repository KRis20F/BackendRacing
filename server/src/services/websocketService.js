const WebSocket = require('ws');
const tokenService = require('./tokenService');
const { Connection } = require('@solana/web3.js');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.tokenService = tokenService;
    this.connection = this.tokenService.connection;
    this.clients = new Set();
    
    this.init();
    this.startPriceUpdates();
    this.startRacerUpdates();
  }

  init() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      
      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }

  broadcast(data) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  async startPriceUpdates() {
    // Actualizar cada 10 segundos
    setInterval(async () => {
      try {
        // Obtener balance del token y otros datos
        const tokenBalance = await this.tokenService.getTokenBalance(this.tokenService.wallet.publicKey);
        const supply = await this.tokenService.getTokenSupply();
        
        const tokenData = {
          price: tokenBalance, // Aquí deberías implementar la lógica real del precio
          volume: supply * 0.1, // Ejemplo: 10% del supply como volumen
          marketCap: supply * tokenBalance
        };
        
        this.broadcast({
          type: 'price_update',
          data: {
            currentPrice: tokenData.price,
            volume24h: tokenData.volume,
            marketCap: tokenData.marketCap,
            history: await this.getPriceHistory()
          }
        });
      } catch (error) {
        console.error('Error updating price data:', error);
      }
    }, 10000);
  }

  async getPriceHistory() {
    // Por ahora retornamos datos simulados
    // TODO: Implementar historial real desde la base de datos
    return Array.from({ length: 12 }, (_, i) => ({
      name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      metric1: Math.floor(Math.random() * 300 + 200),
      metric2: Math.floor(Math.random() * 200 + 200)
    }));
  }

  async startRacerUpdates() {
    // Actualizar cada 30 segundos
    setInterval(async () => {
      try {
        const activeRacers = await this.getActiveRacers();
        this.broadcast({
          type: 'racers_update',
          data: activeRacers
        });
      } catch (error) {
        console.error('Error updating racer data:', error);
      }
    }, 30000);
  }

  async getActiveRacers() {
    // Implementar lógica para obtener corredores activos
    // Por ahora retornamos datos simulados
    return {
      weeklyData: [
        { name: 'Mon', racers: Math.floor(Math.random() * 300 + 200) },
        { name: 'Tue', racers: Math.floor(Math.random() * 300 + 200) },
        { name: 'Wed', racers: Math.floor(Math.random() * 300 + 200) },
        { name: 'Thu', racers: Math.floor(Math.random() * 300 + 200) },
        { name: 'Fri', racers: Math.floor(Math.random() * 300 + 200) },
        { name: 'Sat', racers: Math.floor(Math.random() * 300 + 200) },
        { name: 'Sun', racers: Math.floor(Math.random() * 300 + 200) }
      ]
    };
  }
}

module.exports = WebSocketService; 