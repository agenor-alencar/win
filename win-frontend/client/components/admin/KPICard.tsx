import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon: React.ElementType;
  color?: "green" | "blue" | "purple" | "orange";
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = "green",
}) => {
  const colorClasses = {
    green: "from-[#3DBEAB] to-[#32A092]",
    blue: "from-[#2D9CDB] to-[#2788C7]",
    purple: "from-[#8B5CF6] to-[#7C3AED]",
    orange: "from-[#F59E0B] to-[#D97706]",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-semibold text-[#111827] mt-2">{value}</p>

          {change && (
            <div className="flex items-center mt-2">
              {change.type === "increase" ? (
                <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm ${change.type === "increase" ? "text-green-600" : "text-red-600"}`}
              >
                {change.value}% {change.period}
              </span>
            </div>
          )}
        </div>

        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};
