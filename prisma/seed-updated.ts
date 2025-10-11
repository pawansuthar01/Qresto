import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash("Admin@123456", 10);

  // Create Company Admin (SUPER_ADMIN) - Can manage content only
  const companyAdmin = await prisma.user.upsert({
    where: { email: "admin@qresto.com" },
    update: {},
    create: {
      email: "admin@qresto.com",
      password: hashedPassword,
      name: "Company Admin",
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log(
    "✅ Created Company Admin (Content Manager):",
    companyAdmin.email
  );

  // Create Company Owner (ADMIN) - Can create restaurants
  const companyOwner = await prisma.user.upsert({
    where: { email: "owner@qresto.com" },
    update: {},
    create: {
      email: "owner@qresto.com",
      password: hashedPassword,
      name: "Company Owner",
      role: UserRole.ADMIN,
    },
  });

  console.log(
    "✅ Created Company Owner (Restaurant Creator):",
    companyOwner.email
  );

  // Create default company pages
  const pages = [
    {
      type: "about",
      title: "About QResto",
      content: `
        <h2>Welcome to QResto</h2>
        <p>QResto is a cutting-edge restaurant management platform that transforms the dining experience through technology.</p>
        
        <h3>Our Mission</h3>
        <p>To empower restaurants with powerful, easy-to-use tools that enhance operations and delight customers.</p>
        
        <h3>What We Offer</h3>
        <ul>
          <li>Real-time menu management</li>
          <li>QR code contactless ordering</li>
          <li>Live order tracking</li>
          <li>AI-powered insights</li>
          <li>Complete customization</li>
          <li>Multi-restaurant management</li>
        </ul>
        
        <h3>Why Choose QResto?</h3>
        <p>We combine enterprise-grade features with intuitive design, making restaurant management accessible to businesses of all sizes.</p>
      `,
      isPublished: true,
      seoTitle: "About QResto - Smart Restaurant Management System",
      seoDescription:
        "Learn about QResto, the modern cloud-based restaurant management platform with real-time features and AI-powered insights.",
    },
    {
      type: "contact",
      title: "Contact Us",
      content: `
        <h2>Get in Touch</h2>
        <p>We'd love to hear from you! Reach out to us through any of the following channels:</p>
        
        <h3>📧 Email</h3>
        <ul>
          <li>General Inquiries: <strong>info@qresto.com</strong></li>
          <li>Support: <strong>support@qresto.com</strong></li>
          <li>Sales: <strong>sales@qresto.com</strong></li>
          <li>Partnership: <strong>partners@qresto.com</strong></li>
        </ul>
        
        <h3>📞 Phone</h3>
        <p><strong>+1 (555) 123-4567</strong></p>
        <p>Available Monday - Friday, 9 AM - 6 PM EST</p>
        
        <h3>🏢 Office</h3>
        <p>
          QResto Headquarters<br>
          123 Tech Street, Suite 400<br>
          San Francisco, CA 94102<br>
          United States
        </p>
        
        <h3>💬 Live Chat</h3>
        <p>Chat with our support team directly from the dashboard.</p>
      `,
      isPublished: true,
      seoTitle: "Contact QResto - Get Support & Information",
      seoDescription:
        "Contact QResto support team for help, inquiries, or partnership opportunities. Multiple channels available.",
    },
    {
      type: "privacy",
      title: "Privacy Policy",
      content: `
        <h2>Privacy Policy</h2>
        <p><em>Last Updated: January 2024</em></p>
        
        <h3>1. Information We Collect</h3>
        <p>We collect information you provide directly to us, including:</p>
        <ul>
          <li>Account information (name, email, password)</li>
          <li>Restaurant information (name, address, menu items)</li>
          <li>Usage data (how you interact with our platform)</li>
          <li>Payment information (processed securely through third parties)</li>
        </ul>
        
        <h3>2. How We Use Your Information</h3>
        <p>We use collected information to:</p>
        <ul>
          <li>Provide and improve our services</li>
          <li>Process transactions and send notifications</li>
          <li>Respond to your requests and support needs</li>
          <li>Analyze usage patterns and optimize performance</li>
        </ul>
        
        <h3>3. Data Security</h3>
        <p>We implement industry-standard security measures including:</p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security audits</li>
          <li>Secure authentication protocols</li>
          <li>Access controls and monitoring</li>
        </ul>
        
        <h3>4. Data Sharing</h3>
        <p>We do not sell your personal information. We may share data with:</p>
        <ul>
          <li>Service providers who assist our operations</li>
          <li>Legal authorities when required by law</li>
          <li>Business partners with your consent</li>
        </ul>
        
        <h3>5. Your Rights</h3>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Request data correction or deletion</li>
          <li>Opt-out of marketing communications</li>
          <li>Export your data</li>
        </ul>
        
        <h3>6. Cookies</h3>
        <p>We use cookies to enhance your experience and analyze usage. You can control cookie preferences in your browser settings.</p>
        
        <h3>7. Contact Us</h3>
        <p>For privacy concerns, contact us at: <strong>privacy@qresto.com</strong></p>
      `,
      isPublished: true,
      seoTitle: "Privacy Policy - QResto",
      seoDescription:
        "Read QResto's privacy policy to understand how we collect, use, and protect your data.",
    },
    {
      type: "terms",
      title: "Terms and Conditions",
      content: `
        <h2>Terms and Conditions</h2>
        <p><em>Last Updated: January 2024</em></p>
        
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using QResto, you accept and agree to be bound by these Terms and Conditions.</p>
        
        <h3>2. Service Description</h3>
        <p>QResto provides a cloud-based restaurant management platform including:</p>
        <ul>
          <li>Menu management tools</li>
          <li>QR code ordering system</li>
          <li>Order processing and tracking</li>
          <li>Analytics and reporting</li>
        </ul>
        
        <h3>3. User Accounts</h3>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining account security</li>
          <li>All activities under your account</li>
          <li>Accuracy of information provided</li>
          <li>Compliance with applicable laws</li>
        </ul>
        
        <h3>4. Acceptable Use</h3>
        <p>You agree not to:</p>
        <ul>
          <li>Violate any laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Transmit malicious code or viruses</li>
          <li>Attempt unauthorized access to systems</li>
          <li>Use the service for illegal activities</li>
        </ul>
        
        <h3>5. Payment Terms</h3>
        <p>Subscription fees are:</p>
        <ul>
          <li>Billed in advance on a monthly or annual basis</li>
          <li>Non-refundable except as required by law</li>
          <li>Subject to change with 30 days notice</li>
        </ul>
        
        <h3>6. Intellectual Property</h3>
        <p>All content, features, and functionality are owned by QResto and protected by copyright, trademark, and other laws.</p>
        
        <h3>7. Service Availability</h3>
        <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be announced in advance.</p>
        
        <h3>8. Limitation of Liability</h3>
        <p>QResto shall not be liable for indirect, incidental, special, or consequential damages arising from use of the service.</p>
        
        <h3>9. Termination</h3>
        <p>We may suspend or terminate accounts for:</p>
        <ul>
          <li>Violation of these terms</li>
          <li>Non-payment of fees</li>
          <li>Illegal or harmful activities</li>
        </ul>
        
        <h3>10. Changes to Terms</h3>
        <p>We reserve the right to modify these terms. Continued use after changes constitutes acceptance.</p>
        
        <h3>11. Governing Law</h3>
        <p>These terms are governed by the laws of the State of California, USA.</p>
        
        <h3>12. Contact</h3>
        <p>For questions about these terms, contact: <strong>legal@qresto.com</strong></p>
      `,
      isPublished: true,
      seoTitle: "Terms and Conditions - QResto",
      seoDescription:
        "Read QResto's terms and conditions for using our restaurant management platform.",
    },
  ];

  for (const pageData of pages) {
    await prisma.companyPage.upsert({
      where: { type: pageData.type as any },
      create: pageData as any,
      update: pageData as any,
    });
    console.log(`✅ Created/Updated page: ${pageData.type}`);
  }

  console.log("\n🎉 Seeding completed!");
  console.log("\n📧 Login Credentials:");
  console.log("┌─────────────────────────────────────────┐");
  console.log("│ Company Admin (Content Manager)         │");
  console.log("│ Email: admin@qresto.com                 │");
  console.log("│ Password: Admin@123456                  │");
  console.log("│ Access: /admin/dashboard                │");
  console.log("│ Can: Manage all content pages           │");
  console.log("├─────────────────────────────────────────┤");
  console.log("│ Company Owner (Restaurant Creator)      │");
  console.log("│ Email: owner@qresto.com                 │");
  console.log("│ Password: Admin@123456                  │");
  console.log("│ Access: /company/dashboard              │");
  console.log("│ Can: Create & manage restaurants        │");
  console.log("└─────────────────────────────────────────┘");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
