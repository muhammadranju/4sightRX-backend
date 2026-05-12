import mongoose from 'mongoose';
import config from '../../../config';
import getRelativeTime from '../../../util/relativeTime';
import { Activity } from '../activity/activity.model';
import FormularyComparison from '../formulary-comparison/formularyComparison.model';
import FormularyInterchange from '../formulary-comparison/formularyInterchange.model';
import Patient from '../patient/patient.model';
import { User } from '../user/user.model';

const getAppAnalyticsFromDB = async (organizationId?: string) => {
  const query: any = { status: 'ACTIVE' };
  if (organizationId) query.organizationId = organizationId;
  const totalActivePatients = await Patient.countDocuments(query);

  const compQuery: any = { action: 'accepted' };
  if (organizationId) compQuery.organizationId = organizationId;
  const totalCompletes = await FormularyComparison.countDocuments(compQuery);

  // Calculate monthly savings for the current month
  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);

  const match: any = {
    action: 'accepted',
    createdAt: { $gte: startOfMonth },
  };
  if (organizationId) {
    match.organizationId = new mongoose.Types.ObjectId(organizationId);
  }

  const monthlySavingsResult = await FormularyComparison.aggregate([
    {
      $match: match,
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

  const pendingQuery: any = { action: 'pending' };
  if (organizationId) pendingQuery.organizationId = organizationId;
  const totalPending = await FormularyComparison.countDocuments(pendingQuery);

  return {
    totalActivePatients,
    totalCompletes,
    monthlySavings,
    totalPending,
  };
};

const getDashboardAnalyticsFromDB = async (organizationId?: string) => {
  const userQuery: any = {};
  if (organizationId) userQuery.organizationId = organizationId;
  const totalUsers = await User.countDocuments(userQuery);

  const patientQuery: any = { status: 'ACTIVE' };
  if (organizationId) patientQuery.organizationId = organizationId;
  const totalActivePatients = await Patient.countDocuments(patientQuery);

  const match: any = { action: 'accepted' };
  if (organizationId) {
    match.organizationId = new mongoose.Types.ObjectId(organizationId);
  }

  const totalCostSavingsResult = await FormularyComparison.aggregate([
    {
      $match: match,
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

  const interchangeQuery: any = {};
  if (organizationId) interchangeQuery.organizationId = organizationId;
  const totalInterchangeMode = await FormularyInterchange.countDocuments(interchangeQuery);

  return {
    totalUsers,
    totalCostSavings,
    totalActivePatients,
    totalInterchangeMode,
  };
};

const getMonthlySavingCostFromDB = async (organizationId?: string) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const match: any = { action: 'accepted' };
  if (organizationId) {
    match.organizationId = new mongoose.Types.ObjectId(organizationId);
  }

  const result = await FormularyComparison.aggregate([
    {
      $match: match,
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

const getOrganizationSavingsMetrics = async (organizationId: string) => {
  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);

  const orgId = organizationId ? new mongoose.Types.ObjectId(organizationId) : null;

  // Total Monthly Savings
  const match: any = {
    action: 'accepted',
    createdAt: { $gte: startOfMonth },
  };
  if (orgId) match.organizationId = orgId;

  const monthlySavingsResult = await FormularyComparison.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSavings: { $sum: '$estimatedSavings' },
      },
    },
  ]);

  const totalMonthlySavings = monthlySavingsResult[0]?.totalSavings || 0;

  // Monthly Medication Savings (totalSavings / numberOfPatients)
  // We use active patients for a more accurate per-patient saving metric
  const patientCount = await Patient.countDocuments({ 
    organizationId: orgId, 
    status: 'ACTIVE' 
  });
  
  const monthlyMedicationSavings = patientCount > 0 ? totalMonthlySavings / patientCount : 0;

  // Operational Cost Savings
  const patientsAdmitted = await Patient.countDocuments({
    organizationId: orgId,
    admissionDate: { $gte: startOfMonth },
  });

  const { avgNurseSalary, avgAdmissionTimeBefore, avgAdmissionTimeAfter } = config.analytics;
  const timeSavedMinutes = avgAdmissionTimeBefore - avgAdmissionTimeAfter;
  const operationalSavings = patientsAdmitted * (timeSavedMinutes / 60) * avgNurseSalary;

  return {
    monthlyMedicationSavings,
    totalMonthlySavings,
    operationalSavings,
    patientsAdmitted,
  };
};

const getRecentActivitiesFromDB = async (organizationId?: string) => {
  const query: any = {};
  if (organizationId) query.organizationId = organizationId;
  const result = await Activity.find(query).sort({ createdAt: -1 }).limit(10);

  const formattedResult = result.map(activity => {
    const activityObj = activity.toObject();
    return {
      ...activityObj,
      timeAgo: getRelativeTime(new Date(activityObj.createdAt)),
    };
  });

  return formattedResult;
};

export const AnalyticsService = {
  getAppAnalyticsFromDB,
  getDashboardAnalyticsFromDB,
  getMonthlySavingCostFromDB,
  getRecentActivitiesFromDB,
  getOrganizationSavingsMetrics,
};
