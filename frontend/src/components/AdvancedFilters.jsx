import { useState } from 'react';
import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react';

const AdvancedFilters = ({
  onSearch,
  onFilter,
  onSort,
  filters = {},
  sortOptions = [],
  searchPlaceholder = "Rechercher..."
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(filters);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    onSort({ field, order: newOrder });
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setSortBy('');
    setSortOrder('asc');
    onSearch('');
    onFilter({});
    onSort({ field: '', order: 'asc' });
  };

  const hasActiveFilters = Object.values(activeFilters).some(v => v) || searchTerm || sortBy;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Barre de recherche principale */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 -translate-y-1/2 text-gray-400 h-4 w-4" style={{ top: '50%' }} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            isExpanded
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>Filtres</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
          >
            <X className="h-4 w-4" />
            <span>Effacer</span>
          </button>
        )}
      </div>

      {/* Filtres étendus */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={activeFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                <option value="open">Ouvert</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
            </div>

            {/* Filtre par priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={activeFilters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les priorités</option>
                <option value="low">Faible</option>
                <option value="medium">Moyen</option>
                <option value="high">Élevé</option>
              </select>
            </div>

            {/* Filtre par catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={activeFilters.categoryId || ''}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les catégories</option>
                {/* Les catégories seront chargées dynamiquement */}
              </select>
            </div>
          </div>

          {/* Options de tri */}
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSort(option.value)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                  sortBy === option.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{option.label}</span>
                {sortBy === option.value && (
                  sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;