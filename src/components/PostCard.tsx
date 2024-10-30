import { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { databases } from '../lib/appwrite';
import { postAppwriteConfig } from '../lib/appwrite';

interface PostCardProps {
  post: {
    $id: string;
    caption: string;
    image: string;
    likes: number;
    comments: string | null;
    userID: string; 
    createdAt: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = async () => {
    setIsLiked((prev) => !prev);
    const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1;
    setLikeCount(newLikeCount);

    try {
      await databases.updateDocument(
        postAppwriteConfig.databaseId,
        postAppwriteConfig.collectionId,
        post.$id,
        {
          likes: newLikeCount,
        }
      );
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="text-emerald-600 font-semibold">
            {post.userName.charAt(0)} {/* Placeholder for user avatar */}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{post.userName}</h3>
 
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="aspect-square bg-gray-100">
        <img
          src={post.image}
          alt="Plant"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={handleLike} className="flex items-center gap-1">
            <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500' : 'text-gray-500'}`} />
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center gap-1">
            <MessageCircle className="h-5 w-5 text-gray-500" />
            <span>{post.comments?.length || 0}</span>
          </button>
          <button className="flex items-center gap-1">
            <Share2 className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <p className="text-gray-700">{post.caption}</p>
      </div>
    </div>
  );
}
