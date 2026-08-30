import { BiTime, BiPaperPlane, BiCheckCircle, BiXCircle } from 'react-icons/bi';

function ApprovalCards() {
  const cards = [
    {
      title: 'Pending My Approval',
      value: 7,
      subtitle: 'Requires your action',
      icon: <BiTime />,
      bg: 'bg-yellow-100',
      color: 'text-yellow-600',
    },
    {
      title: 'For Other Approvers',
      value: 5,
      subtitle: 'Waiting for others',
      icon: <BiPaperPlane />,
      bg: 'bg-blue-100',
      color: 'text-blue-600',
    },
    {
      title: 'Approved',
      value: 32,
      subtitle: 'This month',
      icon: <BiCheckCircle />,
      bg: 'bg-green-100',
      color: 'text-green-600',
    },
    {
      title: 'Rejected',
      value: 3,
      subtitle: 'This month',
      icon: <BiXCircle />,
      bg: 'bg-red-100',
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${card.bg} ${card.color}`}
            >
              {card.icon}
            </div>

            <div>
              <h4 className="text-sm text-gray-500">{card.title}</h4>
              <h2 className="text-3xl font-bold">{card.value}</h2>
              <p className="text-sm text-gray-400">{card.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ApprovalCards;
