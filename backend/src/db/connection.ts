import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log('✓ Database connected successfully');
    client.release();

    // Create tables if they don't exist
    await createTables();
    console.log('✓ Database tables verified/created');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
}

async function createTables() {
  const queries = [
    // Users table
    `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar_url VARCHAR(500),
      role VARCHAR(50) NOT NULL DEFAULT 'Usuario',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    
    // Groups table
    `
    CREATE TABLE IF NOT EXISTS groups (
      id SERIAL PRIMARY KEY,
      uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      color VARCHAR(7),
      icon VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    
    // Group memberships
    `
    CREATE TABLE IF NOT EXISTS group_members (
      id SERIAL PRIMARY KEY,
      group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, user_id)
    )
    `,
    
    // User permissions (per group)
    `
    CREATE TABLE IF NOT EXISTS user_permissions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      permission VARCHAR(100) NOT NULL,
      granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, group_id, permission)
    )
    `,
    
    // Tickets table
    `
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'todo',
      priority VARCHAR(50) NOT NULL DEFAULT 'medium',
      creator_id INT NOT NULL REFERENCES users(id),
      assigned_to_id INT REFERENCES users(id),
      group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      due_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    
    // Ticket comments
    `
    CREATE TABLE IF NOT EXISTS ticket_comments (
      id SERIAL PRIMARY KEY,
      ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      author_id INT NOT NULL REFERENCES users(id),
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    
    // Ticket history
    `
    CREATE TABLE IF NOT EXISTS ticket_history (
      id SERIAL PRIMARY KEY,
      ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      author_id INT NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    
    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_permissions_group ON user_permissions(group_id)`,
    `CREATE INDEX IF NOT EXISTS idx_tickets_group ON tickets(group_id)`,
    `CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to_id)`,
    `CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticket_id)`,
    `CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket ON ticket_history(ticket_id)`,
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
    } catch (err: any) {
      // Ignore "already exists" errors
      if (!err.message.includes('already exists')) {
        throw err;
      }
    }
  }
}

export default pool;
