import { seedAcademicPrograms } from "./seed";

await seedAcademicPrograms();
process.stdout.write("Academic programs seeded successfully.\n");
process.exit(0);
