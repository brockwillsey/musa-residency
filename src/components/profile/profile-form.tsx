'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/app/actions/users';
import type { User } from '@/types';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    workInfo: user.workInfo || '',
    socialMedia: user.socialMedia || '',
    image: user.image || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    const result = await updateUserProfile(user.id, formData);

    if (!result.success) {
      setError(result.error);
    } else {
      setSuccess(true);
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="input"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="input"
            placeholder="e.g., Brooklyn, NY"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="bio" className="form-label">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          className="textarea"
          rows={4}
          placeholder="Tell other artists about yourself, your creative practice, and what you're looking for..."
          value={formData.bio}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="workInfo" className="form-label">
          Work & Creative Practice
        </label>
        <textarea
          id="workInfo"
          name="workInfo"
          className="textarea"
          rows={3}
          placeholder="Describe your artistic practice, current projects, or professional work..."
          value={formData.workInfo}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="socialMedia" className="form-label">
          Social Media / Portfolio Links
        </label>
        <textarea
          id="socialMedia"
          name="socialMedia"
          className="textarea"
          rows={2}
          placeholder="Instagram, website, portfolio links..."
          value={formData.socialMedia}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="image" className="form-label">
          Profile Image URL
        </label>
        <input
          id="image"
          name="image"
          type="url"
          className="input"
          placeholder="https://..."
          value={formData.image}
          onChange={handleChange}
        />
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600 text-sm">
          Profile updated successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary"
      >
        {isLoading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}