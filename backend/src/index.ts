import dotenv from 'dotenv';

dotenv.config();

// Import the API Gateway
import './microservices/apigateway/gateway.js';

console.log('SIPNG Backend started - All microservices should be running');
