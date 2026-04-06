const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireViewer, requireAnalyst, requireAdmin, canAccessUserData } = require('../middleware/rbac');
const financeService = require('../services/financeService');

// Everything in this router is protected.
router.use(authenticate);

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const record = await financeService.createRecord(req.user.id, req.body);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

router.get('/', requireViewer, canAccessUserData, async (req, res, next) => {
  try {
    const records = await financeService.getRecords(req.query, req.user.id, req.user.role);
    res.json({
      data: records,
      filters: req.query,
      userRole: req.user.role
    });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', requireAnalyst, async (req, res, next) => {
  try {
    const dashboard = await financeService.getDashboardSummary(req.user.id, req.user.role);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
});

router.get('/trends', requireAnalyst, async (req, res, next) => {
  try {
    const trends = await financeService.getTrends(req.query.period, req.user.id, req.user.role);
    res.json(trends);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requireViewer, async (req, res, next) => {
  try {
    const record = await financeService.getRecordById(
      parseInt(req.params.id), 
      req.user.id, 
      req.user.role
    );
    res.json(record);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const record = await financeService.updateRecord(
      parseInt(req.params.id),
      req.body,
      req.user.id,
      req.user.role
    );
    res.json(record);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const result = await financeService.deleteRecord(
      parseInt(req.params.id),
      req.user.id,
      req.user.role
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
