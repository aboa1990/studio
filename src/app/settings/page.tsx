
"use client"

import { useState, useEffect } from "react"
import { Save, Building2, Plus, Trash2, CheckCircle2, Upload, X, PenTool, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProfiles, saveProfile, deleteProfile, getActiveProfileId, setActiveProfileId } from "@/lib/store"
import { CompanyProfile } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"
import Image from "next/image"

const defaultFormData: CompanyProfile = {
  id: "",
  name: "",
  address: "",
  email: "",
  phone: "",
  gstNumber: "",
  authorizedSignatory: "",
  bankDetails: {
    bankName: "",
    accountName: "",
    accountNumber: "",
    branchName: ""
  }
};

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<CompanyProfile[]>([])
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CompanyProfile>(defaultFormData)

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const profilesData = await getProfiles();
        const activeProfileId = await getActiveProfileId();
        setProfiles(profilesData);
        setActiveId(activeProfileId);
        setEditingId(activeProfileId);
      } catch (error) {
        console.error("Failed to load initial data", error);
        toast({
          title: "Error",
          description: "Could not load company profiles.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [toast]);

  useEffect(() => {
    if (editingId) {
      const profile = profiles.find(p => p.id === editingId)
      if (profile) {
        setFormData({
          ...profile,
          bankDetails: profile.bankDetails || {
            bankName: "",
            accountName: "",
            accountNumber: "",
            branchName: ""
          }
        })
      }
    } else {
      setFormData(defaultFormData);
    }
  }, [editingId, profiles])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile(formData);
      const updatedProfiles = await getProfiles();
      setProfiles(updatedProfiles);
      toast({
        title: "Profile Saved",
        description: `${formData.name} details have been updated.`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save the profile.",
        variant: "destructive"
      });
    }
  }

  const handleAddNew = async () => {
    const newId = uuidv4();
    const newProfile: CompanyProfile = {
      id: newId,
      name: "New Company",
      address: "", email: "", phone: "", gstNumber: "", authorizedSignatory: "",
      bankDetails: { bankName: "", accountName: "", accountNumber: "", branchName: "" }
    };
    try {
      await saveProfile(newProfile);
      const updatedProfiles = await getProfiles();
      setProfiles(updatedProfiles);
      setEditingId(newId);
      toast({
        title: "New Profile Created",
        description: "Start by filling in your company details.",
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Could not create a new profile.",
        variant: "destructive"
      });
    }
  }

  const handleDelete = async (id: string) => {
    if (profiles.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one company profile.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm("Are you sure you want to delete this profile? All associated documents will also be deleted.")) {
      try {
        await deleteProfile(id);
        const updated = await getProfiles();
        setProfiles(updated);
        
        // If the deleted profile was the active one, switch to another
        if (activeId === id) {
          const newActiveId = updated[0]?.id || null;
          if (newActiveId) {
            setActiveProfileId(newActiveId);
            setActiveId(newActiveId);
          }
        }
        
        // If the deleted profile was being edited, switch to the active one
        if (editingId === id) {
          setEditingId(activeId);
        }

        toast({
          title: "Profile Deleted",
          description: "The company profile has been removed.",
        });
      } catch (error) {
         toast({
          title: "Error",
          description: "Could not delete the profile.",
          variant: "destructive"
        });
      }
    }
  }

  const handleSetActive = (id: string) => {
    setActiveProfileId(id);
    setActiveId(id);
    toast({
      title: "Active Profile Switched",
      description: "You are now managing this company.",
    });
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signatureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-headline font-black tracking-tight">Profiles & Settings</h1>
        <p className="text-muted-foreground mt-1">Manage multiple business entities and their branding.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-lg bg-card/50 h-fit">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Companies</CardTitle>
            <Button size="icon" variant="outline" onClick={handleAddNew}>
              <Plus className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {profiles.map(profile => (
              <div 
                key={profile.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  editingId === profile.id 
                    ? "bg-primary/10 border-primary" 
                    : "bg-background border-border hover:border-muted-foreground/50"
                }`}
                onClick={() => setEditingId(profile.id)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`size-8 rounded flex items-center justify-center shrink-0 ${profile.id === activeId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Building2 className="size-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium truncate">{profile.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email || "No email set"}</p>
                  </div>
                </div>
                {profile.id === activeId && <CheckCircle2 className="size-4 text-primary shrink-0 ml-2" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          {editingId ? (
            <form onSubmit={handleSave} className="space-y-6">
              <Card className="border-none shadow-lg bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Company Details</CardTitle>
                    <CardDescription>
                      Edit branding and contact information.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {editingId !== activeId && (
                      <Button type="button" variant="outline" onClick={() => handleSetActive(editingId)}>
                        Set as Active
                      </Button>
                    )}
                    <Button type="button" variant="destructive" size="icon" onClick={() => handleDelete(editingId)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Form fields... removed for brevity */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Business Name</Label>
                      <Input 
                        id="company-name" 
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="company-address">Business Address</Label>
                      <Textarea 
                        id="company-address" 
                        value={formData.address}
                        onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        required
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details and Save Button ... */}
               <div className="pt-4 flex justify-end">
                    <Button type="submit" className="bg-primary text-primary-foreground w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </div>
            </form>
          ) : (
            <div className="h-full flex items-center justify-center p-12 border-2 border-dashed rounded-lg border-muted">
              <p className="text-muted-foreground">Select a profile from the left to edit or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
