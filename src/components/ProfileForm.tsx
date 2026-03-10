
"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useStore } from "@/lib/store"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const profileSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  logo_url: z.any().optional(),
  gst_number: z.string().optional(),
  authorized_signatory: z.string().optional(),
  bank_details: z.string().optional(),
  signature_url: z.any().optional(),
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
}

export function ProfileForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { profiles, currentProfile, setCurrentProfile, fetchProfiles } = useStore()

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: currentProfile || defaultValues,
  });

  useEffect(() => {
    reset(currentProfile || defaultValues);
  }, [currentProfile, reset]);

  const handleFileUpload = async (file: File) => {
    if (!file) return null;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}_${sanitizedFileName}`;
    const { data, error } = await supabase.storage
      .from('public')
      .upload(fileName, file);

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
    .from('public')
    .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const isFile = (value: any): value is File => {
    return value && typeof value === 'object' && typeof value.name === 'string';
  };

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to create a profile.");
      }

      let logoUrl = data.logo_url;
      if (isFile(data.logo_url)) {
        logoUrl = await handleFileUpload(data.logo_url);
      }

      let signatureUrl = data.signature_url;
      if (isFile(data.signature_url)) {
        signatureUrl = await handleFileUpload(data.signature_url);
      }

      const profileData = { ...data, logo_url: logoUrl, signature_url: signatureUrl };

      if (currentProfile) {
        const { data: updatedProfile, error } = await supabase
          .from("company_profiles")
          .update(profileData)
          .eq('id', currentProfile.id)
          .select()
          .single();
        if (error) throw error;
        await fetchProfiles();
        setCurrentProfile(updatedProfile);
      } else {
        const { data: newProfile, error } = await supabase
          .from("company_profiles")
          .insert([{ ...profileData, user_id: user.id }])
          .select()
          .single();
        if (error) throw error;
        await fetchProfiles();
        setCurrentProfile(newProfile);
      }

      setSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentProfile) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from('company_profiles').delete().eq('id', currentProfile.id);
      if (error) throw error;

      await fetchProfiles(); 
      const newProfiles = profiles.filter(p => p.id !== currentProfile.id);
      setCurrentProfile(newProfiles.length > 0 ? newProfiles[0] : null);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="text-2xl font-black tracking-tight">{currentProfile ? 'Edit' : 'Create'} Company Profile</CardTitle>
        <CardDescription>This information will appear on your invoices, quotations, and other documents.</CardDescription>
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
                  <Textarea placeholder="Bank Name, Account Number, etc." {...field} className="mt-2"/>
                </div>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="logo_url"
              control={control}
              render={({ field: { onChange, value, ...rest } }) => (
                <div>
                  <label className='text-sm font-bold ml-1'>Logo</label>
                  <Input type="file" onChange={(e) => onChange(e.target.files?.[0])} {...rest} className="mt-2"/>
                  {value && typeof value === 'string' && <img src={value} alt="Logo Preview" className="mt-2 h-16 w-16 object-cover rounded-md"/>}
                </div>
              )}
            />
            <Controller
              name="signature_url"
              control={control}
              render={({ field: { onChange, value, ...rest } }) => (
                <div>
                  <label className='text-sm font-bold ml-1'>Signature</label>
                  <Input type="file" onChange={(e) => onChange(e.target.files?.[0])} {...rest} className="mt-2"/>
                  {value && typeof value === 'string' && <img src={value} alt="Signature Preview" className="mt-2 h-16 w-auto rounded-md"/>}
                </div>
              )}
            />
          </div>
          
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
                        This action cannot be undone. This will permanently delete your company profile and all associated data.
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
          {error && <p className="text-red-500 text-sm mt-2 text-center">Error: {error}</p>}
          {success && <p className="text-green-500 text-sm mt-2 text-center">Profile saved successfully!</p>}
        </form>
      </CardContent>
    </Card>
  )
}
