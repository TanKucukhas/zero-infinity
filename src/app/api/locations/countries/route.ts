import { getCloudflareContext } from "@/server/cloudflare";
import { getDb } from "@/server/db";
import { countries } from "@/server/db/schema";
import { sql } from "drizzle-orm";

// GET /api/locations/countries
export async function GET(req: Request) {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return Response.json({
        success: true,
        data: [
          { code: "US", name: "United States" },
          { code: "CA", name: "Canada" },
          { code: "GB", name: "United Kingdom" },
          { code: "DE", name: "Germany" },
          { code: "FR", name: "France" },
          { code: "IT", name: "Italy" },
          { code: "ES", name: "Spain" },
          { code: "NL", name: "Netherlands" },
          { code: "SE", name: "Sweden" },
          { code: "NO", name: "Norway" },
          { code: "DK", name: "Denmark" },
          { code: "FI", name: "Finland" },
          { code: "CH", name: "Switzerland" },
          { code: "AT", name: "Austria" },
          { code: "BE", name: "Belgium" },
          { code: "IE", name: "Ireland" },
          { code: "PT", name: "Portugal" },
          { code: "GR", name: "Greece" },
          { code: "PL", name: "Poland" },
          { code: "CZ", name: "Czech Republic" },
          { code: "HU", name: "Hungary" },
          { code: "SK", name: "Slovakia" },
          { code: "SI", name: "Slovenia" },
          { code: "HR", name: "Croatia" },
          { code: "RO", name: "Romania" },
          { code: "BG", name: "Bulgaria" },
          { code: "EE", name: "Estonia" },
          { code: "LV", name: "Latvia" },
          { code: "LT", name: "Lithuania" },
          { code: "LU", name: "Luxembourg" },
          { code: "MT", name: "Malta" },
          { code: "CY", name: "Cyprus" },
          { code: "AU", name: "Australia" },
          { code: "NZ", name: "New Zealand" },
          { code: "JP", name: "Japan" },
          { code: "KR", name: "South Korea" },
          { code: "SG", name: "Singapore" },
          { code: "HK", name: "Hong Kong" },
          { code: "TW", name: "Taiwan" },
          { code: "IN", name: "India" },
          { code: "CN", name: "China" },
          { code: "BR", name: "Brazil" },
          { code: "MX", name: "Mexico" },
          { code: "AR", name: "Argentina" },
          { code: "CL", name: "Chile" },
          { code: "CO", name: "Colombia" },
          { code: "PE", name: "Peru" },
          { code: "VE", name: "Venezuela" },
          { code: "ZA", name: "South Africa" },
          { code: "EG", name: "Egypt" },
          { code: "NG", name: "Nigeria" },
          { code: "KE", name: "Kenya" },
          { code: "MA", name: "Morocco" },
          { code: "TN", name: "Tunisia" },
          { code: "DZ", name: "Algeria" },
          { code: "LY", name: "Libya" },
          { code: "SD", name: "Sudan" },
          { code: "ET", name: "Ethiopia" },
          { code: "GH", name: "Ghana" },
          { code: "CI", name: "Ivory Coast" },
          { code: "SN", name: "Senegal" },
          { code: "ML", name: "Mali" },
          { code: "BF", name: "Burkina Faso" },
          { code: "NE", name: "Niger" },
          { code: "TD", name: "Chad" },
          { code: "CM", name: "Cameroon" },
          { code: "CF", name: "Central African Republic" },
          { code: "CG", name: "Congo" },
          { code: "CD", name: "Democratic Republic of the Congo" },
          { code: "AO", name: "Angola" },
          { code: "ZM", name: "Zambia" },
          { code: "ZW", name: "Zimbabwe" },
          { code: "BW", name: "Botswana" },
          { code: "NA", name: "Namibia" },
          { code: "SZ", name: "Eswatini" },
          { code: "LS", name: "Lesotho" },
          { code: "MG", name: "Madagascar" },
          { code: "MU", name: "Mauritius" },
          { code: "SC", name: "Seychelles" },
          { code: "KM", name: "Comoros" },
          { code: "DJ", name: "Djibouti" },
          { code: "SO", name: "Somalia" },
          { code: "ER", name: "Eritrea" },
          { code: "UG", name: "Uganda" },
          { code: "RW", name: "Rwanda" },
          { code: "BI", name: "Burundi" },
          { code: "TZ", name: "Tanzania" },
          { code: "MW", name: "Malawi" },
          { code: "MZ", name: "Mozambique" },
          { code: "ZM", name: "Zambia" },
          { code: "ZW", name: "Zimbabwe" },
          { code: "BW", name: "Botswana" },
          { code: "NA", name: "Namibia" },
          { code: "SZ", name: "Eswatini" },
          { code: "LS", name: "Lesotho" },
          { code: "MG", name: "Madagascar" },
          { code: "MU", name: "Mauritius" },
          { code: "SC", name: "Seychelles" },
          { code: "KM", name: "Comoros" },
          { code: "DJ", name: "Djibouti" },
          { code: "SO", name: "Somalia" },
          { code: "ER", name: "Eritrea" },
          { code: "UG", name: "Uganda" },
          { code: "RW", name: "Rwanda" },
          { code: "BI", name: "Burundi" },
          { code: "TZ", name: "Tanzania" },
          { code: "MW", name: "Malawi" },
          { code: "MZ", name: "Mozambique" }
        ]
      });
    }
    
    const { env } = await getCloudflareContext();
    const db = getDb(env);
    
    const countriesData = await db
      .select()
      .from(countries)
      .orderBy(sql`${countries.name} ASC`);
    
    return Response.json({
      success: true,
      data: countriesData
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}