"use client";
import PeopleTable from "@/components/people-table";
import TableContainer from "@/components/ui/TableContainer";

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

export default function PeoplePage() {
  return (
    <TableContainer 
      title="Contacts" 
      description="Manage your contacts database"
    >
      <PeopleTable />
    </TableContainer>
  );
}