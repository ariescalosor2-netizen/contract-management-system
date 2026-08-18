import { BiFile, BiCheckCircle, BiMoney, BiTimeFive } from 'react-icons/bi';

import { reportSummary } from '../../data/reports';

function ReportCards() {
  const cards = [
    {
      title: 'Total Contracts',
      value: reportSummary.totalContracts,
      subtitle: 'Registered contracts',
      icon: <BiFile />,
      bg: 'bg-blue-100',
      color: 'text-blue-600',
    },
    {
      title: 'Active Contracts',
      value: reportSummary.activeContracts,
      subtitle: 'Currently active',
      icon: <BiCheckCircle />,
      bg: 'bg-green-100',
      color: 'text-green-600',
    },
    {
      title: 'Revenue',
      value: reportSummary.totalRevenue,
      subtitle: 'Total contract value',
      icon: <BiMoney />,
      bg: 'bg-emerald-100',
      color: 'text-emerald-600',
    },
    {
      title: 'Expiring Soon',
      value: reportSummary.expiringSoon,
      subtitle: 'Within 30 days',
      icon: <BiTimeFive />,
      bg: 'bg-yellow-100',
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${card.bg} ${card.color}`}
            >
              {card.icon}
            </div>

            <div>
              <p className="text-sm text-gray-500">{card.title}</p>

              <h2 className="text-2xl font-bold mt-1">{card.value}</h2>

              <p className="text-sm text-gray-400 mt-1">{card.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReportCards;
