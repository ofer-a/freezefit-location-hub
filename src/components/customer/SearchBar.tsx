
import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const SearchBar = ({ 
  searchQuery, 
  onSearchQueryChange, 
  suggestions, 
  onSuggestionClick 
}: SearchBarProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchQueryChange(e.target.value);
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input 
        type="text"
        placeholder="חפש לפי שם או כתובת..."
        className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-freezefit-300"
        value={searchQuery}
        onChange={handleSearchInputChange}
        onFocus={() => searchQuery && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
