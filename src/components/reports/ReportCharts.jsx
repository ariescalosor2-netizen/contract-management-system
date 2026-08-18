import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

import { monthlyContracts, contractStatus, payments } from '../../data/reports';

const COLORS = ['#2563eb', '#f59e0b', '#ef4444'];

function ReportCharts() {
  return (
    <>
      {/* Top Charts */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Line Chart */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Contracts</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyContracts}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Line type="monotone" dataKey="contracts" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Contract Status</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={contractStatus} dataKey="value" nameKey="name" outerRadius={100} label>
                {contractStatus.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={payments}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="amount" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default ReportCharts;
