function ApprovalTabs() {
  const tabs = ['Pending My Approval', 'For Other Approvers', 'Approved', 'Rejected', 'All'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6">
      <div className="flex gap-8">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-4 text-sm font-medium transition border-b-2 ${
              index === 0
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ApprovalTabs;
