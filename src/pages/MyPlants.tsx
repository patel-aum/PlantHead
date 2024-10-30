import { useEffect, useState } from 'react';
import { databases, account } from '../lib/appwrite';
import { Query } from 'appwrite';
import { appwriteConfig } from '../lib/appwrite';
import { Leaf, Plus, Calendar, Droplet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AddPlantForm from '../components/AddPlantForm';

interface Plant {
  $id: string;
  name: string;
  species: string;
  image: string;
  lastWatered: string;
  wateringInterval: number;
  streak: number; // Ensure streak is part of the plant interface
}

export default function MyPlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const user = await account.get(); // Ensure the user is authenticated
      const userId = user.$id;

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        [Query.equal('userId', userId)] // Fetch only the current user's plants
      );

      // Map through the response and set the plants state
      setPlants(response.documents);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlant = (newPlant: Plant) => {
    setPlants((prev) => [newPlant, ...prev]); // Add the new plant to the state
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading state
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Plants</h1>
          <p className="text-gray-600">Keep track of your green friends</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus className="h-5 w-5" />
          Add Plant
        </button>
      </div>

      <AddPlantForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddPlant}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map((plant) => (
          <div key={plant.$id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-square bg-gray-100">
              <img
                src={plant.image}
                alt={plant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900">{plant.name}</h3>
              <p className="text-sm text-gray-500">{plant.species}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Droplet className="h-4 w-4" />
                  Last watered {formatDistanceToNow(new Date(plant.lastWatered), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Water every {plant.wateringInterval} days
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <Leaf className="h-4 w-4" />
                  {plant.streak} day streak
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {plants.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <Leaf className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No plants yet</h3>
          <p className="text-gray-500 mt-1">Start by adding your first plant!</p>
        </div>
      )}
    </div>
  );
}
