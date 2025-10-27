"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
  firstName: z.string().min(2, "Minimum 2 characters"),
  lastName: z.string().min(2, "Minimum 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Minimum 10 characters"),
  company: z.string().min(2, "Minimum 2 characters"),
  role: z.string().min(1, "Please select a role"),
  message: z.string().min(10, "Minimum 10 characters"),
  terms: z.boolean().refine(val => val === true, "You must accept the terms"),
});

type FormData = z.infer<typeof schema>;

const roleOptions = [
  { value: "admin", label: "Administrator" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

export default function BasicForm() {
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
        <CardTitle>Basic Form Layout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              {...register("firstName")} 
              error={errors.firstName?.message}
            />
            <Input 
              label="Last Name" 
              {...register("lastName")} 
              error={errors.lastName?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Email" 
              type="email"
              {...register("email")} 
              error={errors.email?.message}
            />
            <Input 
              label="Phone" 
              type="tel"
              {...register("phone")} 
              error={errors.phone?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Company" 
              {...register("company")} 
              error={errors.company?.message}
            />
            <Select 
              label="Role"
              options={roleOptions}
              {...register("role")} 
              error={errors.role?.message}
            />
          </div>

          <Textarea 
            label="Message" 
            rows={4}
            {...register("message")} 
            error={errors.message?.message}
            helperText="Please provide additional details about your request"
          />

          <Checkbox 
            label="I agree to the terms and conditions"
            {...register("terms")} 
            error={errors.terms?.message}
          />

          <div className="flex gap-4">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}