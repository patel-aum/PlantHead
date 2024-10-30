import { useState, useEffect } from 'react';
import { Search, Leaf } from 'lucide-react';

const PlantWiki = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [plants, setPlants] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlants = async (query = '') => {
    setLoading(true);
    setError(null); // Reset error state on new fetch
    try {
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const apiUrl = `https://trefle.io/api/v1/plants/search?token=d8pRqcSJ4CZveG67r347_TD5ANJ6C7sG578qltV9xIg&${query ? `q=${query}&` : ''}`;

      // console.log('Fetching URL:', proxyUrl + apiUrl); // Debugging line to check the URL being called

      const response = await fetch(proxyUrl + apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // console.log('Fetched data:', data); // Debugging line to see fetched data
      setPlants(data.data || []);
    } catch (err) {
      console.error('Error fetching plants:', err);
      setPlants([]);
      setError('Failed to fetch plants. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Load initial plants when component mounts
  useEffect(() => {
    fetchPlants(); // Fetch some plants on initial load
  }, []);

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(); // Call handleSearch when Enter key is pressed
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== '') { // Prevent searching with empty query
      fetchPlants(searchQuery);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plant Wiki</h1>
        <p className="text-gray-600">Discover and learn about different plants</p>
      </div>

      <div className="relative mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search plants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map((plant) => (
          <div
            key={plant.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-100">
              <img
                src={plant.image_url || '/api/placeholder/400/320'}
                alt={plant.common_name || 'Plant'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/400/320';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900">
                {plant.common_name || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-500 italic">{plant.scientific_name}</p>
              
              <div className="mt-4 space-y-2">
                {plant.family_common_name && (
                  <div className="text-sm">
                    <span className="text-gray-500">Family:</span>{' '}
                    <span className="text-gray-900">{plant.family_common_name}</span>
                  </div>
                )}
                {plant.family && (
                  <div className="text-sm">
                    <span className="text-gray-500">Scientific Family:</span>{' '}
                    <span className="text-gray-900">{plant.family}</span>
                  </div>
                )}
                {plant.year && (
                  <div className="text-sm">
                    <span className="text-gray-500">First Listed:</span>{' '}
                    <span className="text-gray-900">{plant.year}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && plants.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <Leaf className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No plants found</h3>
          <p className="text-gray-500 mt-1">Try searching with a different plant</p>
        </div>
      )}
    </div>
  );
};

export default PlantWiki;
