import React from 'react';
import { Phone, Edit, Trash2 } from 'lucide-react';

const DonorLogCard = ({ donor, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-[#798E93]/20 p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#2C3E44] mb-4">{donor.name}</h3>
          <div className="space-y-2">
            <div>
              <span className="font-bold text-[#2C3E44]">Address: </span>
              <span className="text-[#556B73]">{donor.address}</span>
            </div>
            <div>
              <span className="font-bold text-[#2C3E44]">Organ: </span>
              <span className="text-[#556B73]">{donor.organ}</span>
            </div>
            <div>
              <span className="font-bold text-[#2C3E44]">Age: </span>
              <span className="text-[#556B73]">{donor.age}</span>
            </div>
            <div>
              <span className="font-bold text-[#2C3E44]">Hospital: </span>
              <span className="text-[#556B73]">{donor.hospital}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end ml-4">
          <div className="text-4xl font-bold text-red-600 mb-2">{donor.bloodType}</div>
          <Phone className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      
      <div className="flex gap-3 mt-6 pt-4 border-t border-[#798E93]/20">
        <button
          onClick={() => onEdit(donor)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md"
        >
          EDIT
        </button>
        <button
          onClick={() => onDelete(donor.id)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md"
        >
          DELETE
        </button>
      </div>
    </div>
  );
};

export default DonorLogCard;
