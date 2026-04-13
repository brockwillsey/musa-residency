'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/actions/auth';
import type { User } from '@/lib/db/schema';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    location: user.location || '',
    bio: user.bio || '',
    workInfo: user.workInfo || '',
    socialMedia: user.socialMedia || '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });
      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }

      const result = await updateProfile(submitData);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert-success">
              {success}
            </div>
          )}

          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-medium text-gray-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label htmlFor="workInfo" className="block text-sm font-medium text-gray-700 mb-2">
              What you do
            </label>
            <input
              type="text"
              id="workInfo"
              name="workInfo"
              value={formData.workInfo}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Visual Artist, Writer, Remote Developer"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              About you
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="form-textarea"
              placeholder="Tell other artists about yourself, your practice, and what you're looking for..."
            />
          </div>

          <div>
            <label htmlFor="socialMedia" className="block text-sm font-medium text-gray-700 mb-2">
              Website or Social Media
            </label>
            <input
              type="url"
              id="socialMedia"
              name="socialMedia"
              value={formData.socialMedia}
              onChange={handleChange}
              className="form-input"
              placeholder="https://your-portfolio.com or https://instagram.com/yourusername"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}