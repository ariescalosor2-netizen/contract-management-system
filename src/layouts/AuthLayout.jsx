function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 text-white items-center justify-center p-16">
        <div className="max-w-md">

          <h1 className="text-5xl font-bold mb-6">
            Contract Management System
          </h1>

          <p className="text-lg text-blue-100 leading-8">
            Securely manage contracts, approvals,
            payments, milestones, amendments,
            renewals, and reports in one centralized
            platform.
          </p>

        </div>
      </div>

      {/* Right Side */}

      <div className="flex-1 flex items-center justify-center p-10">

        {children}

      </div>

    </div>
  );
}

export default AuthLayout;