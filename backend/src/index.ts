import dotenv from 'dotenv';

dotenv.config();

// Import all microservices
import './microservices/apigateway/gateway.js';
import './microservices/user/routes.js';
import './microservices/tickets/routes.js';
import './microservices/groups/routes.js';

console.log('SIPNG Backend started - All microservices should be running');
