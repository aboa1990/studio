
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyProfile } from "@/lib/types";

export default function Settings() {
  const { profiles, currentProfile, fetchProfiles, setCurrentProfile } = useStore();
  const [loading, setLoading] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleCreateProfile = async () => {
    if (!newProfileName) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('company_profiles')
        .insert([{ name: newProfileName, userId: user.id }])
        .select();
      
      if (error) {
        console.error("Error creating profile:", error);
      } else if (data) {
        await fetchProfiles();
        setCurrentProfile(data[0]);
        setNewProfileName("");
      }
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Company Profiles</CardTitle>
          <CardDescription>Manage your company profiles. Select your active profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Select onValueChange={(profileId) => {
                const profile = profiles.find(p => p.id === profileId);
                if (profile) setCurrentProfile(profile);
              }} 
              value={currentProfile?.id || ''} 
            >
              <SelectTrigger className="flex-grow">
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Create New Profile</Label>
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="New company name..." 
                value={newProfileName} 
                onChange={e => setNewProfileName(e.target.value)} 
              />
              <Button onClick={handleCreateProfile} disabled={loading || !newProfileName}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
              Your active profile is used to associate all your created documents.
            </p>
        </CardFooter>
      </Card>

    </div>
  );
}
