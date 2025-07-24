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
  Trash2,
  BarChart3,
  Settings
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
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full -translate-y-16 translate-x-16"></div>
        
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
                    className="h-8 w-8 p-0 rounded-full bg-white shadow-md hover:bg-purple-50 cursor-pointer button-hover-lift"
                    title="Upload photo"
                    asChild
                  >
                    <span>
                      {uploadingPhoto ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      ) : (
                        <Upload className="h-3 w-3 text-purple-600" />
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
                    className="h-8 w-8 p-0 rounded-full bg-white shadow-md hover:bg-red-50 button-hover-lift"
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
                <Button onClick={handleEdit} variant="outline" className="gap-2 button-hover-lift">
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="gap-2 bg-purple-600 hover:bg-purple-700 button-hover-lift"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="gap-2 button-hover-lift">
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
          <Card className="card-hover fade-in-up stagger-1">
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

          <Card className="card-hover fade-in-up stagger-2">
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

          <Card className="card-hover fade-in-up stagger-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-600" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-orange-600 ${profileStats.currentStreak > 0 ? 'streak-celebration' : ''}`}>{profileStats.currentStreak}</div>
              <p className="text-xs text-gray-500">Days in a row</p>
            </CardContent>
          </Card>

          <Card className="card-hover fade-in-up stagger-4">
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

      {/* Recent Activity & Achievements */}
      {profileStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card className="fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Achievements
              </CardTitle>
              <CardDescription>
                Your habit milestones and accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Achievement badges */}
                <div className="grid grid-cols-2 gap-3">
                  {profileStats.totalHabits >= 5 && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <Target className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs font-medium text-blue-800">Habit Builder</p>
                        <p className="text-xs text-blue-600">5+ habits created</p>
                      </div>
                    </div>
                  )}
                  
                  {profileStats.totalCheckins >= 50 && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <Award className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-green-800">Consistent</p>
                        <p className="text-xs text-green-600">50+ check-ins</p>
                      </div>
                    </div>
                  )}
                  
                  {profileStats.bestStreak >= 7 && (
                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                      <Flame className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-xs font-medium text-orange-800">Streak Master</p>
                        <p className="text-xs text-orange-600">7+ day streak</p>
                      </div>
                    </div>
                  )}
                  
                  {profileStats.completionRate >= 80 && (
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-xs font-medium text-purple-800">High Achiever</p>
                        <p className="text-xs text-purple-600">80%+ completion</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Progress towards next achievement */}
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-gray-700 mb-2">Next Achievement</p>
                  {profileStats.totalCheckins < 100 ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Century Club</span>
                        <span className="text-gray-600">{profileStats.totalCheckins}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${(profileStats.totalCheckins / 100) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-green-600">🎉 All achievements unlocked!</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Quick Stats
              </CardTitle>
              <CardDescription>
                Your habit journey at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{Math.round(profileStats.completionRate)}%</div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{profileStats.daysSinceJoining}</div>
                    <div className="text-xs text-gray-600">Days Active</div>
                  </div>
                </div>
                
                {/* Habit consistency chart placeholder */}
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-gray-700 mb-2">This Month</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 30 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-sm ${
                          Math.random() > 0.3 ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                        title={`Day ${i + 1}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Daily habit completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences Section */}
      <Card className="fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Preferences
          </CardTitle>
          <CardDescription>
            Customize your habit tracking experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Notifications</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-700">Daily habit reminders</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-700">Weekly progress reports</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">Achievement notifications</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Display</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-700">Show streak animations</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-700">Celebration effects</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">Compact view mode</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your account details and activity summary
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

          {/* Data Management Section */}
          <div className="border-t pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Data Management</h3>
                <p className="text-sm text-gray-500">Export or backup your habit data</p>
              </div>
              <Button 
                variant="outline" 
                className="button-hover-lift"
                onClick={() => {
                  // This would trigger data export functionality
                  toast.success("Data export feature coming soon! 📊");
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">Habits</div>
                <div className="text-blue-600">{profileStats?.totalHabits || 0} items</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">Check-ins</div>
                <div className="text-green-600">{profileStats?.totalCheckins || 0} records</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-800">Days Active</div>
                <div className="text-purple-600">{profileStats?.daysSinceJoining || 0} days</div>
              </div>
            </div>
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
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 button-hover-lift">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </DialogTrigger>
                <DialogContent className="modal-slide-in">
                  <DialogHeader>
                    <DialogTitle>Sign Out</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to sign out? You'll need to sign in again to access your habits.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" className="button-hover-lift">Cancel</Button>
                    <Button 
                      onClick={() => signOut({ callbackUrl: '/home' })}
                      className="bg-red-600 hover:bg-red-700 text-white button-hover-lift"
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