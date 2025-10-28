import { execSync } from "child_process";

// Deploy to production with safety checks
async function deployToProd() {
  try {
    const args = process.argv.slice(2);
    const forceDeploy = args.includes("--yes");
    
    console.log("🚀 Starting production deployment...");
    
    // Safety checks
    const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
    if (branch !== "master" && branch !== "main") {
      console.error("❌ Production deployment can only be run from master/main branch");
      process.exit(1);
    }
    
    const status = execSync("git status --porcelain", { encoding: "utf8" });
    if (status.trim()) {
      console.error("❌ Working tree must be clean before production deployment");
      console.error("Uncommitted changes:", status);
      process.exit(1);
    }
    
    if (!forceDeploy) {
      console.log("⚠️  This will deploy to production. Add --yes flag to confirm.");
      process.exit(1);
    }
    
    console.log("✅ Safety checks passed");
    
    // Step 1: Create production backup
    console.log("📦 Step 1: Creating production backup...");
    execSync("npm run db:backup:prod", { stdio: "inherit" });
    
    // Step 2: Apply migrations to production
    console.log("🔄 Step 2: Applying migrations to production...");
    execSync("npm run db:migrate:apply:prod", { stdio: "inherit" });
    
    // Step 3: Deploy application
    console.log("🚀 Step 3: Deploying application...");
    execSync("npm run deploy", { stdio: "inherit" });
    
    console.log("✅ Production deployment completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during production deployment:", error);
    console.error("💡 Check the logs above and consider restoring from backup if needed");
    process.exit(1);
  }
}

deployToProd();
