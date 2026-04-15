"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { registerUser } from '@/app/actions/auth'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    location: '',
    workInfo: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      website: '',
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match.',
      })
      setIsLoading(false)
      return
    }

    const result = await registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      bio: formData.bio,
      location: formData.location,
      workInfo: formData.workInfo,
      socialMedia: formData.socialMedia,
    })

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Account created successfully! Please sign in.',
      })
      router.push('/login')
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      })
    }

    setIsLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Join the Musa Residency community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your creative practice..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workInfo">Work/Creative Practice</Label>
                <Input
                  id="workInfo"
                  placeholder="e.g., Visual Artist, Writer, Musician"
                  value={formData.workInfo}
                  onChange={(e) => handleInputChange('workInfo', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Social Media (Optional)</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-sm">Twitter</Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://..."
                    value={formData.socialMedia.website}
                    onChange={(e) => handleSocialMediaChange('website', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}