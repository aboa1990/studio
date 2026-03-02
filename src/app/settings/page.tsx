
"use client"

import { useState, useEffect } from "react"
import { Save, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCompanyDetails, saveCompanyDetails } from "@/lib/store"
import { CompanyDetails } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [company, setCompany] = useState<CompanyDetails>({
    name: "",
    address: "",
    email: "",
    phone: "",
    gstNumber: "",
  })

  useEffect(() => {
    setCompany(getCompanyDetails())
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanyDetails(company);
    toast({
      title: "Settings Saved",
      description: "Company details have been updated and will appear on new documents.",
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-headline font-black tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your company profile and branding.</p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="border-none shadow-lg bg-card/50 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Company Branding
            </CardTitle>
            <CardDescription>
              These details will automatically appear on all generated Invoices and Quotations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Business Name</Label>
              <Input 
                id="company-name" 
                value={company.name}
                onChange={e => setCompany(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-address">Business Address</Label>
              <Textarea 
                id="company-address" 
                value={company.address}
                onChange={e => setCompany(prev => ({ ...prev, address: e.target.value }))}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-email">Billing Email</Label>
                <Input 
                  id="company-email" 
                  type="email"
                  value={company.email}
                  onChange={e => setCompany(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Contact Phone</Label>
                <Input 
                  id="company-phone" 
                  value={company.phone}
                  onChange={e => setCompany(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-gst">GST Number (Optional)</Label>
              <Input 
                id="company-gst" 
                placeholder="GST-XXXXX-XXXX"
                value={company.gstNumber}
                onChange={e => setCompany(prev => ({ ...prev, gstNumber: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground italic">Standard Maldives GST format is recommended.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" className="bg-primary text-primary-foreground">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
