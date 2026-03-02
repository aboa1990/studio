
"use client"

import { useState, useEffect } from "react"
import { Save, Building2, Plus, Trash2, CheckCircle2, Upload, X, PenTool } from "lucide-react"
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

export default function SettingsPage() {
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<CompanyProfile[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CompanyProfile>({
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
  })

  useEffect(() => {
    setProfiles(getProfiles())
    setEditingId(getActiveProfileId())
  }, [])

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
    }
  }, [editingId, profiles])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(formData);
    setProfiles(getProfiles());
    toast({
      title: "Profile Saved",
      description: `${formData.name} details have been updated.`,
    });
  }

  const handleAddNew = () => {
    const newId = uuidv4();
    const newProfile: CompanyProfile = {
      id: newId,
      name: "New Company",
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
    saveProfile(newProfile);
    setProfiles(getProfiles());
    setEditingId(newId);
    toast({
      title: "New Profile Created",
      description: "Start by filling in your company details.",
    });
  }

  const handleDelete = (id: string) => {
    if (profiles.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one company profile.",
        variant: "destructive",
      });
      return;
    }

    if (confirm("Are you sure you want to delete this profile? All associated documents will also be deleted.")) {
      deleteProfile(id);
      const updated = getProfiles();
      setProfiles(updated);
      setEditingId(getActiveProfileId());
      toast({
        title: "Profile Deleted",
        description: "The company profile and its documents have been removed.",
      });
    }
  }

  const handleSetActive = (id: string) => {
    setActiveProfileId(id);
    setEditingId(id);
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

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: undefined }));
  };

  const removeSignature = () => {
    setFormData(prev => ({ ...prev, signatureUrl: undefined }));
  };

  const activeId = getActiveProfileId();

  return (
    <div className="space-y-8">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border pb-6">
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold">Company Logo</Label>
                      <div className="relative size-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden border group">
                        {formData.logoUrl ? (
                          <>
                            <Image src={formData.logoUrl} alt="Logo" fill className="object-contain" />
                            <button 
                              type="button" 
                              onClick={removeLogo}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="size-3" />
                            </button>
                          </>
                        ) : (
                          <Building2 className="size-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-primary font-medium hover:underline">
                            <Upload className="size-4" />
                            {formData.logoUrl ? "Change Logo" : "Upload Logo"}
                          </div>
                        </Label>
                        <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-semibold">Digital Signature</Label>
                      <div className="relative size-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden border group">
                        {formData.signatureUrl ? (
                          <>
                            <Image src={formData.signatureUrl} alt="Signature" fill className="object-contain" />
                            <button 
                              type="button" 
                              onClick={removeSignature}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="size-3" />
                            </button>
                          </>
                        ) : (
                          <PenTool className="size-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signature-upload" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-accent font-medium hover:underline">
                            <Upload className="size-4" />
                            {formData.signatureUrl ? "Change Signature" : "Upload Signature"}
                          </div>
                        </Label>
                        <input id="signature-upload" type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                      </div>
                    </div>
                  </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-email">Billing Email</Label>
                        <Input 
                          id="company-email" 
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-phone">Contact Phone</Label>
                        <Input 
                          id="company-phone" 
                          value={formData.phone}
                          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-gst">GST Number (Optional)</Label>
                        <Input 
                          id="company-gst" 
                          placeholder="GST-XXXXX-XXXX"
                          value={formData.gstNumber || ""}
                          onChange={e => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authorized-signatory">Authorized Signatory Name</Label>
                        <Input 
                          id="authorized-signatory" 
                          placeholder="e.g. Managing Director"
                          value={formData.authorizedSignatory || ""}
                          onChange={e => setFormData(prev => ({ ...prev, authorizedSignatory: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-card/50">
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                  <CardDescription>This information will appear on your invoices and quotations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Input 
                        id="bank-name" 
                        placeholder="e.g. Bank of Maldives (BML)"
                        value={formData.bankDetails?.bankName || ""}
                        onChange={e => setFormData(prev => ({ 
                          ...prev, 
                          bankDetails: { ...(prev.bankDetails || { bankName: "", accountName: "", accountNumber: "" }), bankName: e.target.value } 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-name">Account Name</Label>
                      <Input 
                        id="account-name" 
                        placeholder="e.g. My Company Pvt Ltd"
                        value={formData.bankDetails?.accountName || ""}
                        onChange={e => setFormData(prev => ({ 
                          ...prev, 
                          bankDetails: { ...(prev.bankDetails || { bankName: "", accountName: "", accountNumber: "" }), accountName: e.target.value } 
                        }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input 
                        id="account-number" 
                        placeholder="77XXXXXXXXXXX"
                        value={formData.bankDetails?.accountNumber || ""}
                        onChange={e => setFormData(prev => ({ 
                          ...prev, 
                          bankDetails: { ...(prev.bankDetails || { bankName: "", accountName: "", accountNumber: "" }), accountNumber: e.target.value } 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branch-name">Branch (Optional)</Label>
                      <Input 
                        id="branch-name" 
                        placeholder="e.g. Main Branch / Male"
                        value={formData.bankDetails?.branchName || ""}
                        onChange={e => setFormData(prev => ({ 
                          ...prev, 
                          bankDetails: { ...(prev.bankDetails || { bankName: "", accountName: "", accountNumber: "" }), branchName: e.target.value } 
                        }))}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" className="bg-primary text-primary-foreground w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
