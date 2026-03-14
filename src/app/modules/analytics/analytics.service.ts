import FormularyComparison from '../formulary-comparison/formularyComparison.model';
import FormularyInterchange from '../formulary-comparison/formularyInterchange.model';
import Patient from '../patient/patient.model';
import { User } from '../user/user.model';

const getAppAnalyticsFromDB = async () => {
  const totalActivePatients = await Patient.countDocuments();
  const totalCompletes = await FormularyComparison.countDocuments({
    action: 'accepted',
  });

  // Calculate monthly savings for the current month
  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);

  const monthlySavingsResult = await FormularyComparison.aggregate([
    {
      $match: {
        action: 'accepted',
        createdAt: { $gte: startOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalSavings: { $sum: '$estimatedSavings' },
      },
    },
  ]);

  const monthlySavings =
    monthlySavingsResult.length > 0 ? monthlySavingsResult[0].totalSavings : 0;

  const totalPending = await FormularyComparison.countDocuments({
    action: 'pending',
  });

  return {
    totalActivePatients,
    totalCompletes,
    monthlySavings,
    totalPending,
  };
};

const getDashboardAnalyticsFromDB = async () => {
  const totalUsers = await User.countDocuments();

  const totalCostSavingsResult = await FormularyComparison.aggregate([
    {
      $match: {
        action: 'accepted',
      },
    },
    {
      $group: {
        _id: null,
        totalSavings: { $sum: '$estimatedSavings' },
      },
    },
  ]);

  const totalCostSavings =
    totalCostSavingsResult.length > 0
      ? totalCostSavingsResult[0].totalSavings
      : 0;

  const totalInterchangeMode = await FormularyInterchange.countDocuments();

  return {
    totalUsers,
    totalCostSavings,
    totalInterchangeMode,
  };
};

const getMonthlySavingCostFromDB = async () => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const result = await FormularyComparison.aggregate([
    {
      $match: {
        action: 'accepted',
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        saving: { $sum: '$estimatedSavings' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Map results to the required format with month names, filling in missing months with 0
  const monthlySavingsMap = result.reduce((acc: any, item: any) => {
    acc[item._id] = item.saving;
    return acc;
  }, {});

  const formattedResult = months.map((month, index) => ({
    month,
    saving: monthlySavingsMap[index + 1] || 0,
  }));

  return formattedResult;
};

const getRecommendationAcceptanceRateFromDB = async () => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const result = await FormularyComparison.aggregate([
    {
      $group: {
        _id: { $month: '$createdAt' },
        total: { $count: {} },
        accepted: {
          $sum: {
            $cond: [{ $eq: ['$action', 'accepted'] }, 1, 0],
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Map results to the required format with month names, filling in missing months with 0
  const statsMap = result.reduce((acc: any, item: any) => {
    acc[item._id] = {
      total: item.total,
      accepted: item.accepted,
    };
    return acc;
  }, {});

  const formattedResult = months.map((month, index) => {
    const monthIndex = index + 1;
    const stats = statsMap[monthIndex] || { total: 0, accepted: 0 };
    const acceptanceRate =
      stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0;

    return {
      month,
      acceptanceRate: Math.round(acceptanceRate), // Round to nearest integer for cleaner chart
    };
  });

  return formattedResult;
};

const getRecentActivitiesFromDB = async () => {
  const result = await User.find({ role: 'USER' })
    .sort({ createdAt: -1 })
    .limit(10);

  return result;
};

export const AnalyticsService = {
  getAppAnalyticsFromDB,
  getDashboardAnalyticsFromDB,
  getMonthlySavingCostFromDB,
  getRecommendationAcceptanceRateFromDB,
  getRecentActivitiesFromDB,
};
