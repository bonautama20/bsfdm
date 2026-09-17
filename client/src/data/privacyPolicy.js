// Full legal text for the Privacy Policy modal (Landing.jsx footer). Kept in
// its own data file since it's long and static — structured as sections of
// typed blocks (paragraph / bullet list / role definition list) so the modal
// can render it generically instead of one huge hand-written JSX tree.
export const PRIVACY_POLICY = {
  title: "Privacy Policy",
  lastUpdated: "September 16, 2026",
  intro: [
    "BSFDM (“BSFDM”, “we”, “us”, or “our”) respects the privacy of every user who accesses and uses the BSFDM platform.",
    "BSFDM is a digital platform designed to assist Black Soldier Fly (BSF) waste management and production operations, including production monitoring, biopond management, feed management, organic waste processing, harvesting, inventory, clients, reporting, scheduling, notifications, and other related operational activities.",
    "This Privacy Policy explains how we collect, use, store, protect, and manage information when you access or use bsfdm.id, the BSFDM application, and related services.",
    "By creating an account or using BSFDM, you acknowledge that you have read and understood this Privacy Policy.",
  ],
  sections: [
    {
      number: "1",
      title: "Scope of This Privacy Policy",
      blocks: [
        { type: "p", text: "This Privacy Policy applies to information processed through:" },
        { type: "ul", items: [
          "the BSFDM website",
          "the BSFDM web application",
          "mobile or tablet interfaces connected to BSFDM",
          "administrator and operator dashboards",
          "BSFDM APIs",
          "integrations with third-party services",
          "notification systems",
          "other digital services operated as part of the BSFDM ecosystem",
        ] },
        { type: "p", text: "This policy applies to Administrators, Super Administrators, Operators, Management users, Clients, and other authorized users of the platform." },
      ],
    },
    {
      number: "2",
      title: "Information We Collect",
      blocks: [
        { type: "p", text: "Depending on how you use BSFDM, we may collect several categories of information." },
      ],
    },
    {
      number: "2.1",
      title: "Account Information",
      sub: true,
      blocks: [
        { type: "p", text: "When an account is created, we may process information such as:" },
        { type: "ul", items: [
          "full name", "username", "email address", "telephone or WhatsApp number",
          "company or organization name", "position or role", "profile information",
          "account status", "user permissions and access level", "authentication information",
        ] },
        { type: "p", text: "Passwords are not intended to be stored in readable plain-text form and should be protected using appropriate security mechanisms." },
      ],
    },
    {
      number: "2.2",
      title: "Operational and Production Data",
      sub: true,
      blocks: [
        { type: "p", text: "BSFDM may process information entered by users relating to BSF operations, including:" },
        { type: "ul", items: [
          "biopond number or identification", "number or weight of baby maggots", "stocking date",
          "scheduled harvest date", "actual harvest date", "feed quantity", "feed source",
          "organic waste source", "organic waste quantity", "client or hotel information",
          "BSF egg production", "maggot production", "prepupa and pupa data", "breeding stock data",
          "kasgot or organic fertilizer production", "inventory", "sales information",
          "production targets", "production schedules", "operational notes",
          "other data related to BSF production activities",
        ] },
        { type: "p", text: "Most operational production data is business or operational information rather than personal data. However, such information may become personal data when it can be associated with an identifiable individual." },
      ],
    },
    {
      number: "2.3",
      title: "Client Data",
      sub: true,
      blocks: [
        { type: "p", text: "Authorized users may enter information relating to clients or business partners, including:" },
        { type: "ul", items: [
          "company or hotel name", "contact person", "telephone number", "email address", "address",
          "waste collection information", "waste volume", "collection schedule",
          "cooperation information", "operational records related to the client",
        ] },
        { type: "p", text: "Users who enter third-party information into BSFDM are responsible for ensuring that they have an appropriate basis or authorization to provide such information." },
      ],
    },
    {
      number: "3",
      title: "Automatically Collected Information",
      blocks: [
        { type: "p", text: "When you access BSFDM, certain technical information may be collected automatically, such as:" },
        { type: "ul", items: [
          "IP address", "browser type", "operating system", "device type",
          "device identifier where applicable", "login date and time", "session information",
          "pages or features accessed", "application activity", "error logs", "security logs",
          "other technical information necessary to maintain system performance and security",
        ] },
        { type: "p", text: "This information may be used to detect errors, prevent unauthorized access, improve performance, and maintain system security." },
      ],
    },
    {
      number: "4",
      title: "Activity Logs and Audit Trail",
      blocks: [
        { type: "p", text: "BSFDM may maintain an audit trail of activities performed within the platform." },
        { type: "p", text: "Audit information may include:" },
        { type: "ul", items: [
          "user performing an action", "date and time of the action", "data created", "data modified",
          "data deleted", "login activity", "changes to user permissions", "production data changes",
          "other significant system activities",
        ] },
        { type: "p", text: "Audit logs are intended to improve accountability, traceability, security, and integrity of operational data." },
      ],
    },
    {
      number: "5",
      title: "How We Use Information",
      blocks: [
        { type: "p", text: "Information collected through BSFDM may be used to:" },
        { type: "ul", items: [
          "provide and operate BSFDM services", "create and manage user accounts", "authenticate users",
          "implement Role-Based Access Control", "manage BSF production activities",
          "manage bioponds and production schedules", "monitor organic waste processing",
          "manage feed sources and feed usage", "monitor production and harvest results",
          "manage client-related operational information", "generate reports and analytics",
          "display operational dashboards", "provide harvest and production notifications",
          "maintain historical production records", "analyze operational efficiency",
          "improve platform functionality", "troubleshoot technical issues",
          "detect suspicious activity", "prevent unauthorized system access",
          "maintain system security", "perform backup and disaster recovery",
          "comply with applicable legal obligations", "develop and improve BSFDM services",
        ] },
        { type: "p", text: "Where permitted, aggregated or anonymized information may also be used for statistical analysis, research, operational benchmarking, and platform development." },
      ],
    },
    {
      number: "6",
      title: "Legal Basis for Processing",
      blocks: [
        { type: "p", text: "Where applicable, BSFDM processes personal data based on lawful grounds recognized under applicable laws and regulations, which may include:" },
        { type: "ul", items: [
          "consent from the data subject", "fulfillment of contractual obligations",
          "fulfillment of legal obligations",
          "legitimate interests related to system security and service operations",
          "fulfillment of agreements between BSFDM and organizations using the platform",
          "other lawful grounds permitted under applicable regulations",
        ] },
        { type: "p", text: "Where processing relies on consent, users may have the right to withdraw such consent in accordance with applicable law." },
      ],
    },
    {
      number: "7",
      title: "Role-Based Access Control",
      blocks: [
        { type: "p", text: "BSFDM implements user access according to assigned roles." },
        { type: "p", text: "Different users may have different access rights, for example:" },
        { type: "dl", items: [
          { term: "Super Administrator", desc: "May manage the platform, users, permissions, operational configurations, and overall system data according to assigned authority." },
          { term: "Administrator", desc: "May manage specific organizational or operational information within the authorized scope." },
          { term: "Operator", desc: "May access operational features required for field activities, such as production, biopond, harvesting, feed, breeding stock, organic fertilizer, and calendar management." },
          { term: "Management", desc: "May access reports, dashboards, analytics, or other information required for monitoring and decision-making." },
        ] },
        { type: "p", text: "Users may only access information permitted by their assigned role and authority." },
        { type: "p", text: "Unauthorized attempts to access information outside an assigned role are prohibited." },
      ],
    },
    {
      number: "8",
      title: "Data Sharing",
      blocks: [
        { type: "p", text: "BSFDM does not sell users' personal data." },
        { type: "p", text: "We may disclose information in limited circumstances to:" },
        { type: "ul", items: [
          "authorized personnel within the organization operating BSFDM",
          "organizations that legitimately use the BSFDM platform",
          "infrastructure and cloud service providers", "database or backup service providers",
          "email, WhatsApp, or notification service providers where integrated",
          "analytics or monitoring service providers", "cybersecurity providers",
          "professional advisers",
          "government authorities or law enforcement agencies where legally required",
          "other service providers necessary to operate BSFDM",
        ] },
        { type: "p", text: "Third parties that process personal data on our behalf are expected to process such information only for authorized purposes and apply appropriate safeguards." },
      ],
    },
    {
      number: "9",
      title: "Data Security",
      blocks: [
        { type: "p", text: "We take reasonable technical and organizational measures to protect information processed by BSFDM." },
        { type: "p", text: "Depending on system implementation, these measures may include:" },
        { type: "ul", items: [
          "encrypted communication using HTTPS/TLS", "password hashing", "secure authentication",
          "Role-Based Access Control", "authorization controls", "database access restrictions",
          "session management", "audit logs", "server and application monitoring",
          "input validation", "protection against unauthorized access", "security updates",
          "data backup", "disaster recovery procedures", "security incident monitoring",
        ] },
        { type: "p", text: "However, no internet-based system can guarantee absolute security." },
        { type: "p", text: "Users are also responsible for maintaining the confidentiality of their login credentials and must not share their account or password with unauthorized persons." },
      ],
    },
    {
      number: "10",
      title: "Data Retention",
      blocks: [
        { type: "p", text: "We retain information only for as long as reasonably necessary to:" },
        { type: "ul", items: [
          "provide BSFDM services", "maintain production history", "generate operational reports",
          "fulfill contractual obligations", "comply with applicable legal requirements",
          "resolve disputes", "conduct security investigations", "maintain legitimate business records",
        ] },
        { type: "p", text: "Retention periods may differ depending on the type of information and purpose of processing." },
        { type: "p", text: "When information is no longer required, we may securely delete, destroy, anonymize, or archive it in accordance with applicable requirements and internal policies." },
      ],
    },
    {
      number: "11",
      title: "Backup Data",
      blocks: [
        { type: "p", text: "BSFDM may maintain backups of database and application information to support:" },
        { type: "ul", items: [
          "disaster recovery", "data restoration", "system continuity",
          "protection against accidental data loss",
        ] },
        { type: "p", text: "Deleted data may remain temporarily within backup systems until the relevant backup retention cycle expires." },
        { type: "p", text: "Access to backup information should be restricted to authorized personnel." },
      ],
    },
    {
      number: "12",
      title: "User Rights",
      blocks: [
        { type: "p", text: "Subject to applicable laws and regulations, users or other data subjects may have rights relating to their personal data, including the right to:" },
        { type: "ul", items: [
          "obtain information regarding how their personal data is processed",
          "access their personal data", "request correction of inaccurate information",
          "update incomplete information",
          "request deletion or destruction of personal data where legally permitted",
          "withdraw consent where processing is based on consent",
          "request restriction or suspension of certain processing activities",
          "object to certain processing activities where applicable",
          "obtain a copy of their personal data where applicable",
          "exercise other rights provided under applicable personal data protection regulations",
        ] },
        { type: "p", text: "Certain requests may be subject to identity verification and legal or contractual limitations." },
      ],
    },
    {
      number: "13",
      title: "Data Correction",
      blocks: [
        { type: "p", text: "Users should ensure that the information provided to BSFDM is accurate and up to date." },
        { type: "p", text: "Where functionality permits, users may update certain account information directly through their profile or account settings." },
        { type: "p", text: "For information that cannot be updated directly, users may contact the BSFDM administrator." },
      ],
    },
    {
      number: "14",
      title: "Account Deletion",
      blocks: [
        { type: "p", text: "Users may request deletion or deactivation of their account through the available account management mechanism or by contacting the BSFDM administrator." },
        { type: "p", text: "Account deletion does not necessarily result in immediate deletion of all related data." },
        { type: "p", text: "Certain data may need to be retained where necessary for:" },
        { type: "ul", items: [
          "production records", "audit trails", "legal obligations", "contractual obligations",
          "fraud or security investigations", "dispute resolution",
          "legitimate organizational record-keeping",
        ] },
        { type: "p", text: "Where possible, information that no longer needs to identify an individual may be anonymized." },
      ],
    },
    {
      number: "15",
      title: "Cookies",
      blocks: [
        { type: "p", text: "BSFDM may use cookies or similar technologies to maintain and improve platform functionality." },
        { type: "p", text: "Cookies may be used for:" },
        { type: "ul", items: [
          "maintaining login sessions", "authentication", "remembering user preferences",
          "application security", "preventing unauthorized activity", "application performance",
          "understanding how the platform is used",
        ] },
        { type: "p", text: "Essential cookies may be required for BSFDM to function correctly." },
        { type: "p", text: "Where non-essential analytics or similar cookies are implemented, appropriate user controls may be provided where required." },
      ],
    },
    {
      number: "16",
      title: "Third-Party Services",
      blocks: [
        { type: "p", text: "BSFDM may integrate with third-party services such as:" },
        { type: "ul", items: [
          "cloud infrastructure", "email services", "WhatsApp or messaging services",
          "notification services", "authentication providers", "analytics tools", "monitoring tools",
          "mapping services", "other business applications",
        ] },
        { type: "p", text: "Information processed through third-party services may also be subject to the respective provider's privacy policy." },
        { type: "p", text: "BSFDM will seek to use service providers with reasonable security and privacy practices." },
      ],
    },
    {
      number: "17",
      title: "Data Transfer",
      blocks: [
        { type: "p", text: "In certain circumstances, service providers used by BSFDM may process or store information on infrastructure located outside Indonesia." },
        { type: "p", text: "Where cross-border transfer of personal data occurs, BSFDM will take appropriate measures in accordance with applicable personal data protection requirements." },
      ],
    },
    {
      number: "18",
      title: "Data Breach and Security Incidents",
      blocks: [
        { type: "p", text: "If BSFDM becomes aware of a personal data breach or other security incident, we will investigate and take appropriate measures to:" },
        { type: "ul", items: [
          "contain the incident", "mitigate potential impact", "secure affected systems",
          "identify affected information", "restore system security",
          "prevent similar incidents from recurring",
        ] },
        { type: "p", text: "Where required by applicable law, affected data subjects and relevant authorities will be notified within the required timeframe." },
      ],
    },
    {
      number: "19",
      title: "Use of Aggregated and Anonymous Data",
      blocks: [
        { type: "p", text: "BSFDM may process aggregated or anonymized operational information for purposes such as:" },
        { type: "ul", items: [
          "production performance analysis", "waste reduction analysis", "BSF productivity analysis",
          "feed conversion analysis", "facility utilization", "sustainability analysis", "research",
          "benchmarking", "platform development",
        ] },
        { type: "p", text: "Such information will be processed in a manner intended not to identify an individual." },
      ],
    },
    {
      number: "20",
      title: "Analytics and Artificial Intelligence",
      blocks: [
        { type: "p", text: "BSFDM may in the future provide analytics or artificial intelligence-based features to assist users in analyzing operational information." },
        { type: "p", text: "These features may include:" },
        { type: "ul", items: [
          "production predictions", "harvest estimation", "anomaly detection",
          "feed usage analysis", "waste processing analysis", "operational recommendations",
          "production summaries", "automated reports",
        ] },
        { type: "p", text: "Where AI-based processing involves personal data, such processing will be conducted in accordance with applicable privacy requirements." },
        { type: "p", text: "Automated analyses are intended to support operational decision-making and should not be regarded as the sole basis for critical decisions without appropriate human review." },
      ],
    },
    {
      number: "21",
      title: "Children's Privacy",
      blocks: [
        { type: "p", text: "BSFDM is designed primarily as a professional operational and business management platform and is not intended for use by children." },
        { type: "p", text: "We do not intentionally collect personal data from children through the standard use of BSFDM." },
        { type: "p", text: "If we become aware that personal data belonging to a child has been collected without an appropriate legal basis or authorization, appropriate measures will be taken." },
      ],
    },
    {
      number: "22",
      title: "User Responsibilities",
      blocks: [
        { type: "p", text: "Users are responsible for:" },
        { type: "ul", items: [
          "providing accurate information", "maintaining the confidentiality of login credentials",
          "using BSFDM only for authorized purposes",
          "ensuring data entered into BSFDM is obtained lawfully",
          "not sharing accounts with unauthorized persons",
          "immediately reporting suspected unauthorized access",
          "complying with internal organizational policies",
          "complying with applicable laws when processing information through BSFDM",
        ] },
        { type: "p", text: "Users must not use BSFDM to store, distribute, or process information unlawfully." },
      ],
    },
    {
      number: "23",
      title: "Changes to This Privacy Policy",
      blocks: [
        { type: "p", text: "We may update this Privacy Policy from time to time to reflect:" },
        { type: "ul", items: [
          "changes to BSFDM features", "changes to technology", "changes to business processes",
          "changes to security practices", "changes to applicable laws and regulations",
        ] },
        { type: "p", text: "When material changes are made, the updated Privacy Policy will be published on the BSFDM website or communicated through the platform where appropriate." },
        { type: "p", text: "The “Last Updated” date at the top of this Privacy Policy indicates when the latest revision was made." },
      ],
    },
    {
      number: "24",
      title: "Applicable Law",
      blocks: [
        { type: "p", text: "This Privacy Policy and the processing of personal data through BSFDM are intended to be conducted in accordance with applicable laws and regulations of the Republic of Indonesia, including applicable regulations relating to personal data protection and electronic systems." },
      ],
    },
    {
      number: "25",
      title: "Contact Us",
      blocks: [
        { type: "p", text: "If you have questions, concerns, complaints, or requests relating to this Privacy Policy or the processing of personal data through BSFDM, please contact:" },
        { type: "address", lines: [
          "BSFDM — Black Soldier Fly Data Management",
          "Website: https://bsfdm.id",
          "Email: halo@bsfdm.id",
          "Address: Piyungan, Bantul, Yogyakarta",
        ] },
        { type: "p", text: "For requests relating to access, correction, deletion, restriction, or other personal data rights, please include sufficient information for us to verify your identity and process the request securely." },
      ],
    },
  ],
};
