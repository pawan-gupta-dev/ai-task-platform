/**
 * Redis Mock Server for Windows Development
 * Simulates Redis functionality for BullMQ
 * Run: node redis-mock-server.js
 */

const net = require('net');

class RedisMockServer {
  constructor(port = 6379) {
    this.port = port;
    this.data = new Map();
    this.server = net.createServer((socket) => {
      console.log(`[${new Date().toISOString()}] Client connected`);
      
      socket.on('data', (buffer) => {
        const command = buffer.toString('utf-8').trim();
        const response = this.handleRedisCommand(command);
        socket.write(response + '\n');
      });
      
      socket.on('end', () => {
        console.log(`[${new Date().toISOString()}] Client disconnected`);
      });
      
      socket.on('error', (err) => {
        console.error('[ERROR]', err.message);
      });
    });
  }

  handleRedisCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0].toUpperCase();
    
    switch (cmd) {
      case 'PING':
        return '+PONG';
      
      case 'SET': {
        const [, key, value] = parts;
        this.data.set(key, value);
        return '+OK';
      }
      
      case 'GET': {
        const [, key] = parts;
        const value = this.data.get(key);
        return value ? `$${value.length}\r\n${value}` : '$-1';
      }
      
      case 'DEL': {
        const [, key] = parts;
        this.data.delete(key);
        return ':1';
      }
      
      case 'EXISTS': {
        const [, key] = parts;
        return this.data.has(key) ? ':1' : ':0';
      }
      
      case 'LPUSH':
      case 'RPUSH':
      case 'LPOP':
      case 'RPOP':
      case 'LLEN':
        return ':0'; // Mock list operations
      
      case 'ZADD':
      case 'ZRANGE':
      case 'ZCARD':
        return ':0'; // Mock sorted set operations
      
      case 'HSET':
      case 'HGET':
      case 'HGETALL':
        return '+OK'; // Mock hash operations
      
      case 'FLUSHDB':
        this.data.clear();
        return '+OK';
      
      case 'INFO':
        return `# Server\r\nredis_version:7.0.0-mock\r\nredis_mode:standalone`;
      
      case 'QUIT':
        return '+OK';
      
      default:
        console.warn(`[WARN] Unsupported command: ${cmd}`);
        return '-ERR unknown command';
    }
  }

  start() {
    this.server.listen(this.port, '127.0.0.1', () => {
      console.log(`\n✅ Redis Mock Server running on port ${this.port}`);
      console.log('⚠️  This is for development only - not suitable for production');
      console.log('\n📝 Supported commands:');
      console.log('   PING, SET, GET, DEL, EXISTS, LPUSH, RPUSH, LPOP, RPOP');
      console.log('   ZADD, ZRANGE, HSET, HGET, FLUSHDB, INFO, QUIT\n');
    });
  }

  stop() {
    this.server.close(() => {
      console.log('✅ Redis Mock Server stopped');
    });
  }
}

// Start the server
const redis = new RedisMockServer(6379);
redis.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  redis.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  redis.stop();
  process.exit(0);
});
