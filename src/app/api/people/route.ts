import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const priority = searchParams.get("priority") || "";
    const contacted = searchParams.get("contacted") || "";
    const assignedTo = searchParams.get("assigned_to") || "";

    // Read CSV file
    const csvPath = path.join(process.cwd(), "sample-data.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    
    // Parse CSV
    const lines = csvContent.split("\n");
    const headers = lines[3].split(","); // Row 4 has headers
    
    const allPeople = [];
    
    // Start from row 5 (index 4) to skip headers and empty rows
    for (let i = 4; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(",");
      
      // Create person object
      const person = {
        id: `person-${i}`,
        firstName: values[0] || "",
        lastName: values[1] || "",
        email: values[2] || "",
        secondEmail: values[3] || "",
        imdbEmail: values[4] || "",
        assistantName: values[5] || "",
        assistantEmail: values[6] || "",
        company: values[7] || "",
        website: values[8] || "",
        companyLinkedin: values[9] || "",
        imdb: values[10] || "",
        facebook: values[11] || "",
        instagram: values[12] || "",
        linkedin: values[13] || "",
        wikipedia: values[14] || "",
        biography: values[15] || "",
        priority: values[16] || "",
        assignedTo: values[17] || "",
        seenFilm: values[18] === "TRUE",
        docBranchMember: values[19] === "TRUE",
        contacted: values[20] === "TRUE",
        hemalNotes: values[21] || "",
        yetkinNotes: values[22] || "",
        inviteSentJune: values[23] || "",
        responseJune: values[24] || "",
        inviteSentAugust: values[25] || "",
        responseAugust: values[26] || "",
        location: values[30] || "",
        fullName: `${values[0] || ""} ${values[1] || ""}`.trim(),
      };
      
      // Only add if has at least first name
      if (person.firstName) {
        allPeople.push(person);
      }
    }

    // Apply filters
    let filteredPeople = allPeople.filter(person => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          person.fullName.toLowerCase().includes(searchLower) ||
          person.email.toLowerCase().includes(searchLower) ||
          person.company.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Priority filter
      if (priority && priority !== "all") {
        if (person.priority !== priority) return false;
      }

      // Contacted filter
      if (contacted && contacted !== "all") {
        const isContacted = contacted === "true";
        if (person.contacted !== isContacted) return false;
      }

      // Assigned to filter
      if (assignedTo && assignedTo !== "all") {
        if (person.assignedTo !== assignedTo) return false;
      }

      return true;
    });

    // Calculate pagination
    const total = filteredPeople.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPeople = filteredPeople.slice(startIndex, endIndex);

    // Calculate stats
    const companies = new Set(allPeople.map(p => p.company).filter(Boolean));
    const contactedCount = allPeople.filter(p => p.contacted).length;
    const highPriorityCount = allPeople.filter(p => p.priority === "HIGH").length;
    const mediumPriorityCount = allPeople.filter(p => p.priority === "MEDIUM").length;
    const lowPriorityCount = allPeople.filter(p => p.priority === "LOW").length;

    return NextResponse.json({
      success: true,
      data: paginatedPeople,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: {
        totalPeople: allPeople.length,
        totalCompanies: companies.size,
        contacted: contactedCount,
        notContacted: allPeople.length - contactedCount,
        highPriority: highPriorityCount,
        mediumPriority: mediumPriorityCount,
        lowPriority: lowPriorityCount,
      },
    });
    
  } catch (error) {
    console.error("Error reading CSV:", error);
    return NextResponse.json(
      { 
        error: "Failed to load people data",
        trace_id: Math.random().toString(36).substr(2, 9)
      },
      { status: 500 }
    );
  }
}