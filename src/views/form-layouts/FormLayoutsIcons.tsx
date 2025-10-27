"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Lock, Phone, Building, MapPin } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Minimum 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  phone: z.string().min(10, "Minimum 10 characters"),
  company: z.string().min(2, "Minimum 2 characters"),
  address: z.string().min(5, "Minimum 5 characters"),
});

type FormData = z.infer<typeof schema>;

export default function FormLayoutsIcons() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    alert("Form submitted successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form with Icons</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                label="Full Name" 
                className="pl-10"
                {...register("name")} 
                error={errors.name?.message}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                label="Email" 
                type="email"
                className="pl-10"
                {...register("email")} 
                error={errors.email?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                label="Password" 
                type="password"
                className="pl-10"
                {...register("password")} 
                error={errors.password?.message}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                label="Phone" 
                type="tel"
                className="pl-10"
                {...register("phone")} 
                error={errors.phone?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                label="Company" 
                className="pl-10"
                {...register("company")} 
                error={errors.company?.message}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                label="Address" 
                className="pl-10"
                {...register("address")} 
                error={errors.address?.message}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}