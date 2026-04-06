const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Seeder {
  static async seed() {
    console.log('🌱 Seeding database...');
    
    try {
      await this.clearData();
      
      const users = await this.seedUsers();
      
      await this.seedFinanceRecords(users);
      
      console.log('✅ Seeding completed successfully');
      return users;
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  static async clearData() {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('DELETE FROM finance_records', (err) => {
          if (err) reject(err);
        });
        db.run('DELETE FROM users', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  static async seedUsers() {
    const users = [
      {
        email: 'admin@finance.com',
        password: 'admin123',
        name: 'System Admin',
        role: 'admin'
      },
      {
        email: 'analyst@finance.com',
        password: 'analyst123',
        name: 'Finance Analyst',
        role: 'analyst'
      },
      {
        email: 'viewer@finance.com',
        password: 'viewer123',
        name: 'Basic Viewer',
        role: 'viewer'
      },
      {
        email: 'analyst2@finance.com',
        password: 'analyst123',
        name: 'Senior Analyst',
        role: 'analyst'
      }
    ];

    const createdUsers = [];
    
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          [userData.email, hashedPassword, userData.name, userData.role],
          function(err) {
            if (err) reject(err);
            else resolve({
              id: this.lastID,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              plainPassword: userData.password // For testing reference only
            });
          }
        );
      });
      
      createdUsers.push(user);
    }

    console.log(`   Created ${createdUsers.length} users`);
    return createdUsers;
  }

  static async seedFinanceRecords(users) {
    const categories = {
      income: ['Salary', 'Freelance', 'Investments', 'Bonus', 'Refund'],
      expense: ['Rent', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping']
    };

    const records = [];
    const now = new Date();
    
    // Enough history to make the dashboard look populated without going overboard.
    for (let month = 0; month < 6; month++) {
      const date = new Date(now.getFullYear(), now.getMonth() - month, 1);
      
      // Keep the spread a bit random so seed data is not too uniform.
      for (const user of users) {
        const numRecords = Math.floor(Math.random() * 6) + 10;
        
        for (let i = 0; i < numRecords; i++) {
          const isIncome = Math.random() > 0.6; // 40% income, 60% expense
          const type = isIncome ? 'income' : 'expense';
          const categoryList = categories[type];
          const category = categoryList[Math.floor(Math.random() * categoryList.length)];
          
          let amount;
          if (type === 'income') {
            amount = Math.floor(Math.random() * 4000) + 1000;
            if (category === 'Salary') amount = 5000;
          } else {
            amount = Math.floor(Math.random() * 500) + 20;
          }

          const day = Math.floor(Math.random() * 28) + 1;
          const recordDate = new Date(date.getFullYear(), date.getMonth(), day);
          
          records.push({
            user_id: user.id,
            type,
            amount,
            category,
            description: `${category} - ${recordDate.toLocaleDateString()}`,
            date: recordDate.toISOString().split('T')[0]
          });
        }
      }
    }

    for (const record of records) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO finance_records (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
          [record.user_id, record.type, record.amount, record.category, record.description, record.date],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    console.log(`   Created ${records.length} finance records`);
  }

  static async reset() {
    console.log('🧹 Resetting database...');
    await this.clearData();
    console.log('✅ Database cleared');
  }
}

module.exports = Seeder;
