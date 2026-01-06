import { Filter, SortAsc } from 'lucide-react';

interface FilterPanelProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange
}: FilterPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Categories */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-neutral-600" />
            <span className="text-sm text-neutral-600">Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-yellow-400 text-neutral-900'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="lg:w-64">
          <div className="flex items-center gap-2 mb-3">
            <SortAsc className="w-4 h-4 text-neutral-600" />
            <span className="text-sm text-neutral-600">Sort By</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="date">Date (Upcoming First)</option>
            <option value="rating">Rating (Highest First)</option>
            <option value="attendees">Attendees (Most First)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
