import { useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { storage, databases, account } from '../lib/appwrite';
import { ID } from 'appwrite';
import { postAppwriteConfig } from '../lib/appwrite';
import toast from 'react-hot-toast';

export default function AddPostForm({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !caption) {
      toast.error('Please add an image and caption.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await account.get(); // Get the current user
      const userID = user.$id; // User ID from Appwrite
      const userName = user.name || 'Unknown User'; // Fetch the userName

      // Upload image
      const uploadResponse = await storage.createFile(
        postAppwriteConfig.bucketId,
        ID.unique(),
        image
      );

      // Create post
      await databases.createDocument(
        postAppwriteConfig.databaseId,
        postAppwriteConfig.collectionId,
        ID.unique(),
        {
          caption,
          image: storage.getFileView(postAppwriteConfig.bucketId, uploadResponse.$id),
          likes: 0,
          comments: null,
          userID, // Add userID to the document
          userName, // Add userName to the document
          createdAt: new Date().toISOString(), // Set createdAt to the current date
        }
      );

      toast.success('Post created successfully!');
      setIsOpen(false);
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating post:', error);
      setErrorMessage(error.message || 'Failed to create post. Please try again.');
      toast.error(error.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setCaption('');
    setImagePreview('');
    setErrorMessage(null);
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 bg-white rounded-xl shadow-sm text-left text-gray-500 hover:bg-gray-50"
      >
        Share your plant journey...
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Post</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
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

              <textarea
                value={caption}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    setCaption(e.target.value);
                  }
                }}
                placeholder="Write a caption... (max 100 characters)"
                className="mt-4 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {caption.length}/100
              </div>

              <button
                type="submit"
                disabled={!image || !caption || isLoading}
                className="w-full mt-4 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </button>

              {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
