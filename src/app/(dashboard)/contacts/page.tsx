"use client";
import PeopleTable from "@/components/people-table";
import TableContainer from "@/components/ui/TableContainer";

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