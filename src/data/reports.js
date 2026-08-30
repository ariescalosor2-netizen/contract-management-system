const reportSummary = {
  totalContracts: 125,
  activeContracts: 96,
  totalRevenue: '₱12,450,000',
  expiringSoon: 8,
};

const monthlyContracts = [
  { month: 'Jan', contracts: 8 },
  { month: 'Feb', contracts: 12 },
  { month: 'Mar', contracts: 15 },
  { month: 'Apr', contracts: 18 },
  { month: 'May', contracts: 20 },
  { month: 'Jun', contracts: 24 },
];

const contractStatus = [
  { name: 'Active', value: 96 },
  { name: 'Pending', value: 18 },
  { name: 'Expired', value: 11 },
];

const payments = [
  { month: 'Jan', amount: 450000 },
  { month: 'Feb', amount: 720000 },
  { month: 'Mar', amount: 980000 },
  { month: 'Apr', amount: 1250000 },
  { month: 'May', amount: 1680000 },
  { month: 'Jun', amount: 2140000 },
];

const recentActivities = [
  {
    id: 1,
    activity: 'New Contract Approved',
    user: 'Juan Dela Cruz',
    date: 'Jun 18, 2026',
  },
  {
    id: 2,
    activity: 'Payment Received',
    user: 'Maria Santos',
    date: 'Jun 17, 2026',
  },
  {
    id: 3,
    activity: 'Renewal Completed',
    user: 'Pedro Reyes',
    date: 'Jun 16, 2026',
  },
];

export { reportSummary, monthlyContracts, contractStatus, payments, recentActivities };
