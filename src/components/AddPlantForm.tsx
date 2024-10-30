import { useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { storage, databases, appwriteConfig } from '../lib/appwrite'; // Adjust the import path as necessary
import { ID } from 'appwrite';
import toast from 'react-hot-toast';
import { account } from '../lib/appwrite'; // Import account to get user info

interface AddPlantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPlant: any) => void; // Expecting the new plant object
}

export default function AddPlantForm({ isOpen, onClose, onSuccess }: AddPlantFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [wateringInterval, setWateringInterval] = useState(7);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getLocation = () => {
    setIsLoadingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          toast.error('Failed to get location');
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported');
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !name || !species) return;

    setIsLoading(true);
    try {
      // Upload image
      const uploadResponse = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        image
      );

      // Get the current user's ID
      const user = await account.get();

      // Create plant document
      const newPlant = {
        name,
        species,
        image: storage.getFileView(appwriteConfig.bucketId, uploadResponse.$id),
        wateringInterval,
        lastWatered: new Date().toISOString(),
        location: location ? `${location.lat},${location.lng}` : null,
        streak: 0,
        userId: user.$id, // Store the user's ID
      };

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        ID.unique(),
        newPlant
      );

      toast.success('Plant added successfully!');
      onClose(); // Close the form
      onSuccess(newPlant); // Pass the new plant to the handler
    } catch (error) {
      console.error('Error details:', error);
      toast.error('Failed to add plant: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add New Plant</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {!imagePreview ? (
            <label className="block w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Camera className="h-8 w-8 mb-2" />
                <span>Add a photo of your plant</span>
              </div>
            </label>
          ) : (
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview('');
                }}
                className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Plant Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Species</label>
              <input
                type="text"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Watering Interval (days)</label>
              <input
                type="number"
                value={wateringInterval}
                onChange={(e) => setWateringInterval(Number(e.target.value))}
                min="1"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={getLocation}
              disabled={isLoadingLocation}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 flex items-center justify-center gap-2"
            >
              {isLoadingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting location...
                </>
              ) : location ? (
                'Location added ✓'
              ) : (
                'Add current location'
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={!image || !name || !species || isLoading}
            className="w-full mt-6 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding plant...
              </>
            ) : (
              'Add Plant'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
