import React from 'react';
import { Search } from 'lucide-react';
import Card from './Card';
import Select from './Select';

const SearchFilters = ({ searchTerm, onSearchChange, filters, onFilterChange, sortBy, onSortChange }) => {
  return (
    <Card>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#798E93] w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search donors by name..."
              className="w-full bg-white/50 border border-[#798E93]/30 rounded-lg pl-10 pr-4 py-3 text-[#2C3E44] placeholder-[#798E93] focus:outline-none focus:border-red-600"
            />
          </div>
        </div>
        {filters.map((filter, index) => (
          <Select
            key={index}
            value={filter.value}
            onChange={(e) => onFilterChange(filter.name, e.target.value)}
            options={filter.options}
          />
        ))}
      </div>
      {sortBy && (
        <div className="flex items-center space-x-4 mt-4">
          <span className="text-[#556B73] font-medium">Sort by:</span>
          <button
            onClick={() => onSortChange('date')}
            className={`px-4 py-2 rounded-lg transition shadow ${sortBy === 'date' ? 'bg-red-600 text-white' : 'bg-white/40 text-[#556B73] hover:bg-white/60'}`}
          >
            Date
          </button>
          <button
            onClick={() => onSortChange('match')}
            className={`px-4 py-2 rounded-lg transition shadow ${sortBy === 'match' ? 'bg-red-600 text-white' : 'bg-white/40 text-[#556B73] hover:bg-white/60'}`}
          >
            Match Score
          </button>
        </div>
      )}
    </Card>
  );
};

export default SearchFilters;
