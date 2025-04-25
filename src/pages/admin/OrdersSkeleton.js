import React from 'react';

const OrdersSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      {/* Skeleton for title and filters */}
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
      </div>
      {/* Skeleton for table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, rowIdx) => (
              <tr key={rowIdx}>
                {[...Array(7)].map((_, colIdx) => (
                  <td key={colIdx} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersSkeleton;
