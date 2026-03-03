
"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

const profileSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  logo_url: z.string().url("Invalid URL").optional().or(z.literal('')), 
  gst_number: z.string().optional(),
  authorized_signatory: z.string().optional(),
  bank_details: z.string().optional(), // Storing as a string, to be parsed as JSON before submission
  signature_url: z.string().url("Invalid URL").optional().or(z.literal(''))
})

export function ProfileForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: '',
        address: '',
        email: '',
        phone: '',
        logo_url: '',
        gst_number: '',
        authorized_signatory: '',
        bank_details: '',
        signature_url: ''
    }
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let bankDetailsJson = null;
      if (data.bank_details) {
        try {
          bankDetailsJson = JSON.parse(data.bank_details);
        } catch (e) {
          throw new Error("Bank details must be a valid JSON object.")
        }
      }

      const { data: profile, error } = await supabase
        .from("company_profiles")
        .insert([{ ...data, bank_details: bankDetailsJson }])
        .single();

      if (error) {
        throw error;
      }

      setSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="text-2xl font-black tracking-tight">Company Profile</CardTitle>
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
            render={({ field }) => (
              <div>
                <label className='text-sm font-bold ml-1'>Bank Details (JSON)</label>
                <Textarea placeholder='e.g., { "bank_name": "Global Bank", "account_number": "1234567890" }' {...field} className="mt-2"/>
                {errors.bank_details && <p className="text-red-500 text-sm mt-1">{errors.bank_details.message as string}</p>}
              </div>
            )}
          />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="logo_url"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className='text-sm font-bold ml-1'>Logo URL</label>
                    <Input placeholder="https://your-logo.com/logo.png" {...field} className="mt-2"/>
                     {errors.logo_url && <p className="text-red-500 text-sm mt-1">{errors.logo_url.message as string}</p>}
                  </div>
                )}
              />
              <Controller
                name="signature_url"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className='text-sm font-bold ml-1'>Signature URL</label>
                    <Input placeholder="https://your-signature.com/signature.png" {...field} className="mt-2"/>
                     {errors.signature_url && <p className="text-red-500 text-sm mt-1">{errors.signature_url.message as string}</p>}
                  </div>
                )}
              />
           </div>
          
          <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold tracking-tight">
            {loading ? "Saving Profile..." : "Save Profile"}
          </Button>
          {error && <p className="text-red-500 text-sm mt-2 text-center">Error: {error}</p>}
          {success && <p className="text-green-500 text-sm mt-2 text-center">Profile created successfully!</p>}
        </form>
      </CardContent>
    </Card>
  )
}
