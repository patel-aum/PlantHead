import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { account } from '../lib/appwrite';
import toast from 'react-hot-toast';

interface EditProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentName: string;
}

export default function EditProfileForm({ isOpen, onClose, onSuccess, currentName }: EditProfileFormProps) {
  const [name, setName] = useState(currentName);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const promises = [];

      if (name !== currentName) {
        promises.push(account.updateName(name));
      }

      if (password) {
        promises.push(account.updatePassword(password));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        toast.success('Profile updated successfully');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password (optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || (name === currentName && !password)}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}