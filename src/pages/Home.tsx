import { useEffect, useState } from 'react';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import PostCard from '../components/PostCard';
import AddPostForm from '../components/AddPostForm';
import { Loader2 } from 'lucide-react';
import { postAppwriteConfig } from '../lib/appwrite';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const response = await databases.listDocuments(
        postAppwriteConfig.databaseId,
        postAppwriteConfig.collectionId,
        [
          Query.orderDesc('createdAt'),
          Query.limit(10)
        ]
      );
      setPosts(response.documents);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.message || 'Failed to fetch posts.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Always render the AddPostForm */}
      <AddPostForm onSuccess={fetchPosts} />

      <div className="space-y-6 mt-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.$id} post={post} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts yet. Be the first to share your plant!</p>
          </div>
        )}
      </div>
    </div>
  );
}
