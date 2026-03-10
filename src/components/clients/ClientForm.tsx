
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronLeft, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { Client } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

const formSchema = z.object({
  name: z.string().min(2, { message: "Client name is required" }),
  contactPerson: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  gstNumber: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface ClientFormProps {
  clientId?: string
}

export default function ClientForm({ clientId }: ClientFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isNew, setIsNew] = useState(!clientId)
  const { currentProfile } = useStore();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    if (clientId && currentProfile) {
      const fetchClient = async () => {
        setLoading(true);
        const { data: client, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .eq('profile_id', currentProfile.id)
          .single();
        
        if (client) {
          setValue("name", client.name)
          setValue("contactPerson", client.contactPerson)
          setValue("email", client.email)
          setValue("phone", client.phone)
          setValue("address", client.address)
          setValue("gstNumber", client.gstNumber)
          setValue("notes", client.notes)
        }
        setLoading(false);
      }
      fetchClient()
    }
  }, [clientId, setValue, currentProfile])

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!currentProfile) {
        toast({
          title: "No Company Profile Selected",
          description: "Please select a company profile before adding a client.",
          variant: "destructive",
        });
        router.push('/settings');
        return;
    }

    setLoading(true)
    try {
      const clientData: Client = {
        id: clientId || uuidv4(),
        profile_id: currentProfile.id,
        ...data,
      }
      const { error } = await supabase.from('clients').upsert(clientData);
      if (error) throw error;

      toast({
        title: isNew ? "Client Added" : "Client Updated",
        description: `Successfully ${isNew ? 'added' : 'updated'} ${data.name}.`,
      })
      router.push("/clients")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: `Failed to ${isNew ? 'add' : 'update'} client. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
      // Prefill profile_id when a profile is loaded
      if(currentProfile) {
          setLoading(false)
      }
  }, [currentProfile])

  if (loading && !currentProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center p-8 border-2 border-dashed rounded-lg border-destructive/50 bg-destructive/5">
        <AlertTriangle className="size-12 text-destructive" />
        <h2 className="text-2xl font-bold text-destructive">No Company Profile Found</h2>
        <p className="text-muted-foreground max-w-sm">
          You must have at least one company profile set up before you can add clients.
        </p>
        <Button onClick={() => router.push('/settings')} className="mt-4">
          Go to Settings to Create a Profile
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="text-3xl font-headline font-bold">
          {isNew ? "Add New Client" : "Edit Client"}
        </h1>
      </div>
      <Card className="border-none shadow-lg bg-card/50">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Client / Company Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" {...register("contactPerson")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" {...register("address")} />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstNumber">GST Number (Optional)</Label>
            <Input id="gstNumber" {...register("gstNumber")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Any special instructions or notes..." />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
          {isNew ? "Add Client" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
