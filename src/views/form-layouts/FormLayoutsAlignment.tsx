"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(2, "Minimum 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function FormLayoutsAlignment() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    alert("Form submitted successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Left Aligned Form */}
      <Card>
        <CardHeader>
          <CardTitle>Left Aligned Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <Input 
              label="Name" 
              {...register("name")} 
              error={errors.name?.message}
            />
            <Input 
              label="Email" 
              type="email"
              {...register("email")} 
              error={errors.email?.message}
            />
            <Input 
              label="Password" 
              type="password"
              {...register("password")} 
              error={errors.password?.message}
            />
            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>

      {/* Center Aligned Form */}
      <Card>
        <CardHeader>
          <CardTitle>Center Aligned Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
            <Input 
              label="Name" 
              {...register("name")} 
              error={errors.name?.message}
            />
            <Input 
              label="Email" 
              type="email"
              {...register("email")} 
              error={errors.email?.message}
            />
            <Input 
              label="Password" 
              type="password"
              {...register("password")} 
              error={errors.password?.message}
            />
            <div className="flex justify-center">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Right Aligned Form */}
      <Card>
        <CardHeader>
          <CardTitle>Right Aligned Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md ml-auto">
            <Input 
              label="Name" 
              {...register("name")} 
              error={errors.name?.message}
            />
            <Input 
              label="Email" 
              type="email"
              {...register("email")} 
              error={errors.email?.message}
            />
            <Input 
              label="Password" 
              type="password"
              {...register("password")} 
              error={errors.password?.message}
            />
            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}