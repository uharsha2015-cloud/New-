import React, { useState } from 'react';

interface HeaderProps {
    onSearch: (location: string) => void;
    isSearching: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSearch, isSearching }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && !isSearching) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <header className="bg-[#1e293b] bg-opacity-80 backdrop-blur-sm shadow-md flex items-center justify-between px-4 py-2 flex-shrink-0 z-20 border-b border-gray-700">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-500 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6 7.924 6 10c0 2.076.513 4.27 1.244 5.679A6.012 6.012 0 014.332 8.027zM10 4a6 6 0 00-5.668 9.973 8.005 8.005 0 0111.336 0A6 6 0 0010 4z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider">TERA</h1>
          <p className="text-xs text-gray-400">Earth Observation & Research</p>
        </div>
      </div>
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="relative">
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search location..."
            disabled={isSearching}
            className="bg-[#0f172a] text-white border border-gray-600 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-64 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold px-6 py-2 rounded-md hover:from-blue-600 hover:to-cyan-500 transition transform hover:scale-105 disabled:from-gray-500 disabled:to-gray-400 disabled:cursor-not-allowed"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
    </header>
  );
};

export default Header;
