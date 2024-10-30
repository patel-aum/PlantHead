import { useEffect, useState } from 'react';
import { account, databases, appwriteConfig } from '../lib/appwrite';
import { User, Settings, Camera, Award } from 'lucide-react';
import EditProfileForm from '../components/EditProfileForm';
import { Query } from 'appwrite';

interface UserProfile {
  name: string;
  email: string;
  plantsCount: number;
  streakDays: number;
  joinDate: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const user = await account.get();
      const userId = user.$id;

      // Fetch plants count and streak days
      const plantsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        [Query.equal('userId', userId)]
      );

      const plantsCount = plantsResponse.documents.length;
      const streakDays = calculateStreak(plantsResponse.documents); // Implement this function to calculate streak days

      setProfile({
        name: user.name,
        email: user.email,
        plantsCount,
        streakDays,
        joinDate: user.$createdAt,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function calculateStreak(plants: any[]) {
    // Logic to calculate the streak based on last watered dates
    // Assuming each plant has a lastWatered field
    const today = new Date();
    let streak = 0;

    // Example logic (adjust based on your data structure)
    plants.forEach((plant) => {
      const lastWatered = new Date(plant.lastWatered);
      const differenceInDays = Math.floor((today.getTime() - lastWatered.getTime()) / (1000 * 3600 * 24));

      if (differenceInDays === 0) {
        streak++; // Watered today
      }
    });

    return streak;
  }

  if (isLoading || !profile) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-emerald-500 to-green-500" />
        <div className="px-6 py-4 flex items-start">
          <div className="-mt-16">
            <div className="h-24 w-24 rounded-full bg-white p-1">
              <div className="h-full w-full rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-500">{profile.email}</p>
              </div>
              <button
                onClick={() => setShowEditForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6 border-t">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Camera className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{profile.plantsCount}</p>
                <p className="text-sm text-gray-500">Plants Added</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{profile.streakDays}</p>
                <p className="text-sm text-gray-500">Day Streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={fetchProfile}
        currentName={profile.name}
      />
    </div>
  );
}
