// Full legal text for the Terms and Conditions modal (Landing.jsx footer),
// in both site languages — same typed-block structure as privacyPolicy.js
// (paragraph / bullet list / role description / address) so the modal can
// render either language generically.
const en = {
  title: "Terms and Conditions",
  lastUpdatedLabel: "Last Updated",
  lastUpdated: "September 17, 2026",
  intro: [
    "Welcome to BSFDM — Black Soldier Fly Data Management.",
    "These Terms and Conditions (“Terms”) govern your access to and use of the BSFDM website, application, dashboard, services, features, APIs, and related systems available through bsfdm.id and associated BSFDM services.",
    "By accessing, registering for, or using BSFDM, you agree to be bound by these Terms.",
    "If you do not agree with these Terms, you should not access or use BSFDM.",
  ],
  closing: [
    "By creating an account or continuing to use BSFDM, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.",
  ],
  sections: [
    {
      number: "1", title: "About BSFDM",
      blocks: [
        { type: "p", text: "BSFDM is a digital management platform designed to support Black Soldier Fly (BSF) production and organic waste management operations." },
        { type: "p", text: "The platform may provide features including:" },
        { type: "ul", items: [
          "production monitoring", "biopond management", "BSF egg production records", "baby maggot stocking records",
          "maggot harvesting", "prepupa and pupa management", "breeding stock management", "feed management",
          "organic waste intake records", "waste source management", "client management", "kasgot or organic fertilizer records",
          "inventory management", "scheduling", "production calendars", "notifications", "dashboards", "reporting",
          "operational analytics", "user management", "role-based access control", "historical production records",
          "other BSF-related operational tools",
        ] },
        { type: "p", text: "Features may be added, changed, improved, restricted, or removed as the BSFDM platform develops." },
      ],
    },
    {
      number: "2", title: "Acceptance of Terms",
      blocks: [
        { type: "p", text: "By creating an account, accessing the platform, or using BSFDM services, you confirm that:" },
        { type: "ul", items: [
          "you have read and understood these Terms", "you agree to comply with these Terms",
          "you are authorized to use BSFDM on behalf of yourself or your organization",
          "the information you provide is accurate and lawful", "you will use BSFDM only for legitimate purposes",
        ] },
        { type: "p", text: "If you use BSFDM on behalf of a company, organization, farm, institution, or other legal entity, you represent that you have authority to bind that entity to these Terms." },
      ],
    },
    {
      number: "3", title: "User Eligibility",
      blocks: [
        { type: "p", text: "BSFDM is primarily intended for professional, operational, business, agricultural, environmental, waste management, and research-related use." },
        { type: "p", text: "You must have the legal capacity and appropriate authorization necessary to use BSFDM." },
        { type: "p", text: "Users may include:" },
        { type: "ul", items: [
          "Super Administrators", "Administrators", "Management users", "Production Operators", "Field Operators",
          "Supervisors", "Clients", "Business Partners", "Researchers", "Consultants", "other authorized users",
        ] },
        { type: "p", text: "Access to certain features may depend on the user's role, organization, subscription, permission level, or system configuration." },
      ],
    },
    {
      number: "4", title: "User Accounts",
      blocks: [
        { type: "p", text: "Certain BSFDM features require a registered account." },
        { type: "p", text: "When creating or using an account, you agree to:" },
        { type: "ul", items: [
          "provide accurate information", "keep your information up to date",
          "maintain the confidentiality of your login credentials", "use a secure password",
          "not share your account with unauthorized persons", "not allow another person to impersonate you",
          "immediately report suspected unauthorized access",
          "remain responsible for activities performed through your account unless otherwise required by applicable law",
        ] },
        { type: "p", text: "BSFDM may suspend access when suspicious, unauthorized, or potentially harmful activity is detected." },
      ],
    },
    {
      number: "5", title: "Role-Based Access",
      blocks: [
        { type: "p", text: "BSFDM may implement Role-Based Access Control." },
        { type: "p", text: "Access to data and features is determined by the permissions assigned to each account." },
        { type: "p", text: "For example:" },
        { type: "role", term: "Super Administrator", intro: "A Super Administrator may have access to:", items: [
          "overall platform configuration", "organization management", "user management",
          "role and permission management", "system configuration", "operational information", "reports",
          "production information", "audit information", "other authorized administrative functions",
        ] },
        { type: "role", term: "Administrator", text: "An Administrator may manage information and users within the scope authorized by the organization." },
        { type: "role", term: "Operator", intro: "An Operator may access operational features necessary for production activities, including:", items: [
          "biopond data", "feed input", "baby maggot stocking", "harvest records", "egg production",
          "kasgot production", "breeding stock", "production calendar", "other authorized operational functions",
        ] },
        { type: "role", term: "Management", text: "Management users may access dashboards, analytics, reports, production summaries, or other information required for monitoring operations." },
        { type: "p", text: "Users must not attempt to access data or features outside their assigned authorization." },
      ],
    },
    {
      number: "6", title: "Authorized Use",
      blocks: [
        { type: "p", text: "You may use BSFDM only for lawful and legitimate purposes related to activities such as:" },
        { type: "ul", items: [
          "BSF production", "organic waste management", "livestock feed management", "environmental management",
          "operational monitoring", "production planning", "sustainability reporting", "research",
          "business administration", "related professional purposes",
        ] },
        { type: "p", text: "You are responsible for ensuring that your use of BSFDM complies with applicable laws, agreements, organizational policies, and industry requirements." },
      ],
    },
    {
      number: "7", title: "Prohibited Activities",
      blocks: [
        { type: "p", text: "Users must not:" },
        { type: "ul", items: [
          "access BSFDM without authorization", "attempt to access another user's account", "bypass security controls",
          "manipulate user permissions without authorization", "obtain data outside their assigned access scope",
          "introduce malware, viruses, ransomware, or malicious code", "interfere with platform performance",
          "attempt unauthorized penetration testing", "exploit vulnerabilities",
          "reverse engineer restricted components of the platform except where legally permitted",
          "copy or reproduce proprietary platform components without authorization",
          "use automated tools to overload BSFDM infrastructure", "submit false or fraudulent information",
          "intentionally manipulate production records", "delete or modify records without authorization",
          "use BSFDM for illegal activities", "impersonate another individual", "misuse confidential business data",
          "scrape or extract platform data in an unauthorized manner",
          "use BSFDM in any way that may damage the platform, its users, or its infrastructure",
        ] },
        { type: "p", text: "BSFDM may restrict or suspend accounts associated with prohibited activities." },
      ],
    },
    {
      number: "8", title: "Operational Data",
      blocks: [
        { type: "p", text: "Users may enter operational information into BSFDM, including:" },
        { type: "ul", items: [
          "production data", "biopond records", "egg production", "feed information", "waste quantity",
          "harvest information", "kasgot production", "client information", "waste collection information",
          "production schedules", "inventory information", "sales information", "operational notes",
        ] },
        { type: "p", text: "The organization or user providing such data remains responsible for its accuracy, legality, and appropriateness." },
        { type: "p", text: "BSFDM provides tools for managing data but does not guarantee that user-entered information is correct." },
      ],
    },
    {
      number: "9", title: "Data Accuracy",
      blocks: [
        { type: "p", text: "Users are responsible for ensuring that information entered into BSFDM is:" },
        { type: "ul", items: ["accurate", "complete", "lawful", "current", "appropriate for the intended operational purpose"] },
        { type: "p", text: "Where inaccurate information is discovered, authorized users should correct it as soon as reasonably possible." },
        { type: "p", text: "BSFDM is not responsible for losses resulting from inaccurate, incomplete, outdated, or incorrectly entered data." },
      ],
    },
    {
      number: "10", title: "Production Calculations and Automated Fields",
      blocks: [
        { type: "p", text: "BSFDM may automatically calculate or generate certain operational information, such as:" },
        { type: "ul", items: [
          "scheduled harvest dates", "production totals", "waste processing totals", "stock availability",
          "feed consumption", "utilization rates", "production summaries", "estimated outputs", "other calculated values",
        ] },
        { type: "p", text: "These calculations depend on the data entered into the platform." },
        { type: "p", text: "Automatically generated results should be treated as operational support tools rather than guaranteed outcomes." },
        { type: "p", text: "Users remain responsible for reviewing important production and business decisions." },
      ],
    },
    {
      number: "11", title: "Notifications and Reminders",
      blocks: [
        { type: "p", text: "BSFDM may provide notifications relating to:" },
        { type: "ul", items: [
          "upcoming harvests", "production schedules", "feed requirements", "biopond status", "calendar events",
          "stock levels", "operational alerts", "system activity", "other relevant information",
        ] },
        { type: "p", text: "Notifications may be delivered through:" },
        { type: "ul", items: ["the BSFDM application", "browser notifications", "email", "messaging services", "other supported communication channels"] },
        { type: "p", text: "BSFDM does not guarantee that every notification will always be delivered immediately or successfully." },
        { type: "p", text: "Users should not rely solely on notifications for critical operational activities." },
      ],
    },
    {
      number: "12", title: "Analytics",
      blocks: [
        { type: "p", text: "BSFDM may provide dashboards, calculations, charts, analytics, and recommendations based on production information." },
        { type: "p", text: "These may include analysis of:" },
        { type: "ul", items: [
          "production performance", "organic waste processing", "feed consumption", "biopond utilization",
          "harvest results", "client contributions", "operational efficiency", "production trends", "sustainability indicators",
        ] },
        { type: "p", text: "Analytics are provided for informational and decision-support purposes." },
        { type: "p", text: "They do not guarantee a particular production, financial, environmental, or business result." },
      ],
    },
    {
      number: "13", title: "Artificial Intelligence Features",
      blocks: [
        { type: "p", text: "BSFDM may introduce artificial intelligence or automated analysis features." },
        { type: "p", text: "Such features may assist with:" },
        { type: "ul", items: [
          "production forecasting", "harvest prediction", "feed analysis", "anomaly detection",
          "waste processing analysis", "operational recommendations", "summaries", "report generation",
          "other data analysis functions",
        ] },
        { type: "p", text: "AI-generated information may contain errors or inaccuracies." },
        { type: "p", text: "Users should independently review important outputs before relying on them for operational, commercial, financial, or regulatory decisions." },
        { type: "p", text: "Human oversight remains recommended for significant decisions." },
      ],
    },
    {
      number: "14", title: "Client and Third-Party Data",
      blocks: [
        { type: "p", text: "Users may enter data relating to clients, hotels, suppliers, partners, farms, waste sources, or other third parties." },
        { type: "p", text: "Users are responsible for ensuring that they have appropriate authorization or lawful grounds to enter and process such information." },
        { type: "p", text: "BSFDM is not responsible for unauthorized data entered by users." },
      ],
    },
    {
      number: "15", title: "Ownership of User Data",
      blocks: [
        { type: "p", text: "Unless otherwise agreed in writing, organizations and users retain ownership of the data they lawfully provide to BSFDM." },
        { type: "p", text: "By using the platform, users authorize BSFDM to process the information as necessary to:" },
        { type: "ul", items: [
          "provide the service", "store the information", "display the information", "perform calculations",
          "generate reports", "maintain backups", "improve system functionality", "secure the platform",
          "fulfill other purposes described in the Privacy Policy",
        ] },
        { type: "p", text: "BSFDM does not claim ownership of legitimate operational data belonging to its users or customer organizations." },
      ],
    },
    {
      number: "16", title: "Aggregated and Anonymous Data",
      blocks: [
        { type: "p", text: "BSFDM may generate aggregated, statistical, or anonymized information derived from platform usage." },
        { type: "p", text: "Such information may be used for:" },
        { type: "ul", items: [
          "platform improvement", "production benchmarking", "BSF industry research", "waste reduction research",
          "environmental analysis", "performance analysis", "sustainability analysis", "service development",
        ] },
        { type: "p", text: "Where such data is used, reasonable measures should be applied to prevent direct identification of individual users." },
      ],
    },
    {
      number: "17", title: "Intellectual Property",
      blocks: [
        { type: "p", text: "BSFDM and its licensors retain all rights relating to the BSFDM platform, including:" },
        { type: "ul", items: [
          "software", "source code", "application architecture", "database structures", "interface design",
          "dashboards", "logos", "trademarks", "illustrations", "graphics", "documentation", "algorithms",
          "system workflows", "templates", "other proprietary materials",
        ] },
        { type: "p", text: "Except where expressly permitted, users may not:" },
        { type: "ul", items: ["copy", "reproduce", "distribute", "modify", "sell", "sublicense", "reverse engineer", "commercially exploit"] },
        { type: "p", text: "any BSFDM proprietary material without prior written authorization." },
      ],
    },
    {
      number: "18", title: "Limited License",
      blocks: [
        { type: "p", text: "Subject to compliance with these Terms, BSFDM grants authorized users a limited, revocable, non-exclusive, non-transferable right to access and use the platform for its intended purposes." },
        { type: "p", text: "This license does not transfer ownership of BSFDM intellectual property." },
      ],
    },
    {
      number: "19", title: "Availability of Service",
      blocks: [
        { type: "p", text: "We aim to maintain reliable access to BSFDM." },
        { type: "p", text: "However, BSFDM may occasionally become unavailable due to:" },
        { type: "ul", items: [
          "maintenance", "software updates", "infrastructure changes", "server failures", "internet disruptions",
          "security incidents", "third-party service failures", "database maintenance", "emergency repairs",
          "circumstances outside our reasonable control",
        ] },
        { type: "p", text: "We do not guarantee uninterrupted or error-free availability at all times." },
      ],
    },
    {
      number: "20", title: "Maintenance and Updates",
      blocks: [
        { type: "p", text: "BSFDM may perform scheduled or emergency maintenance." },
        { type: "p", text: "During maintenance, certain features may temporarily become unavailable." },
        { type: "p", text: "The platform may also receive updates to:" },
        { type: "ul", items: [
          "improve performance", "improve security", "fix bugs", "introduce features", "modify workflows",
          "improve usability", "respond to regulatory or operational requirements",
        ] },
        { type: "p", text: "Where practical, significant changes may be communicated to users." },
      ],
    },
    {
      number: "21", title: "Backup and Data Recovery",
      blocks: [
        { type: "p", text: "BSFDM may implement backup procedures to reduce the risk of data loss." },
        { type: "p", text: "However, backup systems cannot guarantee recovery of every piece of information in every situation." },
        { type: "p", text: "Users and organizations should maintain appropriate independent records for information that is critical to their operations where necessary." },
      ],
    },
    {
      number: "22", title: "Security",
      blocks: [
        { type: "p", text: "BSFDM may implement reasonable administrative, technical, and organizational security measures." },
        { type: "p", text: "Users are also responsible for protecting their accounts." },
        { type: "p", text: "Users must immediately notify the administrator if they become aware of:" },
        { type: "ul", items: ["unauthorized login", "stolen credentials", "suspicious activity", "unauthorized data access", "potential data breach", "other security incidents"] },
      ],
    },
    {
      number: "23", title: "Third-Party Services",
      blocks: [
        { type: "p", text: "BSFDM may depend on third-party services such as:" },
        { type: "ul", items: [
          "cloud hosting", "databases", "email providers", "messaging platforms", "authentication providers",
          "mapping services", "analytics platforms", "monitoring systems", "notification providers", "other technology services",
        ] },
        { type: "p", text: "BSFDM is not responsible for failures caused entirely by external third-party services outside our reasonable control." },
        { type: "p", text: "Use of third-party services may also be subject to their respective terms and privacy policies." },
      ],
    },
    {
      number: "24", title: "External Links",
      blocks: [
        { type: "p", text: "BSFDM may contain links to external websites or services." },
        { type: "p", text: "These external services are operated independently." },
        { type: "p", text: "BSFDM does not control and is not responsible for:" },
        { type: "ul", items: ["external content", "third-party privacy practices", "external security", "third-party services", "transactions conducted outside BSFDM"] },
        { type: "p", text: "Users should review the terms and privacy policies of third-party services before using them." },
      ],
    },
    {
      number: "25", title: "Subscription and Paid Services",
      blocks: [
        { type: "p", text: "Certain BSFDM services may in the future be offered under paid subscription plans." },
        { type: "p", text: "Where paid services are introduced, additional information may be provided regarding:" },
        { type: "ul", items: ["pricing", "subscription periods", "billing", "user limits", "data limits", "feature access", "renewal", "cancellation", "payment terms"] },
        { type: "p", text: "Paid services may also be subject to separate agreements or commercial terms." },
      ],
    },
    {
      number: "26", title: "Account Suspension",
      blocks: [
        { type: "p", text: "BSFDM may temporarily suspend an account if there is a reasonable indication of:" },
        { type: "ul", items: [
          "unauthorized access", "security risk", "misuse", "violation of these Terms", "fraudulent activity",
          "repeated attempts to bypass permissions", "illegal activities", "behavior that threatens the platform or other users",
        ] },
        { type: "p", text: "Where appropriate, users may be informed of the reason for suspension." },
      ],
    },
    {
      number: "27", title: "Account Termination",
      blocks: [
        { type: "p", text: "BSFDM may terminate access where:" },
        { type: "ul", items: [
          "a serious violation of these Terms occurs", "illegal activities are identified",
          "the account creates security risks", "contractual relationships end",
          "the organization requests account removal", "continued access is no longer authorized",
        ] },
        { type: "p", text: "Users may also request termination of their accounts subject to applicable organizational, contractual, legal, and data retention requirements." },
      ],
    },
    {
      number: "28", title: "Effect of Termination",
      blocks: [
        { type: "p", text: "When an account is terminated:" },
        { type: "ul", items: [
          "access to BSFDM may be revoked", "active sessions may be closed", "certain user information may be deleted",
          "certain operational records may remain", "audit logs may be retained", "data may remain in backups temporarily",
          "legally or operationally necessary records may continue to be retained",
        ] },
        { type: "p", text: "Termination does not automatically require deletion of all operational information." },
      ],
    },
    {
      number: "29", title: "Privacy",
      blocks: [
        { type: "p", text: "Use of BSFDM is also governed by the BSFDM Privacy Policy." },
        { type: "p", text: "The Privacy Policy explains how personal data and other information may be:" },
        { type: "ul", items: ["collected", "used", "stored", "protected", "shared", "retained"] },
        { type: "p", text: "By using BSFDM, users acknowledge that they have reviewed the applicable Privacy Policy." },
      ],
    },
    {
      number: "30", title: "Confidential Information",
      blocks: [
        { type: "p", text: "Users may obtain access to confidential operational, production, customer, technical, or business information." },
        { type: "p", text: "Users agree not to:" },
        { type: "ul", items: [
          "disclose confidential information without authorization", "copy confidential data for unauthorized purposes",
          "share internal reports with unauthorized persons", "misuse client information",
          "use confidential information for purposes unrelated to authorized activities",
        ] },
        { type: "p", text: "Confidentiality obligations may continue even after account access ends where appropriate." },
      ],
    },
    {
      number: "31", title: "No Guarantee of Production Results",
      blocks: [
        { type: "p", text: "BSF biological production is affected by many factors, including:" },
        { type: "ul", items: [
          "feed quality", "feed quantity", "environmental temperature", "humidity", "larval density",
          "substrate conditions", "water content", "genetics", "facility management", "worker practices",
          "disease", "pests", "weather", "production methods", "other biological or environmental variables",
        ] },
        { type: "p", text: "Therefore, information provided through BSFDM does not guarantee:" },
        { type: "ul", items: [
          "specific maggot production", "specific egg production", "specific conversion rates",
          "specific harvest weights", "specific financial results", "specific waste reduction levels", "specific biological performance",
        ] },
        { type: "p", text: "BSFDM is a management and decision-support platform." },
        { type: "p", text: "Final operational decisions remain the responsibility of the user or organization." },
      ],
    },
    {
      number: "32", title: "No Professional Advice",
      blocks: [
        { type: "p", text: "Unless expressly stated otherwise, information provided by BSFDM does not constitute:" },
        { type: "ul", items: [
          "legal advice", "financial advice", "veterinary advice", "agricultural certification",
          "environmental certification", "accounting advice", "tax advice", "regulatory approval",
        ] },
        { type: "p", text: "Users should consult qualified professionals where specialized advice is required." },
      ],
    },
    {
      number: "33", title: "Limitation of Liability",
      blocks: [
        { type: "p", text: "To the extent permitted by applicable law, BSFDM shall not be liable for indirect, incidental, consequential, or special losses arising from:" },
        { type: "ul", items: [
          "incorrect user input", "unauthorized account access caused by compromised user credentials",
          "inaccurate operational information", "production failures", "biological losses", "missed harvest schedules",
          "internet outages", "third-party service failures", "hardware failures", "improper use of the platform",
          "decisions made solely based on automated calculations or recommendations",
        ] },
        { type: "p", text: "Nothing in these Terms excludes liability that cannot legally be excluded under applicable law." },
      ],
    },
    {
      number: "34", title: "User Responsibility for Operational Decisions",
      blocks: [
        { type: "p", text: "Users remain responsible for operational decisions made using BSFDM." },
        { type: "p", text: "This includes decisions relating to:" },
        { type: "ul", items: [
          "feeding", "harvesting", "stocking", "breeding", "waste acceptance", "production scheduling",
          "sales", "inventory", "workforce", "client operations", "facility management",
        ] },
        { type: "p", text: "BSFDM is intended to support, not replace, appropriate professional judgment and operational supervision." },
      ],
    },
    {
      number: "35", title: "Force Majeure",
      blocks: [
        { type: "p", text: "BSFDM will not be responsible for failures or delays caused by circumstances beyond reasonable control, including:" },
        { type: "ul", items: [
          "natural disasters", "earthquakes", "floods", "fire", "power outages", "internet infrastructure failures",
          "government restrictions", "war", "civil disruption", "cyberattacks",
          "widespread cloud infrastructure failures", "other comparable events",
        ] },
      ],
    },
    {
      number: "36", title: "Changes to the Platform",
      blocks: [
        { type: "p", text: "BSFDM may modify, add, remove, or replace platform features." },
        { type: "p", text: "Changes may be made to:" },
        { type: "ul", items: [
          "improve functionality", "improve security", "respond to user feedback", "support new operational processes",
          "comply with legal requirements", "develop new services",
        ] },
        { type: "p", text: "BSFDM does not guarantee that every feature will remain permanently available." },
      ],
    },
    {
      number: "37", title: "Changes to These Terms",
      blocks: [
        { type: "p", text: "These Terms may be updated periodically." },
        { type: "p", text: "Updates may be made due to:" },
        { type: "ul", items: ["platform development", "operational changes", "security changes", "business changes", "new services", "legal requirements"] },
        { type: "p", text: "The latest version will be made available through the BSFDM website or platform." },
        { type: "p", text: "The “Last Updated” date indicates the latest revision." },
        { type: "p", text: "Continued use of BSFDM after updated Terms become effective may constitute acceptance of the updated Terms to the extent permitted by applicable law." },
      ],
    },
    {
      number: "38", title: "Governing Law",
      blocks: [
        { type: "p", text: "These Terms are governed by and interpreted in accordance with the applicable laws and regulations of the Republic of Indonesia." },
      ],
    },
    {
      number: "39", title: "Dispute Resolution",
      blocks: [
        { type: "p", text: "If a dispute arises relating to BSFDM, the parties should first attempt to resolve the matter through good-faith discussion or negotiation." },
        { type: "p", text: "Where a resolution cannot be reached, the dispute may be resolved through the competent dispute resolution mechanism or court in accordance with applicable Indonesian law and any separate agreement between the parties." },
      ],
    },
    {
      number: "40", title: "Severability",
      blocks: [
        { type: "p", text: "If any provision of these Terms is determined to be invalid or unenforceable, the remaining provisions will continue to apply to the extent permitted by law." },
      ],
    },
    {
      number: "41", title: "No Waiver",
      blocks: [
        { type: "p", text: "Failure by BSFDM to enforce a provision of these Terms does not constitute a waiver of the right to enforce that provision later." },
      ],
    },
    {
      number: "42", title: "Entire Agreement",
      blocks: [
        { type: "p", text: "These Terms, together with the Privacy Policy and any applicable written agreements between BSFDM and the user or organization, constitute the applicable agreement governing use of the platform." },
        { type: "p", text: "Where a separate written commercial agreement conflicts with these Terms, the written commercial agreement may take precedence to the extent specified in that agreement." },
      ],
    },
  ],
};

