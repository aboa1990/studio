
"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

const profileSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
})

export function ProfileForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: profile, error } = await supabase
        .from("company_profiles")
        .insert([data])
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
    <Card>
      <CardHeader>
        <CardTitle>Create New Company Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <div>
                <Input placeholder="Company Name" {...field} />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message as string}</p>}
              </div>
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => <Textarea placeholder="Address" {...field} />}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <div>
                <Input placeholder="Email" {...field} />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message as string}</p>}
              </div>
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field }) => <Input placeholder="Phone" {...field} />}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Profile"}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">Profile created successfully!</p>}
        </form>
      </CardContent>
    </Card>
  )
}
