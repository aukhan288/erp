import { useSelector } from "react-redux";

const BrandHeader = () => {
  const { user } = useSelector((state) => state.auth);

  const companyName = user?.active_company?.name || "Company";

  return (
    <div className="flex items-center gap-2">
      {/* ERP Badge */}
      <div className="bg-teal-700 text-white px-2 py-1 rounded-md text-xs font-bold tracking-wider shadow-sm">
        ERP
      </div>

      {/* Company Name */}
      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
        {companyName}
      </span>
    </div>
  );
};

export default BrandHeader;