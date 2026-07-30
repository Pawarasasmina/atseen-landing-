import Lead from '../models/Lead.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStats = asyncHandler(async (_req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now); sevenDaysAgo.setUTCDate(now.getUTCDate() - 6); sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setUTCDate(now.getUTCDate() - 29); thirtyDaysAgo.setUTCHours(0, 0, 0, 0);
  const [total, statuses, categories, trend, recent] = await Promise.all([
    Lead.countDocuments(),
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $project: { categories: { $cond: [{ $gt: [{ $size: { $ifNull: ['$niches', []] } }, 0] }, '$niches', ['$creatorCategory']] } } }, { $unwind: '$categories' }, { $group: { _id: '$categories', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Lead.aggregate([{ $match: { submittedAt: { $gte: thirtyDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Lead.find().sort('-submittedAt').limit(6)
  ]);
  const statusCounts = Object.fromEntries(statuses.map(({ _id, count }) => [_id, count]));
  const last7Days = await Lead.countDocuments({ submittedAt: { $gte: sevenDaysAgo } });
  res.json({ success: true, stats: { total, ...statusCounts, last7Days }, categories, trend, recent });
});
