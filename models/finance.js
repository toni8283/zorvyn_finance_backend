const db = require('../config/database');

class FinanceRecord {
  static async create({ userId, type, amount, category, description, date }) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO finance_records (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, type, amount, category, description, date],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, userId, type, amount, category, description, date });
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT fr.*, u.name as user_name, u.email 
         FROM finance_records fr 
         JOIN users u ON fr.user_id = u.id 
         WHERE fr.id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async findAll({ userId, type, category, startDate, endDate, limit = 50, offset = 0 }) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT fr.*, u.name as user_name, u.email 
        FROM finance_records fr 
        JOIN users u ON fr.user_id = u.id 
        WHERE 1=1
      `;
      const params = [];

      if (userId) {
        query += ' AND fr.user_id = ?';
        params.push(userId);
      }
      if (type) {
        query += ' AND fr.type = ?';
        params.push(type);
      }
      if (category) {
        query += ' AND fr.category = ?';
        params.push(category);
      }
      if (startDate) {
        query += ' AND fr.date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND fr.date <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY fr.date DESC, fr.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async update(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE finance_records SET ${fields} WHERE id = ?`,
        [...values, id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM finance_records WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Analytics methods
  static async getSummary(userId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net_balance,
          COUNT(*) as total_records
        FROM finance_records
      `;
      const params = [];

      if (userId) {
        query += ' WHERE user_id = ?';
        params.push(userId);
      }

      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async getCategoryTotals(userId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          category,
          type,
          SUM(amount) as total,
          COUNT(*) as count
        FROM finance_records
      `;
      const params = [];

      if (userId) {
        query += ' WHERE user_id = ?';
        params.push(userId);
      }

      query += ' GROUP BY category, type ORDER BY total DESC';

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getMonthlyTrends(userId = null, months = 12) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          strftime('%Y-%m', date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
          SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net
        FROM finance_records
      `;
      const params = [];

      if (userId) {
        query += ' WHERE user_id = ?';
        params.push(userId);
      }

      query += `
        GROUP BY month 
        ORDER BY month DESC 
        LIMIT ?
      `;
      params.push(months);

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getRecentActivity(userId = null, limit = 10) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT fr.*, u.name as user_name 
        FROM finance_records fr 
        JOIN users u ON fr.user_id = u.id
      `;
      const params = [];

      if (userId) {
        query += ' WHERE fr.user_id = ?';
        params.push(userId);
      }

      query += ' ORDER BY fr.created_at DESC LIMIT ?';
      params.push(limit);

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = FinanceRecord;