const id = {
  title: "Syarat dan Ketentuan",
  lastUpdatedLabel: "Terakhir Diperbarui",
  lastUpdated: "17 September 2026",
  intro: [
    "Selamat datang di BSFDM — Black Soldier Fly Data Management.",
    "Syarat dan Ketentuan ini (“Ketentuan”) mengatur akses dan penggunaan Anda atas situs web, aplikasi, dasbor, layanan, fitur, API, dan sistem terkait BSFDM yang tersedia melalui bsfdm.id dan layanan BSFDM terkait.",
    "Dengan mengakses, mendaftar, atau menggunakan BSFDM, Anda setuju untuk terikat oleh Ketentuan ini.",
    "Jika Anda tidak menyetujui Ketentuan ini, Anda tidak boleh mengakses atau menggunakan BSFDM.",
  ],
  closing: [
    "Dengan membuat akun atau terus menggunakan BSFDM, Anda mengakui bahwa Anda telah membaca, memahami, dan menyetujui Syarat dan Ketentuan ini.",
  ],
  sections: [
    {
      number: "1", title: "Tentang BSFDM",
      blocks: [
        { type: "p", text: "BSFDM adalah platform manajemen digital yang dirancang untuk mendukung produksi Black Soldier Fly (BSF) dan operasional pengelolaan sampah organik." },
        { type: "p", text: "Platform ini dapat menyediakan fitur-fitur termasuk:" },
        { type: "ul", items: [
          "pemantauan produksi", "manajemen biopond", "catatan produksi telur BSF", "catatan penebaran baby maggot",
          "panen maggot", "manajemen prepupa dan pupa", "manajemen indukan (breeding stock)", "manajemen pakan",
          "catatan pemasukan sampah organik", "manajemen sumber sampah", "manajemen klien", "catatan kasgot atau pupuk organik",
          "manajemen inventaris", "penjadwalan", "kalender produksi", "notifikasi", "dasbor", "pelaporan",
          "analitik operasional", "manajemen pengguna", "kontrol akses berbasis peran", "catatan produksi historis",
          "alat operasional lain yang terkait dengan BSF",
        ] },
        { type: "p", text: "Fitur dapat ditambahkan, diubah, ditingkatkan, dibatasi, atau dihapus seiring perkembangan platform BSFDM." },
      ],
    },
    {
      number: "2", title: "Penerimaan Ketentuan",
      blocks: [
        { type: "p", text: "Dengan membuat akun, mengakses platform, atau menggunakan layanan BSFDM, Anda menyatakan bahwa:" },
        { type: "ul", items: [
          "Anda telah membaca dan memahami Ketentuan ini", "Anda setuju untuk mematuhi Ketentuan ini",
          "Anda berwenang untuk menggunakan BSFDM atas nama diri Anda sendiri atau organisasi Anda",
          "informasi yang Anda berikan akurat dan sah", "Anda akan menggunakan BSFDM hanya untuk tujuan yang sah",
        ] },
        { type: "p", text: "Jika Anda menggunakan BSFDM atas nama perusahaan, organisasi, peternakan, institusi, atau badan hukum lainnya, Anda menyatakan bahwa Anda memiliki wewenang untuk mengikat badan tersebut pada Ketentuan ini." },
      ],
    },
    {
      number: "3", title: "Kelayakan Pengguna",
      blocks: [
        { type: "p", text: "BSFDM terutama ditujukan untuk penggunaan profesional, operasional, bisnis, pertanian, lingkungan, pengelolaan sampah, dan penelitian." },
        { type: "p", text: "Anda harus memiliki kecakapan hukum dan otorisasi yang sesuai yang diperlukan untuk menggunakan BSFDM." },
        { type: "p", text: "Pengguna dapat mencakup:" },
        { type: "ul", items: [
          "Super Administrator", "Administrator", "pengguna Management", "Operator Produksi", "Operator Lapangan",
          "Supervisor", "Klien", "Mitra Bisnis", "Peneliti", "Konsultan", "pengguna resmi lainnya",
        ] },
        { type: "p", text: "Akses ke fitur tertentu dapat bergantung pada peran pengguna, organisasi, langganan, tingkat izin, atau konfigurasi sistem." },
      ],
    },
    {
      number: "4", title: "Akun Pengguna",
      blocks: [
        { type: "p", text: "Fitur BSFDM tertentu memerlukan akun terdaftar." },
        { type: "p", text: "Saat membuat atau menggunakan akun, Anda setuju untuk:" },
        { type: "ul", items: [
          "memberikan informasi yang akurat", "menjaga informasi Anda tetap mutakhir",
          "menjaga kerahasiaan kredensial login Anda", "menggunakan kata sandi yang aman",
          "tidak membagikan akun Anda kepada pihak yang tidak berwenang", "tidak mengizinkan orang lain menyamar sebagai Anda",
          "segera melaporkan dugaan akses tidak sah",
          "tetap bertanggung jawab atas aktivitas yang dilakukan melalui akun Anda kecuali diwajibkan lain oleh hukum yang berlaku",
        ] },
        { type: "p", text: "BSFDM dapat menangguhkan akses ketika aktivitas yang mencurigakan, tidak sah, atau berpotensi membahayakan terdeteksi." },
      ],
    },
    {
      number: "5", title: "Akses Berbasis Peran",
      blocks: [
        { type: "p", text: "BSFDM dapat menerapkan Kontrol Akses Berbasis Peran." },
        { type: "p", text: "Akses terhadap data dan fitur ditentukan oleh izin yang diberikan kepada masing-masing akun." },
        { type: "p", text: "Sebagai contoh:" },
        { type: "role", term: "Super Administrator", intro: "Seorang Super Administrator dapat memiliki akses terhadap:", items: [
          "konfigurasi platform secara keseluruhan", "manajemen organisasi", "manajemen pengguna",
          "manajemen peran dan izin", "konfigurasi sistem", "informasi operasional", "laporan",
          "informasi produksi", "informasi audit", "fungsi administratif resmi lainnya",
        ] },
        { type: "role", term: "Administrator", text: "Seorang Administrator dapat mengelola informasi dan pengguna dalam ruang lingkup yang diizinkan oleh organisasi." },
        { type: "role", term: "Operator", intro: "Seorang Operator dapat mengakses fitur operasional yang diperlukan untuk aktivitas produksi, termasuk:", items: [
          "data biopond", "input pakan", "penebaran baby maggot", "catatan panen", "produksi telur",
          "produksi kasgot", "indukan (breeding stock)", "kalender produksi", "fungsi operasional resmi lainnya",
        ] },
        { type: "role", term: "Management", text: "Pengguna Management dapat mengakses dasbor, analitik, laporan, ringkasan produksi, atau informasi lain yang diperlukan untuk pemantauan operasional." },
        { type: "p", text: "Pengguna tidak boleh berupaya mengakses data atau fitur di luar wewenang yang diberikan kepada mereka." },
      ],
    },
    {
      number: "6", title: "Penggunaan yang Diizinkan",
      blocks: [
        { type: "p", text: "Anda hanya boleh menggunakan BSFDM untuk tujuan yang sah dan legitimate terkait aktivitas seperti:" },
        { type: "ul", items: [
          "produksi BSF", "pengelolaan sampah organik", "manajemen pakan ternak", "manajemen lingkungan",
          "pemantauan operasional", "perencanaan produksi", "pelaporan keberlanjutan", "penelitian",
          "administrasi bisnis", "tujuan profesional terkait lainnya",
        ] },
        { type: "p", text: "Anda bertanggung jawab untuk memastikan bahwa penggunaan BSFDM oleh Anda mematuhi hukum yang berlaku, perjanjian, kebijakan organisasi, dan persyaratan industri." },
      ],
    },
    {
      number: "7", title: "Aktivitas yang Dilarang",
      blocks: [
        { type: "p", text: "Pengguna dilarang untuk:" },
        { type: "ul", items: [
          "mengakses BSFDM tanpa otorisasi", "berupaya mengakses akun pengguna lain", "melewati kontrol keamanan",
          "memanipulasi izin pengguna tanpa otorisasi", "memperoleh data di luar ruang lingkup akses yang diberikan",
          "memasukkan malware, virus, ransomware, atau kode berbahaya lainnya", "mengganggu kinerja platform",
          "berupaya melakukan penetration testing tanpa izin", "mengeksploitasi kerentanan (vulnerability)",
          "melakukan reverse engineering terhadap komponen platform yang dibatasi kecuali diizinkan secara hukum",
          "menyalin atau memperbanyak komponen platform yang bersifat proprietary tanpa otorisasi",
          "menggunakan alat otomatis untuk membebani infrastruktur BSFDM secara berlebihan",
          "mengirimkan informasi palsu atau menyesatkan", "memanipulasi catatan produksi secara sengaja",
          "menghapus atau mengubah catatan tanpa otorisasi", "menggunakan BSFDM untuk aktivitas ilegal",
          "menyamar sebagai individu lain", "menyalahgunakan data bisnis yang bersifat rahasia",
          "melakukan scraping atau ekstraksi data platform secara tidak sah",
          "menggunakan BSFDM dengan cara apa pun yang dapat merusak platform, penggunanya, atau infrastrukturnya",
        ] },
        { type: "p", text: "BSFDM dapat membatasi atau menangguhkan akun yang terkait dengan aktivitas yang dilarang." },
      ],
    },
    {
      number: "8", title: "Data Operasional",
      blocks: [
        { type: "p", text: "Pengguna dapat memasukkan informasi operasional ke dalam BSFDM, termasuk:" },
        { type: "ul", items: [
          "data produksi", "catatan biopond", "produksi telur", "informasi pakan", "jumlah sampah",
          "informasi panen", "produksi kasgot", "informasi klien", "informasi pengambilan sampah",
          "jadwal produksi", "informasi inventaris", "informasi penjualan", "catatan operasional",
        ] },
        { type: "p", text: "Organisasi atau pengguna yang memberikan data tersebut tetap bertanggung jawab atas keakuratan, keabsahan, dan kesesuaiannya." },
        { type: "p", text: "BSFDM menyediakan alat untuk mengelola data namun tidak menjamin bahwa informasi yang dimasukkan oleh pengguna sudah benar." },
      ],
    },
    {
      number: "9", title: "Keakuratan Data",
      blocks: [
        { type: "p", text: "Pengguna bertanggung jawab untuk memastikan bahwa informasi yang dimasukkan ke dalam BSFDM adalah:" },
        { type: "ul", items: ["akurat", "lengkap", "sah", "mutakhir", "sesuai dengan tujuan operasional yang dimaksud"] },
        { type: "p", text: "Apabila ditemukan informasi yang tidak akurat, pengguna yang berwenang sebaiknya segera melakukan koreksi." },
        { type: "p", text: "BSFDM tidak bertanggung jawab atas kerugian yang timbul akibat data yang tidak akurat, tidak lengkap, kedaluwarsa, atau salah dimasukkan." },
      ],
    },
    {
      number: "10", title: "Perhitungan Produksi dan Kolom Otomatis",
      blocks: [
        { type: "p", text: "BSFDM dapat secara otomatis menghitung atau menghasilkan informasi operasional tertentu, seperti:" },
        { type: "ul", items: [
          "tanggal panen terjadwal", "total produksi", "total pengolahan sampah", "ketersediaan stok",
          "konsumsi pakan", "tingkat pemanfaatan (utilization)", "ringkasan produksi", "estimasi hasil", "nilai kalkulasi lainnya",
        ] },
        { type: "p", text: "Perhitungan ini bergantung pada data yang dimasukkan ke dalam platform." },
        { type: "p", text: "Hasil yang dihasilkan secara otomatis harus diperlakukan sebagai alat bantu operasional, bukan hasil yang dijamin." },
        { type: "p", text: "Pengguna tetap bertanggung jawab untuk meninjau keputusan produksi dan bisnis yang penting." },
      ],
    },
    {
      number: "11", title: "Notifikasi dan Pengingat",
      blocks: [
        { type: "p", text: "BSFDM dapat memberikan notifikasi terkait:" },
        { type: "ul", items: [
          "panen yang akan datang", "jadwal produksi", "kebutuhan pakan", "status biopond", "acara kalender",
          "tingkat stok", "peringatan operasional", "aktivitas sistem", "informasi relevan lainnya",
        ] },
        { type: "p", text: "Notifikasi dapat dikirimkan melalui:" },
        { type: "ul", items: ["aplikasi BSFDM", "notifikasi browser", "email", "layanan pesan", "saluran komunikasi lain yang didukung"] },
        { type: "p", text: "BSFDM tidak menjamin bahwa setiap notifikasi akan selalu terkirim dengan segera atau berhasil." },
        { type: "p", text: "Pengguna tidak boleh hanya mengandalkan notifikasi untuk aktivitas operasional yang kritis." },
      ],
    },
    {
      number: "12", title: "Analitik",
      blocks: [
        { type: "p", text: "BSFDM dapat menyediakan dasbor, perhitungan, grafik, analitik, dan rekomendasi berdasarkan informasi produksi." },
        { type: "p", text: "Hal ini dapat mencakup analisis terhadap:" },
        { type: "ul", items: [
          "kinerja produksi", "pengolahan sampah organik", "konsumsi pakan", "pemanfaatan biopond",
          "hasil panen", "kontribusi klien", "efisiensi operasional", "tren produksi", "indikator keberlanjutan",
        ] },
        { type: "p", text: "Analitik disediakan untuk tujuan informasi dan pendukung pengambilan keputusan." },
        { type: "p", text: "Analitik tidak menjamin hasil produksi, keuangan, lingkungan, atau bisnis tertentu." },
      ],
    },
    {
      number: "13", title: "Fitur Kecerdasan Buatan",
      blocks: [
        { type: "p", text: "BSFDM dapat menghadirkan fitur kecerdasan buatan atau analisis otomatis." },
        { type: "p", text: "Fitur tersebut dapat membantu dalam:" },
        { type: "ul", items: [
          "prediksi produksi", "prediksi panen", "analisis pakan", "deteksi anomali",
          "analisis pengolahan sampah", "rekomendasi operasional", "ringkasan", "pembuatan laporan",
          "fungsi analisis data lainnya",
        ] },
        { type: "p", text: "Informasi yang dihasilkan AI dapat mengandung kesalahan atau ketidakakuratan." },
        { type: "p", text: "Pengguna sebaiknya meninjau secara independen hasil-hasil penting sebelum mengandalkannya untuk keputusan operasional, komersial, keuangan, atau regulasi." },
        { type: "p", text: "Pengawasan oleh manusia tetap disarankan untuk keputusan-keputusan penting." },
      ],
    },
    {
      number: "14", title: "Data Klien dan Pihak Ketiga",
      blocks: [
        { type: "p", text: "Pengguna dapat memasukkan data terkait klien, hotel, pemasok, mitra, peternakan, sumber sampah, atau pihak ketiga lainnya." },
        { type: "p", text: "Pengguna bertanggung jawab untuk memastikan bahwa mereka memiliki otorisasi yang sesuai atau dasar hukum untuk memasukkan dan memproses informasi tersebut." },
        { type: "p", text: "BSFDM tidak bertanggung jawab atas data yang dimasukkan pengguna tanpa otorisasi." },
      ],
    },
    {
      number: "15", title: "Kepemilikan Data Pengguna",
      blocks: [
        { type: "p", text: "Kecuali disepakati lain secara tertulis, organisasi dan pengguna tetap memiliki kepemilikan atas data yang mereka berikan secara sah kepada BSFDM." },
        { type: "p", text: "Dengan menggunakan platform ini, pengguna mengizinkan BSFDM untuk memproses informasi sebagaimana diperlukan untuk:" },
        { type: "ul", items: [
          "menyediakan layanan", "menyimpan informasi", "menampilkan informasi", "melakukan perhitungan",
          "menghasilkan laporan", "memelihara cadangan (backup)", "meningkatkan fungsi sistem", "mengamankan platform",
          "memenuhi tujuan lain yang dijelaskan dalam Kebijakan Privasi",
        ] },
        { type: "p", text: "BSFDM tidak mengklaim kepemilikan atas data operasional yang sah milik pengguna atau organisasi pelanggannya." },
      ],
    },
    {
      number: "16", title: "Data Agregat dan Anonim",
      blocks: [
        { type: "p", text: "BSFDM dapat menghasilkan informasi agregat, statistik, atau anonim yang berasal dari penggunaan platform." },
        { type: "p", text: "Informasi tersebut dapat digunakan untuk:" },
        { type: "ul", items: [
          "peningkatan platform", "benchmarking produksi", "penelitian industri BSF", "penelitian pengurangan sampah",
          "analisis lingkungan", "analisis kinerja", "analisis keberlanjutan", "pengembangan layanan",
        ] },
        { type: "p", text: "Ketika data tersebut digunakan, langkah-langkah yang wajar harus diterapkan untuk mencegah identifikasi langsung terhadap pengguna individu." },
      ],
    },
    {
      number: "17", title: "Kekayaan Intelektual",
      blocks: [
        { type: "p", text: "BSFDM dan pemberi lisensinya tetap memiliki seluruh hak terkait platform BSFDM, termasuk:" },
        { type: "ul", items: [
          "perangkat lunak", "kode sumber", "arsitektur aplikasi", "struktur basis data", "desain antarmuka",
          "dasbor", "logo", "merek dagang", "ilustrasi", "grafis", "dokumentasi", "algoritma",
          "alur kerja sistem", "templat", "materi proprietary lainnya",
        ] },
        { type: "p", text: "Kecuali diizinkan secara tegas, pengguna dilarang untuk:" },
        { type: "ul", items: ["menyalin", "memperbanyak", "mendistribusikan", "mengubah", "menjual", "melisensikan ulang (sublicense)", "melakukan reverse engineering", "mengeksploitasi secara komersial"] },
        { type: "p", text: "materi proprietary BSFDM apa pun tanpa otorisasi tertulis sebelumnya." },
      ],
    },
    {
      number: "18", title: "Lisensi Terbatas",
      blocks: [
        { type: "p", text: "Dengan tunduk pada kepatuhan terhadap Ketentuan ini, BSFDM memberikan pengguna resmi hak yang terbatas, dapat dicabut, non-eksklusif, dan tidak dapat dialihkan untuk mengakses dan menggunakan platform sesuai dengan tujuannya." },
        { type: "p", text: "Lisensi ini tidak mengalihkan kepemilikan atas kekayaan intelektual BSFDM." },
      ],
    },
    {
      number: "19", title: "Ketersediaan Layanan",
      blocks: [
        { type: "p", text: "Kami berupaya menjaga akses yang andal terhadap BSFDM." },
        { type: "p", text: "Namun, BSFDM sesekali dapat menjadi tidak tersedia karena:" },
        { type: "ul", items: [
          "pemeliharaan", "pembaruan perangkat lunak", "perubahan infrastruktur", "kegagalan server",
          "gangguan internet", "insiden keamanan", "kegagalan layanan pihak ketiga", "pemeliharaan basis data",
          "perbaikan darurat", "keadaan di luar kendali wajar kami",
        ] },
        { type: "p", text: "Kami tidak menjamin ketersediaan yang terus-menerus atau bebas dari kesalahan setiap saat." },
      ],
    },
    {
      number: "20", title: "Pemeliharaan dan Pembaruan",
      blocks: [
        { type: "p", text: "BSFDM dapat melakukan pemeliharaan terjadwal atau darurat." },
        { type: "p", text: "Selama pemeliharaan, fitur tertentu dapat sementara tidak tersedia." },
        { type: "p", text: "Platform ini juga dapat menerima pembaruan untuk:" },
        { type: "ul", items: [
          "meningkatkan kinerja", "meningkatkan keamanan", "memperbaiki bug", "menghadirkan fitur baru",
          "mengubah alur kerja", "meningkatkan kemudahan penggunaan", "memenuhi persyaratan regulasi atau operasional",
        ] },
        { type: "p", text: "Jika memungkinkan, perubahan signifikan dapat dikomunikasikan kepada pengguna." },
      ],
    },
    {
      number: "21", title: "Pencadangan dan Pemulihan Data",
      blocks: [
        { type: "p", text: "BSFDM dapat menerapkan prosedur pencadangan (backup) untuk mengurangi risiko kehilangan data." },
        { type: "p", text: "Namun, sistem cadangan tidak dapat menjamin pemulihan setiap informasi dalam setiap situasi." },
        { type: "p", text: "Pengguna dan organisasi sebaiknya memelihara catatan independen yang sesuai untuk informasi yang penting bagi operasional mereka bila diperlukan." },
      ],
    },
    {
      number: "22", title: "Keamanan",
      blocks: [
        { type: "p", text: "BSFDM dapat menerapkan langkah-langkah keamanan administratif, teknis, dan organisasi yang wajar." },
        { type: "p", text: "Pengguna juga bertanggung jawab untuk melindungi akun mereka." },
        { type: "p", text: "Pengguna harus segera memberi tahu administrator apabila mengetahui adanya:" },
        { type: "ul", items: ["login tidak sah", "kredensial yang dicuri", "aktivitas mencurigakan", "akses data tidak sah", "potensi pelanggaran data", "insiden keamanan lainnya"] },
      ],
    },
    {
      number: "23", title: "Layanan Pihak Ketiga",
      blocks: [
        { type: "p", text: "BSFDM dapat bergantung pada layanan pihak ketiga seperti:" },
        { type: "ul", items: [
          "hosting cloud", "basis data", "penyedia email", "platform pesan", "penyedia autentikasi",
          "layanan pemetaan", "platform analitik", "sistem pemantauan", "penyedia notifikasi", "layanan teknologi lainnya",
        ] },
        { type: "p", text: "BSFDM tidak bertanggung jawab atas kegagalan yang sepenuhnya disebabkan oleh layanan pihak ketiga eksternal di luar kendali wajar kami." },
        { type: "p", text: "Penggunaan layanan pihak ketiga juga dapat tunduk pada ketentuan dan kebijakan privasi masing-masing penyedia." },
      ],
    },
    {
      number: "24", title: "Tautan Eksternal",
      blocks: [
        { type: "p", text: "BSFDM dapat memuat tautan ke situs web atau layanan eksternal." },
        { type: "p", text: "Layanan eksternal tersebut dioperasikan secara independen." },
        { type: "p", text: "BSFDM tidak mengendalikan dan tidak bertanggung jawab atas:" },
        { type: "ul", items: ["konten eksternal", "praktik privasi pihak ketiga", "keamanan eksternal", "layanan pihak ketiga", "transaksi yang dilakukan di luar BSFDM"] },
        { type: "p", text: "Pengguna sebaiknya meninjau ketentuan dan kebijakan privasi layanan pihak ketiga sebelum menggunakannya." },
      ],
    },
    {
      number: "25", title: "Langganan dan Layanan Berbayar",
      blocks: [
        { type: "p", text: "Layanan BSFDM tertentu di masa mendatang dapat ditawarkan berdasarkan paket langganan berbayar." },
        { type: "p", text: "Ketika layanan berbayar diperkenalkan, informasi tambahan dapat diberikan mengenai:" },
        { type: "ul", items: ["harga", "periode langganan", "penagihan", "batas pengguna", "batas data", "akses fitur", "perpanjangan", "pembatalan", "ketentuan pembayaran"] },
        { type: "p", text: "Layanan berbayar juga dapat tunduk pada perjanjian atau ketentuan komersial yang terpisah." },
      ],
    },
    {
      number: "26", title: "Penangguhan Akun",
      blocks: [
        { type: "p", text: "BSFDM dapat menangguhkan sementara suatu akun apabila terdapat indikasi wajar mengenai:" },
        { type: "ul", items: [
          "akses tidak sah", "risiko keamanan", "penyalahgunaan", "pelanggaran terhadap Ketentuan ini",
          "aktivitas penipuan", "upaya berulang untuk melewati izin", "aktivitas ilegal",
          "perilaku yang mengancam platform atau pengguna lain",
        ] },
        { type: "p", text: "Jika sesuai, pengguna dapat diberi tahu mengenai alasan penangguhan." },
      ],
    },
    {
      number: "27", title: "Penghentian Akun",
      blocks: [
        { type: "p", text: "BSFDM dapat menghentikan akses apabila:" },
        { type: "ul", items: [
          "terjadi pelanggaran serius terhadap Ketentuan ini", "teridentifikasi aktivitas ilegal",
          "akun tersebut menimbulkan risiko keamanan", "hubungan kontraktual berakhir",
          "organisasi meminta penghapusan akun", "akses lanjutan tidak lagi diizinkan",
        ] },
        { type: "p", text: "Pengguna juga dapat meminta penghentian akun mereka dengan tunduk pada persyaratan organisasi, kontraktual, hukum, dan retensi data yang berlaku." },
      ],
    },
    {
      number: "28", title: "Akibat Penghentian",
      blocks: [
        { type: "p", text: "Ketika suatu akun dihentikan:" },
        { type: "ul", items: [
          "akses ke BSFDM dapat dicabut", "sesi aktif dapat ditutup", "informasi pengguna tertentu dapat dihapus",
          "catatan operasional tertentu dapat tetap tersimpan", "log audit dapat tetap disimpan",
          "data dapat tetap berada sementara dalam cadangan (backup)",
          "catatan yang diperlukan secara hukum atau operasional dapat terus disimpan",
        ] },
        { type: "p", text: "Penghentian tidak secara otomatis mengharuskan penghapusan seluruh informasi operasional." },
      ],
    },
    {
      number: "29", title: "Privasi",
      blocks: [
        { type: "p", text: "Penggunaan BSFDM juga diatur oleh Kebijakan Privasi BSFDM." },
        { type: "p", text: "Kebijakan Privasi menjelaskan bagaimana data pribadi dan informasi lainnya dapat:" },
        { type: "ul", items: ["dikumpulkan", "digunakan", "disimpan", "dilindungi", "dibagikan", "disimpan (retensi)"] },
        { type: "p", text: "Dengan menggunakan BSFDM, pengguna mengakui bahwa mereka telah meninjau Kebijakan Privasi yang berlaku." },
      ],
    },
    {
      number: "30", title: "Informasi Rahasia",
      blocks: [
        { type: "p", text: "Pengguna dapat memperoleh akses terhadap informasi rahasia yang bersifat operasional, produksi, pelanggan, teknis, atau bisnis." },
        { type: "p", text: "Pengguna setuju untuk tidak:" },
        { type: "ul", items: [
          "mengungkapkan informasi rahasia tanpa otorisasi", "menyalin data rahasia untuk tujuan yang tidak sah",
          "membagikan laporan internal kepada pihak yang tidak berwenang", "menyalahgunakan informasi klien",
          "menggunakan informasi rahasia untuk tujuan yang tidak terkait dengan aktivitas resmi",
        ] },
        { type: "p", text: "Kewajiban kerahasiaan dapat tetap berlaku bahkan setelah akses akun berakhir, apabila sesuai." },
      ],
    },
    {
      number: "31", title: "Tidak Ada Jaminan Hasil Produksi",
      blocks: [
        { type: "p", text: "Produksi biologis BSF dipengaruhi oleh banyak faktor, termasuk:" },
        { type: "ul", items: [
          "kualitas pakan", "jumlah pakan", "suhu lingkungan", "kelembapan", "kepadatan larva",
          "kondisi substrat", "kadar air", "genetika", "manajemen fasilitas", "praktik kerja pekerja",
          "penyakit", "hama", "cuaca", "metode produksi", "variabel biologis atau lingkungan lainnya",
        ] },
        { type: "p", text: "Oleh karena itu, informasi yang disediakan melalui BSFDM tidak menjamin:" },
        { type: "ul", items: [
          "produksi maggot tertentu", "produksi telur tertentu", "tingkat konversi tertentu",
          "berat panen tertentu", "hasil keuangan tertentu", "tingkat pengurangan sampah tertentu", "kinerja biologis tertentu",
        ] },
        { type: "p", text: "BSFDM adalah platform manajemen dan pendukung pengambilan keputusan." },
        { type: "p", text: "Keputusan operasional akhir tetap menjadi tanggung jawab pengguna atau organisasi." },
      ],
    },
    {
      number: "32", title: "Bukan Nasihat Profesional",
      blocks: [
        { type: "p", text: "Kecuali dinyatakan secara tegas sebaliknya, informasi yang disediakan oleh BSFDM tidak merupakan:" },
        { type: "ul", items: [
          "nasihat hukum", "nasihat keuangan", "nasihat kedokteran hewan", "sertifikasi pertanian",
          "sertifikasi lingkungan", "nasihat akuntansi", "nasihat perpajakan", "persetujuan regulasi",
        ] },
        { type: "p", text: "Pengguna sebaiknya berkonsultasi dengan profesional yang berkualifikasi apabila diperlukan nasihat khusus." },
      ],
    },
    {
      number: "33", title: "Pembatasan Tanggung Jawab",
      blocks: [
        { type: "p", text: "Sejauh diizinkan oleh hukum yang berlaku, BSFDM tidak bertanggung jawab atas kerugian tidak langsung, insidental, konsekuensial, atau khusus yang timbul dari:" },
        { type: "ul", items: [
          "input pengguna yang salah", "akses akun tidak sah yang disebabkan oleh kredensial pengguna yang bocor",
          "informasi operasional yang tidak akurat", "kegagalan produksi", "kerugian biologis", "jadwal panen yang terlewat",
          "gangguan internet", "kegagalan layanan pihak ketiga", "kegagalan perangkat keras", "penggunaan platform yang tidak semestinya",
          "keputusan yang dibuat semata-mata berdasarkan perhitungan atau rekomendasi otomatis",
        ] },
        { type: "p", text: "Tidak ada satu pun dalam Ketentuan ini yang mengecualikan tanggung jawab yang secara hukum tidak dapat dikecualikan berdasarkan hukum yang berlaku." },
      ],
    },
    {
      number: "34", title: "Tanggung Jawab Pengguna atas Keputusan Operasional",
      blocks: [
        { type: "p", text: "Pengguna tetap bertanggung jawab atas keputusan operasional yang dibuat menggunakan BSFDM." },
        { type: "p", text: "Hal ini termasuk keputusan terkait:" },
        { type: "ul", items: [
          "pemberian pakan", "panen", "penebaran", "pembiakan (breeding)", "penerimaan sampah",
          "penjadwalan produksi", "penjualan", "inventaris", "tenaga kerja", "operasional klien", "manajemen fasilitas",
        ] },
        { type: "p", text: "BSFDM dimaksudkan untuk mendukung, bukan menggantikan, penilaian profesional dan pengawasan operasional yang sesuai." },
      ],
    },
    {
      number: "35", title: "Keadaan Kahar (Force Majeure)",
      blocks: [
        { type: "p", text: "BSFDM tidak bertanggung jawab atas kegagalan atau keterlambatan yang disebabkan oleh keadaan di luar kendali wajar, termasuk:" },
        { type: "ul", items: [
          "bencana alam", "gempa bumi", "banjir", "kebakaran", "pemadaman listrik", "kegagalan infrastruktur internet",
          "pembatasan pemerintah", "perang", "kerusuhan sipil", "serangan siber",
          "kegagalan infrastruktur cloud secara luas", "peristiwa sebanding lainnya",
        ] },
      ],
    },
    {
      number: "36", title: "Perubahan pada Platform",
      blocks: [
        { type: "p", text: "BSFDM dapat mengubah, menambahkan, menghapus, atau mengganti fitur platform." },
        { type: "p", text: "Perubahan dapat dilakukan untuk:" },
        { type: "ul", items: [
          "meningkatkan fungsionalitas", "meningkatkan keamanan", "menanggapi masukan pengguna",
          "mendukung proses operasional baru", "mematuhi persyaratan hukum", "mengembangkan layanan baru",
        ] },
        { type: "p", text: "BSFDM tidak menjamin bahwa setiap fitur akan selalu tersedia secara permanen." },
      ],
    },
    {
      number: "37", title: "Perubahan pada Ketentuan Ini",
      blocks: [
        { type: "p", text: "Ketentuan ini dapat diperbarui secara berkala." },
        { type: "p", text: "Pembaruan dapat dilakukan karena:" },
        { type: "ul", items: ["pengembangan platform", "perubahan operasional", "perubahan keamanan", "perubahan bisnis", "layanan baru", "persyaratan hukum"] },
        { type: "p", text: "Versi terbaru akan tersedia melalui situs web atau platform BSFDM." },
        { type: "p", text: "Tanggal “Terakhir Diperbarui” menunjukkan revisi terbaru." },
        { type: "p", text: "Penggunaan BSFDM yang berkelanjutan setelah Ketentuan yang diperbarui berlaku dapat merupakan penerimaan terhadap Ketentuan yang diperbarui tersebut, sejauh diizinkan oleh hukum yang berlaku." },
      ],
    },
    {
      number: "38", title: "Hukum yang Berlaku",
      blocks: [
        { type: "p", text: "Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan peraturan perundang-undangan yang berlaku di Republik Indonesia." },
      ],
    },
    {
      number: "39", title: "Penyelesaian Sengketa",
      blocks: [
        { type: "p", text: "Apabila timbul sengketa terkait BSFDM, para pihak sebaiknya terlebih dahulu berupaya menyelesaikan masalah tersebut melalui diskusi atau negosiasi dengan itikad baik." },
        { type: "p", text: "Apabila penyelesaian tidak dapat dicapai, sengketa dapat diselesaikan melalui mekanisme penyelesaian sengketa atau pengadilan yang berwenang sesuai dengan hukum Indonesia yang berlaku dan perjanjian terpisah apa pun antara para pihak." },
      ],
    },
    {
      number: "40", title: "Keterpisahan (Severability)",
      blocks: [
        { type: "p", text: "Apabila ada ketentuan dalam Ketentuan ini yang dinyatakan tidak sah atau tidak dapat diberlakukan, ketentuan lainnya akan tetap berlaku sejauh diizinkan oleh hukum." },
      ],
    },
    {
      number: "41", title: "Tidak Ada Pengesampingan Hak (No Waiver)",
      blocks: [
        { type: "p", text: "Kegagalan BSFDM untuk menegakkan suatu ketentuan dalam Ketentuan ini tidak merupakan pengesampingan atas hak untuk menegakkan ketentuan tersebut di kemudian hari." },
      ],
    },
    {
      number: "42", title: "Keseluruhan Perjanjian",
      blocks: [
        { type: "p", text: "Ketentuan ini, bersama dengan Kebijakan Privasi dan setiap perjanjian tertulis yang berlaku antara BSFDM dengan pengguna atau organisasi, merupakan perjanjian yang berlaku dan mengatur penggunaan platform." },
        { type: "p", text: "Apabila suatu perjanjian komersial tertulis terpisah bertentangan dengan Ketentuan ini, perjanjian komersial tertulis tersebut dapat berlaku lebih utama sejauh ditentukan dalam perjanjian tersebut." },
      ],
    },
  ],
};

export const TERMS_CONDITIONS = { en, id };
