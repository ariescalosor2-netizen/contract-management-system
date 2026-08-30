import {
  BiLaptop,
  BiCodeAlt,
  BiData,
  BiServer,
  BiCalendar,
  BiUser,
} from 'react-icons/bi';

function SystemInfo() {
  const info = [
    {
      icon: <BiLaptop />,
      label: 'System Name',
      value: 'Contract Management System',
    },
    {
      icon: <BiCodeAlt />,
      label: 'Frontend',
      value: 'React + Vite + Tailwind CSS',
    },
    {
      icon: <BiServer />,
      label: 'Backend',
      value: 'FastAPI',
    },
    {
      icon: <BiData />,
      label: 'Database',
      value: 'PostgreSQL 14',
    },
    {
      icon: <BiCalendar />,
      label: 'Version',
      value: 'Version 1.0.0',
    },
    {
      icon: <BiUser />,
      label: 'Developer',
      value: 'Regis Marie College - BSCS',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          System Information
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          View application details and system information.
        </p>
      </div>

      <div className="space-y-4">
        {info.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                {item.icon}
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  {item.label}
                </p>

                <p className="font-medium">
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-gray-50 border">
        <h3 className="font-semibold mb-2">
          About
        </h3>

        <p className="text-gray-600 text-sm leading-6">
          This Contract Management System is designed to manage
          contracts, approvals, payments, milestones, amendments,
          renewals, and reports through a centralized web-based
          platform.
        </p>
      </div>
    </div>
  );
}

export default SystemInfo;