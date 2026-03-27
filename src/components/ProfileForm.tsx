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
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { initializeFirebase } from "@/firebase"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { useToast } from "@/hooks/use-toast"

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
}

export function ProfileForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { currentProfile, setCurrentProfile, fetchProfiles } = useStore()

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: currentProfile || defaultValues,
  });

  useEffect(() => {
    reset(currentProfile || defaultValues);
  }, [currentProfile, reset]);

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

    // 1. Update Company Profile
    setDoc(companyRef, profileData, { merge: true })
      .then(async () => {
        // 2. Update User Profile (Crucial for rules!)
        await setDoc(userProfileRef, {
          id: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'Admin',
          companyProfileId: profileId,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        }, { merge: true });

        await fetchProfiles();
        toast({ title: "Success", description: "Profile saved successfully." });
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
    <Card className="glass-card rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="text-2xl font-black tracking-tight">{currentProfile ? 'Edit' : 'Create'} Company Profile</CardTitle>
        <CardDescription>This information will appear on your professional documents.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <div>
                <label className='text-sm font-bold ml-1'>Company Name</label>
                <Input placeholder='Your Company LLC' {...field} className="mt-2"/>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
              </div>
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => 
              <div>
                <label className='text-sm font-bold ml-1'>Address</label>
                <Textarea placeholder="123 Business Rd, Suite 100" {...field} className="mt-2"/>
              </div>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div>
                  <label className='text-sm font-bold ml-1'>Email</label>
                  <Input placeholder="contact@company.com" {...field} className="mt-2"/>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>}
                </div>
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => 
                  <div>
                      <label className='text-sm font-bold ml-1'>Phone</label>
                      <Input placeholder="+1 (555) 123-4567" {...field} className="mt-2"/>
                  </div>
                }
            />
          </div>
          <Controller
            name="gst_number"
            control={control}
            render={({ field }) => 
                <div>
                  <label className='text-sm font-bold ml-1'>GST Number</label>
                  <Input placeholder="Your GSTIN" {...field} className="mt-2"/>
                </div>
            }
          />
          <Controller
            name="authorized_signatory"
            control={control}
            render={({ field }) => 
                <div>
                  <label className='text-sm font-bold ml-1'>Authorized Signatory</label>
                  <Input placeholder="CEO, Managing Director" {...field} className="mt-2"/>
                </div>
            }
          />
          <Controller
            name="bank_details"
            control={control}
            render={({ field }) => 
                <div>
                  <label className='text-sm font-bold ml-1'>Bank Details</label>
                  <Textarea placeholder="Bank Name: Global Bank\nAccount Name: My Company LLC\nAccount Number: 1234567890" {...field} className="mt-2 h-36"/>
                </div>
            }
          />
          
          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold tracking-tight">
              {loading ? "Saving..." : "Save Profile"}
            </Button>
            {currentProfile && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="w-full h-12 text-base font-bold tracking-tight">Delete Profile</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={loading}>Delete</AlertDialogAction>
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
