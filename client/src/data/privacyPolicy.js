// Full legal text for the Privacy Policy modal (Landing.jsx footer), in both
// site languages. Kept in its own data file since it's long and static —
// structured as sections of typed blocks (paragraph / bullet list / role
// definition list / address) so the modal can render either language
// generically instead of one huge hand-written JSX tree per language.
const en = {
  title: "Privacy Policy",
  lastUpdatedLabel: "Last Updated",
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

const id = {
  title: "Kebijakan Privasi",
  lastUpdatedLabel: "Terakhir Diperbarui",
  lastUpdated: "16 September 2026",
  intro: [
    "BSFDM (“BSFDM”, “kami”) menghormati privasi setiap pengguna yang mengakses dan menggunakan platform BSFDM.",
    "BSFDM adalah platform digital yang dirancang untuk membantu pengelolaan sampah dan operasional produksi Black Soldier Fly (BSF), termasuk pemantauan produksi, manajemen biopond, manajemen pakan, pengolahan sampah organik, panen, inventaris, klien, pelaporan, penjadwalan, notifikasi, dan aktivitas operasional terkait lainnya.",
    "Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, melindungi, dan mengelola informasi ketika Anda mengakses atau menggunakan bsfdm.id, aplikasi BSFDM, dan layanan terkait.",
    "Dengan membuat akun atau menggunakan BSFDM, Anda mengakui bahwa Anda telah membaca dan memahami Kebijakan Privasi ini.",
  ],
  sections: [
    {
      number: "1",
      title: "Ruang Lingkup Kebijakan Privasi Ini",
      blocks: [
        { type: "p", text: "Kebijakan Privasi ini berlaku untuk informasi yang diproses melalui:" },
        { type: "ul", items: [
          "situs web BSFDM",
          "aplikasi web BSFDM",
          "antarmuka seluler atau tablet yang terhubung ke BSFDM",
          "dasbor administrator dan operator",
          "API BSFDM",
          "integrasi dengan layanan pihak ketiga",
          "sistem notifikasi",
          "layanan digital lain yang dioperasikan sebagai bagian dari ekosistem BSFDM",
        ] },
        { type: "p", text: "Kebijakan ini berlaku untuk Administrator, Super Administrator, Operator, pengguna Management, Klien, dan pengguna resmi lainnya dari platform ini." },
      ],
    },
    {
      number: "2",
      title: "Informasi yang Kami Kumpulkan",
      blocks: [
        { type: "p", text: "Tergantung pada bagaimana Anda menggunakan BSFDM, kami dapat mengumpulkan beberapa kategori informasi." },
      ],
    },
    {
      number: "2.1",
      title: "Informasi Akun",
      sub: true,
      blocks: [
        { type: "p", text: "Saat akun dibuat, kami dapat memproses informasi seperti:" },
        { type: "ul", items: [
          "nama lengkap", "nama pengguna (username)", "alamat email", "nomor telepon atau WhatsApp",
          "nama perusahaan atau organisasi", "jabatan atau peran", "informasi profil",
          "status akun", "izin pengguna dan tingkat akses", "informasi autentikasi",
        ] },
        { type: "p", text: "Kata sandi tidak dimaksudkan untuk disimpan dalam bentuk teks biasa yang dapat dibaca dan harus dilindungi menggunakan mekanisme keamanan yang sesuai." },
      ],
    },
    {
      number: "2.2",
      title: "Data Operasional dan Produksi",
      sub: true,
      blocks: [
        { type: "p", text: "BSFDM dapat memproses informasi yang dimasukkan oleh pengguna terkait operasional BSF, termasuk:" },
        { type: "ul", items: [
          "nomor atau identifikasi biopond", "jumlah atau berat baby maggot", "tanggal penebaran (stocking)",
          "tanggal panen terjadwal", "tanggal panen aktual", "jumlah pakan", "sumber pakan",
          "sumber sampah organik", "jumlah sampah organik", "informasi klien atau hotel",
          "produksi telur BSF", "produksi maggot", "data prepupa dan pupa", "data indukan (breeding stock)",
          "produksi kasgot atau pupuk organik", "inventaris", "informasi penjualan",
          "target produksi", "jadwal produksi", "catatan operasional",
          "data lain terkait aktivitas produksi BSF",
        ] },
        { type: "p", text: "Sebagian besar data produksi operasional merupakan informasi bisnis atau operasional, bukan data pribadi. Namun, informasi tersebut dapat menjadi data pribadi apabila dapat dikaitkan dengan individu yang dapat diidentifikasi." },
      ],
    },
    {
      number: "2.3",
      title: "Data Klien",
      sub: true,
      blocks: [
        { type: "p", text: "Pengguna resmi dapat memasukkan informasi terkait klien atau mitra bisnis, termasuk:" },
        { type: "ul", items: [
          "nama perusahaan atau hotel", "kontak person", "nomor telepon", "alamat email", "alamat",
          "informasi pengambilan sampah", "volume sampah", "jadwal pengambilan",
          "informasi kerja sama", "catatan operasional terkait klien",
        ] },
        { type: "p", text: "Pengguna yang memasukkan informasi pihak ketiga ke dalam BSFDM bertanggung jawab untuk memastikan bahwa mereka memiliki dasar atau otorisasi yang sesuai untuk memberikan informasi tersebut." },
      ],
    },
    {
      number: "3",
      title: "Informasi yang Dikumpulkan Secara Otomatis",
      blocks: [
        { type: "p", text: "Saat Anda mengakses BSFDM, informasi teknis tertentu dapat dikumpulkan secara otomatis, seperti:" },
        { type: "ul", items: [
          "alamat IP", "jenis browser", "sistem operasi", "jenis perangkat",
          "identifikasi perangkat, jika berlaku", "tanggal dan waktu login", "informasi sesi",
          "halaman atau fitur yang diakses", "aktivitas aplikasi", "log kesalahan (error log)", "log keamanan",
          "informasi teknis lain yang diperlukan untuk menjaga kinerja dan keamanan sistem",
        ] },
        { type: "p", text: "Informasi ini dapat digunakan untuk mendeteksi kesalahan, mencegah akses tidak sah, meningkatkan kinerja, dan menjaga keamanan sistem." },
      ],
    },
    {
      number: "4",
      title: "Log Aktivitas dan Jejak Audit",
      blocks: [
        { type: "p", text: "BSFDM dapat menyimpan jejak audit atas aktivitas yang dilakukan di dalam platform." },
        { type: "p", text: "Informasi audit dapat mencakup:" },
        { type: "ul", items: [
          "pengguna yang melakukan tindakan", "tanggal dan waktu tindakan", "data yang dibuat", "data yang diubah",
          "data yang dihapus", "aktivitas login", "perubahan izin pengguna", "perubahan data produksi",
          "aktivitas sistem penting lainnya",
        ] },
        { type: "p", text: "Log audit dimaksudkan untuk meningkatkan akuntabilitas, keterlacakan, keamanan, dan integritas data operasional." },
      ],
    },
    {
      number: "5",
      title: "Bagaimana Kami Menggunakan Informasi",
      blocks: [
        { type: "p", text: "Informasi yang dikumpulkan melalui BSFDM dapat digunakan untuk:" },
        { type: "ul", items: [
          "menyediakan dan mengoperasikan layanan BSFDM", "membuat dan mengelola akun pengguna", "melakukan autentikasi pengguna",
          "menerapkan Kontrol Akses Berbasis Peran (Role-Based Access Control)", "mengelola aktivitas produksi BSF",
          "mengelola biopond dan jadwal produksi", "memantau pengolahan sampah organik",
          "mengelola sumber dan penggunaan pakan", "memantau hasil produksi dan panen",
          "mengelola informasi operasional terkait klien", "menghasilkan laporan dan analitik",
          "menampilkan dasbor operasional", "memberikan notifikasi panen dan produksi",
          "memelihara catatan produksi historis", "menganalisis efisiensi operasional",
          "meningkatkan fungsi platform", "mengatasi masalah teknis",
          "mendeteksi aktivitas mencurigakan", "mencegah akses sistem yang tidak sah",
          "menjaga keamanan sistem", "melakukan pencadangan (backup) dan pemulihan bencana",
          "mematuhi kewajiban hukum yang berlaku", "mengembangkan dan meningkatkan layanan BSFDM",
        ] },
        { type: "p", text: "Bila diizinkan, informasi agregat atau anonim juga dapat digunakan untuk analisis statistik, penelitian, benchmarking operasional, dan pengembangan platform." },
      ],
    },
    {
      number: "6",
      title: "Dasar Hukum Pemrosesan",
      blocks: [
        { type: "p", text: "Bila berlaku, BSFDM memproses data pribadi berdasarkan dasar hukum yang diakui berdasarkan peraturan perundang-undangan yang berlaku, yang dapat mencakup:" },
        { type: "ul", items: [
          "persetujuan dari subjek data", "pemenuhan kewajiban kontraktual",
          "pemenuhan kewajiban hukum",
          "kepentingan sah (legitimate interest) terkait keamanan sistem dan operasional layanan",
          "pemenuhan perjanjian antara BSFDM dan organisasi yang menggunakan platform",
          "dasar hukum lain yang diizinkan berdasarkan peraturan yang berlaku",
        ] },
        { type: "p", text: "Jika pemrosesan didasarkan pada persetujuan, pengguna dapat memiliki hak untuk menarik persetujuan tersebut sesuai dengan hukum yang berlaku." },
      ],
    },
    {
      number: "7",
      title: "Kontrol Akses Berbasis Peran",
      blocks: [
        { type: "p", text: "BSFDM menerapkan akses pengguna sesuai dengan peran yang ditetapkan." },
        { type: "p", text: "Pengguna yang berbeda dapat memiliki hak akses yang berbeda, misalnya:" },
        { type: "dl", items: [
          { term: "Super Administrator", desc: "Dapat mengelola platform, pengguna, izin, konfigurasi operasional, dan data sistem secara keseluruhan sesuai dengan wewenang yang diberikan." },
          { term: "Administrator", desc: "Dapat mengelola informasi organisasi atau operasional tertentu dalam ruang lingkup yang diizinkan." },
          { term: "Operator", desc: "Dapat mengakses fitur operasional yang diperlukan untuk aktivitas lapangan, seperti produksi, biopond, panen, pakan, indukan, pupuk organik, dan manajemen kalender." },
          { term: "Management", desc: "Dapat mengakses laporan, dasbor, analitik, atau informasi lain yang diperlukan untuk pemantauan dan pengambilan keputusan." },
        ] },
        { type: "p", text: "Pengguna hanya dapat mengakses informasi yang diizinkan sesuai peran dan wewenangnya." },
        { type: "p", text: "Upaya tidak sah untuk mengakses informasi di luar peran yang ditetapkan dilarang." },
      ],
    },
    {
      number: "8",
      title: "Berbagi Data",
      blocks: [
        { type: "p", text: "BSFDM tidak menjual data pribadi pengguna." },
        { type: "p", text: "Kami dapat mengungkapkan informasi dalam keadaan terbatas kepada:" },
        { type: "ul", items: [
          "personel resmi dalam organisasi yang mengoperasikan BSFDM",
          "organisasi yang secara sah menggunakan platform BSFDM",
          "penyedia infrastruktur dan layanan cloud", "penyedia layanan basis data atau pencadangan (backup)",
          "penyedia layanan email, WhatsApp, atau notifikasi, jika terintegrasi",
          "penyedia layanan analitik atau pemantauan", "penyedia layanan keamanan siber",
          "penasihat profesional",
          "otoritas pemerintah atau penegak hukum jika diwajibkan secara hukum",
          "penyedia layanan lain yang diperlukan untuk mengoperasikan BSFDM",
        ] },
        { type: "p", text: "Pihak ketiga yang memproses data pribadi atas nama kami diharapkan hanya memproses informasi tersebut untuk tujuan yang sah dan menerapkan langkah pengamanan yang memadai." },
      ],
    },
    {
      number: "9",
      title: "Keamanan Data",
      blocks: [
        { type: "p", text: "Kami mengambil langkah teknis dan organisasi yang wajar untuk melindungi informasi yang diproses oleh BSFDM." },
        { type: "p", text: "Tergantung pada implementasi sistem, langkah-langkah ini dapat mencakup:" },
        { type: "ul", items: [
          "komunikasi terenkripsi menggunakan HTTPS/TLS", "hashing kata sandi", "autentikasi yang aman",
          "Kontrol Akses Berbasis Peran", "kontrol otorisasi", "pembatasan akses basis data",
          "manajemen sesi", "log audit", "pemantauan server dan aplikasi",
          "validasi input", "perlindungan terhadap akses tidak sah", "pembaruan keamanan",
          "pencadangan data", "prosedur pemulihan bencana", "pemantauan insiden keamanan",
        ] },
        { type: "p", text: "Namun, tidak ada sistem berbasis internet yang dapat menjamin keamanan mutlak." },
        { type: "p", text: "Pengguna juga bertanggung jawab untuk menjaga kerahasiaan kredensial login mereka dan tidak boleh membagikan akun atau kata sandi kepada pihak yang tidak berwenang." },
      ],
    },
    {
      number: "10",
      title: "Retensi Data",
      blocks: [
        { type: "p", text: "Kami menyimpan informasi hanya selama secara wajar diperlukan untuk:" },
        { type: "ul", items: [
          "menyediakan layanan BSFDM", "memelihara riwayat produksi", "menghasilkan laporan operasional",
          "memenuhi kewajiban kontraktual", "mematuhi persyaratan hukum yang berlaku",
          "menyelesaikan sengketa", "melakukan investigasi keamanan", "memelihara catatan bisnis yang sah",
        ] },
        { type: "p", text: "Periode retensi dapat berbeda tergantung pada jenis informasi dan tujuan pemrosesan." },
        { type: "p", text: "Ketika informasi tidak lagi diperlukan, kami dapat menghapus, memusnahkan, menganonimkan, atau mengarsipkannya secara aman sesuai dengan persyaratan yang berlaku dan kebijakan internal." },
      ],
    },
    {
      number: "11",
      title: "Data Cadangan (Backup)",
      blocks: [
        { type: "p", text: "BSFDM dapat menyimpan cadangan basis data dan informasi aplikasi untuk mendukung:" },
        { type: "ul", items: [
          "pemulihan bencana", "pemulihan data", "kelangsungan sistem",
          "perlindungan terhadap kehilangan data yang tidak disengaja",
        ] },
        { type: "p", text: "Data yang dihapus dapat tetap berada sementara dalam sistem cadangan hingga siklus retensi cadangan yang relevan berakhir." },
        { type: "p", text: "Akses ke informasi cadangan harus dibatasi hanya untuk personel yang berwenang." },
      ],
    },
    {
      number: "12",
      title: "Hak Pengguna",
      blocks: [
        { type: "p", text: "Sesuai dengan peraturan perundang-undangan yang berlaku, pengguna atau subjek data lainnya dapat memiliki hak terkait data pribadi mereka, termasuk hak untuk:" },
        { type: "ul", items: [
          "memperoleh informasi mengenai bagaimana data pribadi mereka diproses",
          "mengakses data pribadi mereka", "meminta koreksi atas informasi yang tidak akurat",
          "memperbarui informasi yang tidak lengkap",
          "meminta penghapusan atau pemusnahan data pribadi jika diizinkan secara hukum",
          "menarik persetujuan jika pemrosesan didasarkan pada persetujuan",
          "meminta pembatasan atau penghentian sementara aktivitas pemrosesan tertentu",
          "mengajukan keberatan atas aktivitas pemrosesan tertentu jika berlaku",
          "memperoleh salinan data pribadi mereka jika berlaku",
          "menggunakan hak lain yang diberikan berdasarkan peraturan perlindungan data pribadi yang berlaku",
        ] },
        { type: "p", text: "Permintaan tertentu dapat dikenakan verifikasi identitas serta batasan hukum atau kontraktual." },
      ],
    },
    {
      number: "13",
      title: "Koreksi Data",
      blocks: [
        { type: "p", text: "Pengguna harus memastikan bahwa informasi yang diberikan kepada BSFDM akurat dan mutakhir." },
        { type: "p", text: "Jika fungsi memungkinkan, pengguna dapat memperbarui informasi akun tertentu secara langsung melalui profil atau pengaturan akun mereka." },
        { type: "p", text: "Untuk informasi yang tidak dapat diperbarui secara langsung, pengguna dapat menghubungi administrator BSFDM." },
      ],
    },
    {
      number: "14",
      title: "Penghapusan Akun",
      blocks: [
        { type: "p", text: "Pengguna dapat meminta penghapusan atau penonaktifan akun mereka melalui mekanisme manajemen akun yang tersedia atau dengan menghubungi administrator BSFDM." },
        { type: "p", text: "Penghapusan akun tidak selalu berarti penghapusan seluruh data terkait secara langsung." },
        { type: "p", text: "Data tertentu mungkin perlu disimpan jika diperlukan untuk:" },
        { type: "ul", items: [
          "catatan produksi", "jejak audit", "kewajiban hukum", "kewajiban kontraktual",
          "investigasi kecurangan atau keamanan", "penyelesaian sengketa",
          "pencatatan organisasi yang sah",
        ] },
        { type: "p", text: "Jika memungkinkan, informasi yang tidak lagi perlu mengidentifikasi individu dapat dianonimkan." },
      ],
    },
    {
      number: "15",
      title: "Cookie",
      blocks: [
        { type: "p", text: "BSFDM dapat menggunakan cookie atau teknologi serupa untuk memelihara dan meningkatkan fungsi platform." },
        { type: "p", text: "Cookie dapat digunakan untuk:" },
        { type: "ul", items: [
          "mempertahankan sesi login", "autentikasi", "mengingat preferensi pengguna",
          "keamanan aplikasi", "mencegah aktivitas tidak sah", "kinerja aplikasi",
          "memahami cara platform digunakan",
        ] },
        { type: "p", text: "Cookie esensial mungkin diperlukan agar BSFDM dapat berfungsi dengan baik." },
        { type: "p", text: "Jika cookie analitik atau cookie non-esensial serupa diterapkan, kontrol pengguna yang sesuai dapat disediakan jika diperlukan." },
      ],
    },
    {
      number: "16",
      title: "Layanan Pihak Ketiga",
      blocks: [
        { type: "p", text: "BSFDM dapat terintegrasi dengan layanan pihak ketiga seperti:" },
        { type: "ul", items: [
          "infrastruktur cloud", "layanan email", "layanan WhatsApp atau pesan instan",
          "layanan notifikasi", "penyedia autentikasi", "alat analitik", "alat pemantauan",
          "layanan pemetaan (mapping)", "aplikasi bisnis lainnya",
        ] },
        { type: "p", text: "Informasi yang diproses melalui layanan pihak ketiga juga dapat tunduk pada kebijakan privasi masing-masing penyedia." },
        { type: "p", text: "BSFDM akan berupaya menggunakan penyedia layanan dengan praktik keamanan dan privasi yang wajar." },
      ],
    },
    {
      number: "17",
      title: "Transfer Data",
      blocks: [
        { type: "p", text: "Dalam keadaan tertentu, penyedia layanan yang digunakan oleh BSFDM dapat memproses atau menyimpan informasi pada infrastruktur yang berlokasi di luar Indonesia." },
        { type: "p", text: "Jika terjadi transfer data pribadi lintas batas negara, BSFDM akan mengambil langkah-langkah yang sesuai berdasarkan persyaratan perlindungan data pribadi yang berlaku." },
      ],
    },
    {
      number: "18",
      title: "Pelanggaran Data dan Insiden Keamanan",
      blocks: [
        { type: "p", text: "Jika BSFDM mengetahui adanya pelanggaran data pribadi atau insiden keamanan lainnya, kami akan menyelidiki dan mengambil langkah yang sesuai untuk:" },
        { type: "ul", items: [
          "mengendalikan insiden", "mengurangi dampak potensial", "mengamankan sistem yang terdampak",
          "mengidentifikasi informasi yang terdampak", "memulihkan keamanan sistem",
          "mencegah insiden serupa terulang kembali",
        ] },
        { type: "p", text: "Jika diwajibkan oleh hukum yang berlaku, subjek data yang terdampak dan otoritas terkait akan diberitahu dalam jangka waktu yang ditentukan." },
      ],
    },
    {
      number: "19",
      title: "Penggunaan Data Agregat dan Anonim",
      blocks: [
        { type: "p", text: "BSFDM dapat memproses informasi operasional agregat atau anonim untuk tujuan seperti:" },
        { type: "ul", items: [
          "analisis kinerja produksi", "analisis pengurangan sampah", "analisis produktivitas BSF",
          "analisis konversi pakan", "pemanfaatan fasilitas", "analisis keberlanjutan (sustainability)", "penelitian",
          "benchmarking", "pengembangan platform",
        ] },
        { type: "p", text: "Informasi tersebut akan diproses sedemikian rupa sehingga tidak dimaksudkan untuk mengidentifikasi individu." },
      ],
    },
    {
      number: "20",
      title: "Analitik dan Kecerdasan Buatan",
      blocks: [
        { type: "p", text: "BSFDM di masa mendatang dapat menyediakan fitur analitik atau berbasis kecerdasan buatan (AI) untuk membantu pengguna menganalisis informasi operasional." },
        { type: "p", text: "Fitur-fitur ini dapat mencakup:" },
        { type: "ul", items: [
          "prediksi produksi", "estimasi panen", "deteksi anomali",
          "analisis penggunaan pakan", "analisis pengolahan sampah", "rekomendasi operasional",
          "ringkasan produksi", "laporan otomatis",
        ] },
        { type: "p", text: "Jika pemrosesan berbasis AI melibatkan data pribadi, pemrosesan tersebut akan dilakukan sesuai dengan persyaratan privasi yang berlaku." },
        { type: "p", text: "Analisis otomatis dimaksudkan untuk mendukung pengambilan keputusan operasional dan tidak boleh dijadikan satu-satunya dasar untuk keputusan penting tanpa peninjauan manusia yang memadai." },
      ],
    },
    {
      number: "21",
      title: "Privasi Anak",
      blocks: [
        { type: "p", text: "BSFDM dirancang terutama sebagai platform manajemen operasional dan bisnis profesional dan tidak ditujukan untuk digunakan oleh anak-anak." },
        { type: "p", text: "Kami tidak secara sengaja mengumpulkan data pribadi dari anak-anak melalui penggunaan standar BSFDM." },
        { type: "p", text: "Jika kami mengetahui bahwa data pribadi milik anak telah dikumpulkan tanpa dasar hukum atau otorisasi yang sesuai, langkah-langkah yang tepat akan diambil." },
      ],
    },
    {
      number: "22",
      title: "Tanggung Jawab Pengguna",
      blocks: [
        { type: "p", text: "Pengguna bertanggung jawab untuk:" },
        { type: "ul", items: [
          "memberikan informasi yang akurat", "menjaga kerahasiaan kredensial login",
          "menggunakan BSFDM hanya untuk tujuan yang sah",
          "memastikan data yang dimasukkan ke dalam BSFDM diperoleh secara sah",
          "tidak membagikan akun kepada pihak yang tidak berwenang",
          "segera melaporkan dugaan akses tidak sah",
          "mematuhi kebijakan internal organisasi",
          "mematuhi hukum yang berlaku saat memproses informasi melalui BSFDM",
        ] },
        { type: "p", text: "Pengguna tidak boleh menggunakan BSFDM untuk menyimpan, mendistribusikan, atau memproses informasi secara melawan hukum." },
      ],
    },
    {
      number: "23",
      title: "Perubahan Kebijakan Privasi Ini",
      blocks: [
        { type: "p", text: "Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk mencerminkan:" },
        { type: "ul", items: [
          "perubahan fitur BSFDM", "perubahan teknologi", "perubahan proses bisnis",
          "perubahan praktik keamanan", "perubahan hukum dan peraturan yang berlaku",
        ] },
        { type: "p", text: "Ketika perubahan material dilakukan, Kebijakan Privasi yang diperbarui akan dipublikasikan di situs web BSFDM atau dikomunikasikan melalui platform jika diperlukan." },
        { type: "p", text: "Tanggal “Terakhir Diperbarui” di bagian atas Kebijakan Privasi ini menunjukkan kapan revisi terakhir dilakukan." },
      ],
    },
    {
      number: "24",
      title: "Hukum yang Berlaku",
      blocks: [
        { type: "p", text: "Kebijakan Privasi ini dan pemrosesan data pribadi melalui BSFDM dimaksudkan untuk dilaksanakan sesuai dengan peraturan perundang-undangan yang berlaku di Republik Indonesia, termasuk peraturan yang berlaku terkait perlindungan data pribadi dan sistem elektronik." },
      ],
    },
    {
      number: "25",
      title: "Hubungi Kami",
      blocks: [
        { type: "p", text: "Jika Anda memiliki pertanyaan, kekhawatiran, keluhan, atau permintaan terkait Kebijakan Privasi ini atau pemrosesan data pribadi melalui BSFDM, silakan hubungi:" },
        { type: "address", lines: [
          "BSFDM — Black Soldier Fly Data Management",
          "Website: https://bsfdm.id",
          "Email: halo@bsfdm.id",
          "Alamat: Piyungan, Bantul, Yogyakarta",
        ] },
        { type: "p", text: "Untuk permintaan terkait akses, koreksi, penghapusan, pembatasan, atau hak data pribadi lainnya, mohon sertakan informasi yang cukup agar kami dapat memverifikasi identitas Anda dan memproses permintaan tersebut secara aman." },
      ],
    },
  ],
};

export const PRIVACY_POLICY = { en, id };
