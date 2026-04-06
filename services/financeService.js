const FinanceRecord = require('../models/finance');
const { ValidationError, NotFoundError } = require('../utils/errors');
const validators = require('../utils/validators');

class FinanceService {
  async createRecord(userId, data) {
    validators.validateFinanceRecord(data);
    
    const record = await FinanceRecord.create({
      userId,
      type: data.type,
      amount: parseFloat(data.amount),
      category: data.category.trim(),
      description: data.description || null,
      date: data.date
    });

    return record;
  }

  async getRecords(filters = {}, userId = null, userRole = 'viewer') {
    // Admins can optionally filter by user; everyone else is pinned to themselves.
    const effectiveUserId = userRole === 'admin' ? (filters.userId || null) : userId;
    
    const records = await FinanceRecord.findAll({
      userId: effectiveUserId,
      type: filters.type,
      category: filters.category,
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: parseInt(filters.limit) || 50,
      offset: parseInt(filters.offset) || 0
    });

    return records;
  }

  async getRecordById(id, userId, userRole) {
    const record = await FinanceRecord.findById(id);
    
    if (!record) {
      throw new NotFoundError('Finance record not found');
    }

    // Hide ownership details and just return not found for disallowed access.
    if (userRole !== 'admin' && record.user_id !== userId) {
      throw new NotFoundError('Finance record not found');
    }

    return record;
  }

  async updateRecord(id, updates, userId, userRole) {
    const record = await this.getRecordById(id, userId, userRole);
    
    // Partial updates are allowed, so only validate provided fields.
    if (updates.type && !['income', 'expense'].includes(updates.type)) {
      throw new ValidationError('Invalid type');
    }
    if (updates.amount && (isNaN(updates.amount) || updates.amount <= 0)) {
      throw new ValidationError('Amount must be positive');
    }

    const updateData = {};
    if (updates.type) updateData.type = updates.type;
    if (updates.amount) updateData.amount = parseFloat(updates.amount);
    if (updates.category) updateData.category = updates.category.trim();
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date) updateData.date = updates.date;

    await FinanceRecord.update(id, updateData);
    
    return await FinanceRecord.findById(id);
  }

  async deleteRecord(id, userId, userRole) {
    const record = await this.getRecordById(id, userId, userRole);
    await FinanceRecord.delete(id);
    return { message: 'Record deleted successfully' };
  }

  // Dashboard helpers live here so routes stay thin.
  async getDashboardSummary(userId = null, userRole = 'viewer') {
    const effectiveUserId = userRole === 'admin' ? null : userId;
    
    const [summary, recentActivity, categoryTotals] = await Promise.all([
      FinanceRecord.getSummary(effectiveUserId),
      FinanceRecord.getRecentActivity(effectiveUserId, 5),
      FinanceRecord.getCategoryTotals(effectiveUserId)
    ]);

    return {
      summary: {
        totalIncome: parseFloat(summary.total_income),
        totalExpenses: parseFloat(summary.total_expenses),
        netBalance: parseFloat(summary.net_balance),
        totalRecords: summary.total_records
      },
      recentActivity,
      categoryBreakdown: this.formatCategoryBreakdown(categoryTotals)
    };
  }

  async getTrends(period = 'monthly', userId = null, userRole = 'viewer') {
    const effectiveUserId = userRole === 'admin' ? null : userId;
    const months = period === 'weekly' ? 4 : 12;
    
    const trends = await FinanceRecord.getMonthlyTrends(effectiveUserId, months);
    
    return trends.map(t => ({
      period: t.month,
      income: parseFloat(t.income),
      expenses: parseFloat(t.expenses),
      net: parseFloat(t.net)
    }));
  }

  formatCategoryBreakdown(totals) {
    const income = {};
    const expense = {};
    
    totals.forEach(item => {
      if (item.type === 'income') {
        income[item.category] = {
          amount: parseFloat(item.total),
          count: item.count
        };
      } else {
        expense[item.category] = {
          amount: parseFloat(item.total),
          count: item.count
        };
      }
    });

    return { income, expense };
  }
}

module.exports = new FinanceService();
