import { useEffect, useState } from 'react';
import { databases, account, storage } from '../lib/appwrite';
import { Query, ID } from 'appwrite'; // Import ID here
import { appwriteConfig } from '../lib/appwrite';
import { Leaf, Plus, Calendar, Droplet, Camera } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AddPlantForm from '../components/AddPlantForm';
import toast from 'react-hot-toast';

interface Plant {
  $id: string;
  name: string;
  species: string;
  images: string[];
  lastWatered: string;
  wateringInterval: number;
  streak: number;
  userId: string;
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
      const user = await account.get();
      const userId = user.$id;

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        [Query.equal('userId', userId)]
      );

      setPlants(response.documents);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlant = (newPlant: Plant) => {
    setPlants((prev) => [newPlant, ...prev]);
  };

  const handleImageUpload = async (plantId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      const uploadedImageUrl = await uploadImage(file);
      const currentDate = new Date().toISOString();

      setPlants((prevPlants) =>
        prevPlants.map((plant) =>
          plant.$id === plantId
            ? { ...plant, images: [uploadedImageUrl, ...plant.images], lastWatered: currentDate, streak: plant.streak + 1 }
            : plant
        )
      );

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        plantId,
        {
          images: [uploadedImageUrl, ...plants.find(p => p.$id === plantId)?.images || []],
          lastWatered: currentDate,
          streak: (plants.find(p => p.$id === plantId)?.streak || 0) + 1
        }
      );

      toast.success('Image uploaded successfully! Last watered date updated and streak increased.');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + (error.message || 'Unknown error'));
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const uploadResponse = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        file
      );
      return storage.getFileView(appwriteConfig.bucketId, uploadResponse.$id);
    } catch (error) {
      throw new Error('Image upload failed: ' + (error.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
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
        {plants.length > 0 ? (
          plants.map((plant) => (
            <div key={plant.$id} className="bg-white rounded-xl shadow-sm overflow-hidden relative">
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={plant.images[0]}
                  alt={plant.name}
                  className="w-full h-full object-cover"
                />
              <label htmlFor={`upload-${plant.$id}`} className="absolute top-4 right-4 cursor-pointer">
                  <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md">
                      <Camera className="h-5 w-5 text-black" />
                  </div>
              </label>


                <input
                  id={`upload-${plant.$id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(plant.$id, e)}
                  className="hidden"
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

                <div className="flex overflow-x-auto mt-4">
                  {plant.images.slice(0, 3).map((image, index) => (
                    <img key={index} src={image} alt={`Plant image ${index + 1}`} className="w-20 h-20 object-cover rounded-md mr-2" />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <Leaf className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No plants yet</h3>
            <p className="text-gray-500 mt-1">Start by adding your first plant!</p>
          </div>
        )}
      </div>
    </div>
  );
}
