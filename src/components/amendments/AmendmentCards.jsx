import { BiFile, BiCheckCircle, BiTime, BiXCircle } from 'react-icons/bi';

function AmendmentCards() {
  const cards = [
    {
      title: 'Total Amendments',
      value: 24,
      subtitle: 'All amendment requests',
      icon: <BiFile />,
      bg: 'bg-blue-100',
      color: 'text-blue-600',
    },
    {
      title: 'Approved',
      value: 15,
      subtitle: 'Successfully approved',
      icon: <BiCheckCircle />,
      bg: 'bg-green-100',
      color: 'text-green-600',
    },
    {
      title: 'Pending',
      value: 6,
      subtitle: 'Awaiting approval',
      icon: <BiTime />,
      bg: 'bg-yellow-100',
      color: 'text-yellow-600',
    },
    {
      title: 'Rejected',
      value: 3,
      subtitle: 'Request declined',
      icon: <BiXCircle />,
      bg: 'bg-red-100',
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
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

export default AmendmentCards;