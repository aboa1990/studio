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
import { doc, setDoc, deleteDoc, serverTimestamp, collection } from "firebase/firestore"
import { initializeFirebase } from "@/firebase"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X, ImageIcon, Signature, Stamp, FileType } from "lucide-react"
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
      createdAt: currentProfile ? currentProfile.createdAt : serverTimestamp(),
    };

    const userProfileData = {
      id: user.uid,
      email: user.email,
      displayName: user.displayName || data.name,
      role: 'Admin',
      companyProfileId: profileId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    setDoc(companyRef, profileData, { merge: true })
      .then(async () => {
        await setDoc(userProfileRef, userProfileData, { merge: true })
          .catch(err => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: userProfileRef.path,
              operation: 'write',
              requestResourceData: userProfileData
            }));
          });

        await fetchProfiles();
        toast({ title: "Success", description: "Profile and Authorization updated." });
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2'>
                  <ImageIcon className="size-3" /> Company Logo
                </label>
                <div className={cn(
                  "relative group aspect-square rounded-xl border-2 border-dashed border-white/5 bg-white/5 flex flex-col items-center justify-center transition-all hover:border-primary/20",
                  watchLogo && "border-solid"
                )}>
                  {watchLogo ? (
                    <>
                      <img src={watchLogo} alt="Logo Preview" className="h-full w-full object-contain p-4" />
                      <button 
                        type="button"
                        onClick={() => removeImage("logo_url")}
                        className="absolute top-2 right-2 size-6 bg-destructive/10 text-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                      <Upload className="size-6 text-muted-foreground/40" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Upload PNG/JPG</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "logo_url")} />
                    </label>
                  )}
                </div>
              </div>

              {/* Signature Upload */}
              <div className="space-y-3">
                <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2'>
                  <Signature className="size-3" /> Digital Signature
                </label>
                <div className={cn(
                  "relative group aspect-square rounded-xl border-2 border-dashed border-white/5 bg-white/5 flex flex-col items-center justify-center transition-all hover:border-primary/20",
                  watchSignature && "border-solid"
                )}>
                  {watchSignature ? (
                    <>
                      <img src={watchSignature} alt="Signature Preview" className="h-full w-full object-contain p-4" />
                      <button 
                        type="button"
                        onClick={() => removeImage("signature_url")}
                        className="absolute top-2 right-2 size-6 bg-destructive/10 text-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                      <Upload className="size-6 text-muted-foreground/40" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Upload PNG</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "signature_url")} />
                    </label>
                  )}
                </div>
              </div>

              {/* Seal Upload */}
              <div className="space-y-3">
                <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2'>
                  <Stamp className="size-3" /> Company Seal
                </label>
                <div className={cn(
                  "relative group aspect-square rounded-xl border-2 border-dashed border-white/5 bg-white/5 flex flex-col items-center justify-center transition-all hover:border-primary/20",
                  watchSeal && "border-solid"
                )}>
                  {watchSeal ? (
                    <>
                      <img src={watchSeal} alt="Seal Preview" className="h-full w-full object-contain p-4" />
                      <button 
                        type="button"
                        onClick={() => removeImage("seal_url")}
                        className="absolute top-2 right-2 size-6 bg-destructive/10 text-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                      <Upload className="size-6 text-muted-foreground/40" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Upload PNG</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "seal_url")} />
                    </label>
                  )}
                </div>
              </div>

              {/* Letterhead Upload */}
              <div className="space-y-3">
                <label className='text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2'>
                  <FileType className="size-3" /> Letterhead Header
                </label>
                <div className={cn(
                  "relative group aspect-square rounded-xl border-2 border-dashed border-white/5 bg-white/5 flex flex-col items-center justify-center transition-all hover:border-primary/20",
                  watchLetterhead && "border-solid"
                )}>
                  {watchLetterhead ? (
                    <>
                      <img src={watchLetterhead} alt="Letterhead Preview" className="h-full w-full object-contain p-4" />
                      <button 
                        type="button"
                        onClick={() => removeImage("letterhead_url")}
                        className="absolute top-2 right-2 size-6 bg-destructive/10 text-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                      <Upload className="size-6 text-muted-foreground/40" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Upload Wide Header</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "letterhead_url")} />
                    </label>
                  )}
                </div>
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
