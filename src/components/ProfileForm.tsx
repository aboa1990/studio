
"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { doc, setDoc, deleteDoc, serverTimestamp, collection } from "firebase/firestore"
import { initializeFirebase } from "@/firebase"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X, ImageIcon, Signature, Stamp, FileType, LayoutTemplate, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"

const { firestore, auth } = initializeFirebase();

const profileSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  logo_url: z.string().optional(),
  gst_number: z.string().optional(),
  authorized_signatory: z.string().optional(),
  bank_details: z.string().optional(),
  signature_url: z.string().optional(),
  seal_url: z.string().optional(),
  letterhead_url: z.string().optional(),
  invoice_template: z.enum(['modern', 'classic', 'minimal']).default('modern'),
  quotation_template: z.enum(['modern', 'classic', 'minimal']).default('modern'),
})

const defaultValues = {
    name: "",
    address: "",
    email: "",
    phone: "",
    logo_url: "",
    gst_number: "",
    authorized_signatory: "",
    bank_details: "",
    signature_url: "",
    seal_url: "",
    letterhead_url: "",
    invoice_template: "modern",
    quotation_template: "modern",
}

export function ProfileForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { currentProfile, setCurrentProfile, fetchProfiles } = useStore()

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: currentProfile || defaultValues,
  });

  const watchLogo = watch("logo_url");
  const watchSignature = watch("signature_url");
  const watchSeal = watch("seal_url");
  const watchLetterhead = watch("letterhead_url");

  useEffect(() => {
    if (currentProfile) {
      reset(currentProfile);
    }
  }, [currentProfile, reset]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 800KB for best results.",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue(fieldName, reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (fieldName: any) => {
    setValue(fieldName, "", { shouldDirty: true });
  };

  const onSubmit = async (data: any) => {
    setLoading(true)
    const user = auth.currentUser;
    
    if (!user) {
      toast({ title: "Auth Error", description: "You must be logged in.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const profileId = currentProfile?.id || doc(collection(firestore, 'companies')).id;
    const companyRef = doc(firestore, 'companies', profileId);
    const userProfileRef = doc(firestore, 'user_profiles', user.uid);

    const profileData = {
      ...data,
      id: profileId,
      ownerUserId: user.uid,
      updatedAt: serverTimestamp(),
      createdAt: currentProfile?.createdAt || serverTimestamp(),
    };

    setDoc(companyRef, profileData, { merge: true })
      .then(async () => {
        await setDoc(userProfileRef, {
          id: user.uid,
          email: user.email,
          displayName: user.displayName || data.name,
          role: 'Admin',
          companyProfileId: profileId,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        }, { merge: true })
          .catch(err => {
             console.error("User profile update failed", err);
          });

        await fetchProfiles();
        toast({ title: "Success", description: "Company profile and branding saved successfully." });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: companyRef.path,
          operation: 'write',
          requestResourceData: profileData
        }));
      })
      .finally(() => setLoading(false));
  }

  const handleDelete = async () => {
    if (!currentProfile) return;
    setLoading(true);

    const companyRef = doc(firestore, 'companies', currentProfile.id);
    deleteDoc(companyRef)
      .then(async () => {
        await fetchProfiles();
        setCurrentProfile(null);
        toast({ title: "Deleted", description: "Profile removed." });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: companyRef.path,
          operation: 'delete'
        }));
      })
      .finally(() => setLoading(false));
  };

  const renderAssetSlot = (label: string, icon: any, fieldName: string, currentVal?: string, hint?: string) => (
    <div className="space-y-3">
      <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2'>
        {icon} {label}
      </label>
      <div className={cn(
        "relative group aspect-square rounded-xl border-2 border-dashed border-white/5 bg-white/5 flex flex-col items-center justify-center transition-all hover:border-primary/20 overflow-hidden",
        currentVal && "border-solid"
      )}>
        {currentVal ? (
          <>
            <img src={currentVal} alt={`${label} Preview`} className="h-full w-full object-contain p-4" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <label className="cursor-pointer bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                <Upload className="size-3" /> Replace
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, fieldName)} />
              </label>
              <button 
                type="button"
                onClick={() => removeImage(fieldName)}
                className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <X className="size-3" /> Remove
              </button>
            </div>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center w-full h-full justify-center">
            <Upload className="size-6 text-muted-foreground/40" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Upload {hint || 'Image'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, fieldName)} />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <Card className="glass-card border-white/5 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-black tracking-tight">{currentProfile ? 'Edit' : 'Create'} Company Profile</CardTitle>
        <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-50">Identity & Branding Settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-white/5 pb-2">Basic Information</h3>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1'>Company Name</label>
                  <Input placeholder='Your Company LLC' {...field} className="bg-white/5 border-white/5 h-11" />
                  {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.name.message as string}</p>}
                </div>
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field }) => 
                <div className="space-y-2">
                  <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1'>Office Address</label>
                  <Textarea placeholder="123 Business Rd, Suite 100" {...field} className="bg-white/5 border-white/5 min-h-[100px]" />
                </div>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1'>Contact Email</label>
                    <Input placeholder="contact@company.com" {...field} className="bg-white/5 border-white/5 h-11" />
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{errors.email.message as string}</p>}
                  </div>
                )}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => 
                    <div className="space-y-2">
                        <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1'>Phone Number</label>
                        <Input placeholder="+1 (555) 123-4567" {...field} className="bg-white/5 border-white/5 h-11" />
                    </div>
                  }
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-white/5 pb-2">Branding & Assets</h3>
            <p className="text-[9px] text-muted-foreground uppercase font-bold italic">Files must be under 800KB for reliable cloud storage.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderAssetSlot("Company Logo", <ImageIcon className="size-3" />, "logo_url", watchLogo, "Logo")}
              {renderAssetSlot("Digital Signature", <Signature className="size-3" />, "signature_url", watchSignature, "Signature")}
              {renderAssetSlot("Company Seal", <Stamp className="size-3" />, "seal_url", watchSeal, "Seal")}
              {renderAssetSlot("Letterhead Header", <FileType className="size-3" />, "letterhead_url", watchLetterhead, "Header")}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-white/5 pb-2">Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2'>
                  <LayoutTemplate className="size-3" /> Invoice Style
                </label>
                <Controller
                  name="invoice_template"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white/5 border-white/5 h-11">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern (Default)</SelectItem>
                        <SelectItem value="classic">Classic Grid</SelectItem>
                        <SelectItem value="minimal">Minimalist</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2'>
                  <LayoutTemplate className="size-3" /> Quotation Style
                </label>
                <Controller
                  name="quotation_template"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white/5 border-white/5 h-11">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern (Default)</SelectItem>
                        <SelectItem value="classic">Classic Grid</SelectItem>
                        <SelectItem value="minimal">Minimalist</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-white/5 pb-2">Compliance & Finance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="gst_number"
                control={control}
                render={({ field }) => 
                    <div className="space-y-2">
                      <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1'>Tax / GST Number</label>
                      <Input placeholder="Your GSTIN" {...field} className="bg-white/5 border-white/5 h-11" />
                    </div>
                }
              />
              <Controller
                name="authorized_signatory"
                control={control}
                render={({ field }) => 
                    <div className="space-y-2">
                      <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1'>Authorized Signatory Name</label>
                      <Input placeholder="CEO, Managing Director" {...field} className="bg-white/5 border-white/5 h-11" />
                    </div>
                }
              />
            </div>

            <Controller
              name="bank_details"
              control={control}
              render={({ field }) => 
                  <div className="space-y-2">
                    <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1'>Bank & Payment Details</label>
                    <Textarea placeholder="Bank Name: Global Bank&#10;Account Name: My Company LLC&#10;Account Number: 1234567890" {...field} className="bg-white/5 border-white/5 h-32" />
                  </div>
              }
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 h-12 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/10">
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {currentProfile ? "Update Profile" : "Create Profile"}
            </Button>
            {currentProfile && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" className="h-12 text-[10px] font-black uppercase tracking-widest border-white/5 hover:bg-destructive/10 hover:text-destructive transition-colors">Delete Profile</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-card border-none">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-black tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs font-medium text-muted-foreground">
                        This action will permanently remove your company profile and branding data. Your documents will remain but may lose their branding reference.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-[10px] font-bold uppercase tracking-widest border-white/5">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground text-[10px] font-bold uppercase tracking-widest">Delete Business</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
