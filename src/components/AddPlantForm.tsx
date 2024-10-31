import { useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { storage, databases, appwriteConfig } from '../lib/appwrite';
import { ID } from 'appwrite';
import toast from 'react-hot-toast';
import { account } from '../lib/appwrite';

interface AddPlantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPlant: any) => void;
}

export default function AddPlantForm({ isOpen, onClose, onSuccess }: AddPlantFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [wateringInterval, setWateringInterval] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setImages((prev) => [...prev, ...filesArray]);
      
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!images.length || !name || !species) return;

    setIsLoading(true);
    try {
      const uploadedImageUrls = await Promise.all(
        images.map(async (file) => {
          const uploadResponse = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            file
          );
          return storage.getFileView(appwriteConfig.bucketId, uploadResponse.$id);
        })
      );

      const user = await account.get();

      const newPlant = {
        name,
        species,
        images: uploadedImageUrls, // Store the URLs of uploaded images
        wateringInterval,
        lastWatered: new Date().toISOString(),
        streak: 0,
        userId: user.$id,
      };

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        ID.unique(),
        newPlant
      );

      toast.success('Plant added successfully!');
      onClose();
      onSuccess(newPlant);
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
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Add Plant</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Plant Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Species</label>
            <input
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Watering Interval (Days)</label>
            <input
              type="number"
              value={wateringInterval}
              onChange={(e) => setWateringInterval(Number(e.target.value))}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              min={1}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              className="mt-1 block w-full"
            />
          </div>
          <div className="flex flex-wrap mt-4">
            {imagePreviews.map((preview, index) => (
              <img key={index} src={preview} alt={`Preview ${index}`} className="w-16 h-16 object-cover rounded-md mr-2 mb-2" />
            ))}
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-emerald-600 text-white rounded-md p-2 hover:bg-emerald-700 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Add Plant'}
          </button>
        </form>
      </div>
    </div>
  );
}
