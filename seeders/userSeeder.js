const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'uc_fmo_db'
};

// Admin users data
const adminUsers = [
  {
    username: 'master_admin',
    email: 'master.admin@uc-bcf.edu.ph',
    role: 'master-admin',
    password: 'admin'
  },
  {
    username: 'citcs_admin',
    email: 'citcs.admin@uc-bcf.edu.ph',
    role: 'citcs-admin',
    password: 'admin'
  },
  {
    username: 'coa_admin',
    email: 'coa.admin@uc-bcf.edu.ph',
    role: 'coa-admin',
    password: 'admin'
  },
  {
    username: 'cas_admin',
    email: 'cas.admin@uc-bcf.edu.ph',
    role: 'cas-admin',
    password: 'admin'
  },
  {
    username: 'cba_admin',
    email: 'cba.admin@uc-bcf.edu.ph',
    role: 'cba-admin',
    password: 'admin'
  },
  {
    username: 'cea_admin',
    email: 'cea.admin@uc-bcf.edu.ph',
    role: 'cea-admin',
    password: 'admin'
  },
  {
    username: 'cht_admin',
    email: 'cht.admin@uc-bcf.edu.ph',
    role: 'cht-admin',
    password: 'admin'
  },
  {
    username: 'con_admin',
    email: 'con.admin@uc-bcf.edu.ph',
    role: 'con-admin',
    password: 'admin'
  },
  {
    username: 'cte_admin',
    email: 'cte.admin@uc-bcf.edu.ph',
    role: 'cte-admin',
    password: 'admin'
  }
];

async function seedUsers() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');

    // Hash passwords and insert users
    for (const user of adminUsers) {
      try {
        // Check if user already exists
        const [existingUsers] = await connection.execute(
          'SELECT id FROM users WHERE username = ? OR email = ?',
          [user.username, user.email]
        );

        if (existingUsers.length > 0) {
          console.log(`User ${user.username} already exists, skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Insert user
        const [result] = await connection.execute(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          [user.username, user.email, hashedPassword, user.role]
        );

        console.log(`✅ Created ${user.role}: ${user.username} (${user.email})`);
        
      } catch (error) {
        console.error(`❌ Error creating user ${user.username}:`, error.message);
      }
    }

    console.log('\n🎉 User seeding completed!');
    console.log('\n📋 Admin Login Credentials:');
    console.log('================================');
    
    adminUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}:`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the seeder
if (require.main === module) {
  seedUsers();
}

module.exports = { seedUsers, adminUsers };
