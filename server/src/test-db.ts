
import 'dotenv/config';
import prisma from './db';

async function testConnection() {
    console.log("--- START DB TEST ---");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Defined" : "Missing");

    try {
        console.log("Attempting to count Users...");
        const count = await prisma.user.count();
        console.log("SUCCESS! User count:", count);

        console.log("Attempting to find specific user 'jhankar'...");
        const user = await prisma.user.findFirst({
            where: { email: { contains: 'jhankar' } }
        });
        console.log("User found:", user ? "Yes" : "No");
        if (user) console.log("User Email:", user.email);

    } catch (error) {
        console.error("--- DB CONNECTION ERROR ---");
        console.error(error);
    } finally {
        process.exit();
    }
}

testConnection();
