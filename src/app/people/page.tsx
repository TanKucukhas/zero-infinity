"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, Plus, Filter } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

type Person = {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  status: "active" | "inactive" | "pending";
  lastContact: string;
};

const data: Person[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Corp",
    role: "CEO",
    status: "active",
    lastContact: "2024-01-15"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    company: "Tech Inc",
    role: "CTO",
    status: "active",
    lastContact: "2024-01-14"
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    company: "StartupXYZ",
    role: "Founder",
    status: "pending",
    lastContact: "2024-01-13"
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    company: "Big Corp",
    role: "Manager",
    status: "inactive",
    lastContact: "2024-01-10"
  },
];

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge 
          variant={
            status === "active" ? "success" : 
            status === "pending" ? "warning" : "error"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastContact",
    header: "Last Contact",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    },
  },
];

export default function PeoplePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">People</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Manage your contacts and leads</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All People</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="Search people..." 
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={data} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}