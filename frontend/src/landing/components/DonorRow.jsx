import React from 'react';
import { Eye } from 'lucide-react';
import Button from './Button';

const DonorRow = ({ donor, onView }) => {
  return (
    <tr className="border-b border-[#798E93]/20 hover:bg-white/40 transition">
      <td className="px-6 py-4 text-[#2C3E44] font-medium">{donor.name}</td>
      <td className="px-6 py-4">
        <span className="bg-red-600/20 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
          {donor.bloodType}
        </span>
      </td>
      <td className="px-6 py-4 text-[#2C3E44]">{donor.organ}</td>
      <td className="px-6 py-4 text-[#556B73]">{donor.location}</td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-full bg-white/40 rounded-full h-2 max-w-[100px]">
            <div
              className="bg-red-600 h-2 rounded-full"
              style={{ width: `${donor.matchScore}%` }}
            />
          </div>
          <span className="text-red-600 font-semibold">{donor.matchScore}%</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="bg-green-600/20 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          {donor.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <Button variant="secondary" onClick={() => onView(donor)} className="px-4 py-2 flex items-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>View</span>
        </Button>
      </td>
    </tr>
  );
};

export default DonorRow;
