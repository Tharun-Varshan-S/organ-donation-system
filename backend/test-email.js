import { sendWelcomeMail } from "./utils/emailHelper.js";

async function testEmail() {
    console.log("Starting email verification test...");
    const testRecipient = "shivasarva32@gmail.com";
    const testName = "Test User (Verification)";

    try {
        await sendWelcomeMail(testRecipient, testName);
        console.log("Test execution completed. Please check your inbox.");
    } catch (error) {
        console.error("Test execution failed:", error);
    }
}

testEmail();
