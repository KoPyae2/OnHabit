"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@/convex/_generated/dataModel";
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Calendar, 
  Target, 
  Flame, 
  TrendingUp,
  Mail,
  Clock,
  Award,
  LogOut,
  Upload,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";

interface ProfilePageProps {
  userId: Id<"users">;
}

export function ProfilePage({ userId }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const profile = useQuery(api.profile.getUserProfile, { userId });
  const profileStats = useQuery(api.profile.getProfileStats, { userId });
  const updateProfile = useMutation(api.profile.updateProfile);
  const generateUploadUrl = useMutation(api.profile.generateUploadUrl);
  const updateProfilePhoto = useMutation(api.profile.updateProfilePhoto);
  const removeProfilePhoto = useMutation(api.profile.removeProfilePhoto);

  // Initialize form when profile loads
  React.useEffect(() => {
    if (profile && !isEditing) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setTimezone(profile.timezone);
    }
  }, [profile, isEditing]);

  const handleEdit = () => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setTimezone(profile.timezone);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        userId,
        displayName: displayName.trim(),
        bio: bio.trim(),
        timezone,
      });
      
      toast.success("Profile updated successfully! ✨");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setTimezone(profile.timezone);
    }
    setIsEditing(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      const { storageId } = await result.json();
      
      // Update profile with new photo
      await updateProfilePhoto({ userId, storageId });
      
      toast.success("Profile photo updated! 📸");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await removeProfilePhoto({ userId });
      toast.success("Profile photo removed");
    } catch (error) {
      toast.error("Failed to remove photo");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago", 
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
  ];

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-16 translate-x-16"></div>
        
        <CardContent className="relative z-10 pt-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Photo */}
            <div className="relative group">
              <Avatar
                src={profile.profileImageUrl}
                name={profile.displayName}
                size="xl"
                className="border-4 border-white shadow-lg"
              />
              
              {/* Photo Management Buttons */}
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                {/* Upload Photo Button */}
                <label htmlFor="photo-upload">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={uploadingPhoto}
                    className="h-8 w-8 p-0 rounded-full bg-white shadow-md hover:bg-blue-50 cursor-pointer"
                    title="Upload photo"
                    asChild
                  >
                    <span>
                      {uploadingPhoto ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      ) : (
                        <Upload className="h-3 w-3 text-blue-600" />
                      )}
                    </span>
                  </Button>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                
                {/* Remove Photo Button - only show if user has uploaded photo */}
                {profile.profileImageUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemovePhoto}
                    className="h-8 w-8 p-0 rounded-full bg-white shadow-md hover:bg-red-50"
                    title="Remove photo"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {!isEditing ? (
                <div className="space-y-3">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                    <p className="text-gray-600 flex items-center justify-center md:justify-start gap-1">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </p>
                  </div>
                  
                  {profile.bio && (
                    <p className="text-gray-700 max-w-md">{profile.bio}</p>
                  )}
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDate(profile.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {profile.timezone}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500">{bio.length}/200 characters</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {profileStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Total Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{profileStats.totalHabits}</div>
              <p className="text-xs text-gray-500">Active habits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                Total Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{profileStats.totalCheckins}</div>
              <p className="text-xs text-gray-500">Completed habits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-600" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{profileStats.currentStreak}</div>
              <p className="text-xs text-gray-500">Days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Best Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{profileStats.bestStreak}</div>
              <p className="text-xs text-gray-500">Personal record</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Account Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900">{profile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Member since:</span>
                  <span className="text-gray-900">{formatDate(profile.createdAt)}</span>
                </div>
                {profile.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last updated:</span>
                    <span className="text-gray-900">{formatDate(profile.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {profileStats && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Activity Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Days active:</span>
                    <span className="text-gray-900">{profileStats.daysSinceJoining} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completion rate:</span>
                    <span className="text-gray-900">{profileStats.completionRate}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Account Actions</h3>
                <p className="text-sm text-gray-500">Manage your account settings</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sign Out</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to sign out? You'll need to sign in again to access your habits.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button 
                      onClick={() => signOut({ callbackUrl: '/home' })}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}