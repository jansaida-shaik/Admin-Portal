require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const mainGroup = `1	8977544081	Kranthi Kumar 	HYD		Every month 12th
2	8977544085	Pooja	BZA
3	8977544083	Anusha	BZA
4	8977544086	Sowmya	VSKP
5	8977544082	Siva Ram	BZA
6	8977544087	Vijay Lakshmi Front office Hyd	HYD
7	8977544084	Monika Vijayawada Sales	BZA
8	8977544080	Shireesha Sales (Hyd)	HYD
9	8977533094		BZA	SaiKalyan Marketing
10	8977544098	Mounika BDE hyd 	HYD	Akhila Java Trainer, SIM IS WITH SAIDA
11	8977544095			Front Desk, Prakasam
12	8977544091	Sravani telecaller hyd	HYD	Lavanya Java Trainer, SIM IS WITH SAIDA
13	8977544094	Ambica	BZA
14	8977544092	Prakash sales head	HYD	Arthi Sri SALES hyd
15	8977544090	Datta Yadav	BZA
16	8977544097	Vasavee Kone Yzag Manager	VSKP	Jaya Varma Rayalaseema 
17	8977533093	frontdesk Vijayawada	BZA
18	8977533095	Maruthi Sales	BZA
19	8977544093			Niharika, Prakasam Sales Vijayawada, vani
20	8977544170	Anadh Java Trainer 	BZA
21	8977544180	Kiran Aptitude Trainer 	BZA
22	8977544136	Madhav Sales director	BZA
23	8977544154	Bharath @ Soft Skills 	HYD
24	8977544162	Mallkharjun Java Trainer ( Hyd )	HYD
25	8977544167	Suresh	HYD	Sudeep CR
26	8977544187	Vasavi  Chatbots	BZA
27	8977544158	PM Lakshmi
28	8977544182	Praneeth Office 	BZA	Given Phone One Plus
29	9966188862	 Chat Race ( Maruthi )	BZA
30	9966188853	With Praneeth		Harshini Placements 
31	9966188863	Shiva Sales Hyd	HYD
32	9010555952	Anoosh	BZA
33	9912006777	Saketh sir 	HYD
34	8977900330	Manohar ( Program Manager Hyd )	HYD
35	8977900443	Vasantha ( Program Manager Vij )	BZA
36	8977900886	Rithisha PC	HYD	Given Phone Also
37	7416368866	Sri Latha ( Soft Skills )	HYD
38	8977575710	Ujwala ( Hr Executive )	BZA
39	8977544143	Anusree PM 	HYD
40	8977575704	Basha ( Soft Skills )	BZA
41	8977544548	Sharief	HYD
42	6301341478	Vijayawada Office	BZA
43	8341488448	Krishna Menon Sir (Corporate Relations)	HYD
44	9966188873	Puneet		Check with MADHU in which network
45	9493851133	Sravani Vij Sales	BZA
46	7995569898	Anusha frontdesk hyd	HYD
47	7995579898	Jahnavi Senior CR 	HYD
48	7842018181	Sushmitha Vij Frontdesk	BZA
49	7842016688	Corporate Relations 	HYD			 
50	9642988788	Sai Venkat Pavan SALES hyd	HYD
51	9966188851	Sowmya vskp	VSKP	Vinay Botcha Sales hyd 
52	9966188816	Sowjanya	HYD
53	9966188860	BDE Narendra Vijayawada	BZA
54	7842371133	Mourya		Not IN USE 
55	7842371515	hyd banner ( routed to inbound team )	BZA	Bhuvan Sir ( aisensy number )
56	7842565577	Yzag Front Office 	VSKP
57	7842565588	Deepika (TAS)	HYD	Yalla Mahesh ( Program Manager )
58	7842574646	Deepali 	BZA
59	8977544715	Vijayawada Front Desk ( Sudheer Sandra ) 	BZA	Vaijayanthi
60	8977544703	Tele Caller ( Vijayawada )	BZA
61	8977711263	Ragamayee BDE	HYD	ShrIya PC
62	8977711271	Shashank 		Check with MADHU		NO INFORMATION 
63	8977711272	Jahnavi Golamaru PC	HYD
64	8977711273	vinitha hyd	HYD
65	8977711274	Prakash sales	HYD	Bharadawaz to surya charan
66	8977711275	Raja Sri	HYD
67	8977711276	Usha ( CR )
68	8977711278	Vyshnavi
69	8977711296	kavitha placement  team hyd	HYD
70	8977711297	Madhu Hyd Admin	HYD
71	8977745451	Hostel
72	8977745452	Hostel
73	8977745457	M srinivas telecalling bza main branch 	BZA
74	8977745458	Deepika Program co-ordinator
75	7731066888	Marketing 		Tata TELE
76	9966188806	Phanindra Sales 	HYD
77	9966188854	Naveen Sales Vijayawada	BZA
78	7842178181	Abhilash CR	HYD
79	8977729799	Yzag PM	VSKP
80	8977731135	hyd padma sri ( WFH )	HYD
81	8977731987	Mohammad tofeequ (TAS)	HYD
82	8977733828	Anusha telecaller hyd	HYD
83	8977733931	Deva Anil
84	8977734019
85	8977771886
86	8977772464	Vinay Sales YZAG	VSKP
87	7731066999	Marketing 		TATA TELE
88	7730911666	Parents MEET		Way2news
89	7730911777	Parents MEET		way2news
90	9966188826	Darhas BDE Vijayawada 	BZA
91	8977542037	Sriram PC	HYD
92	8977542045			hyd
93	8977542053			hyd
94	8977542061			hyd
95	8977542075
96	8977542338
97	8977542364
98	8977542384
99	8977542390
100	8977542518
101	8977542590
102	8977542591`;

const viGroup = `1	9642988688	Pushpa Front Desk Vij 		Sai ram sir Proof
2	9912005777	Jaya Sree		Sai ram sir proof
3	9052555952	Sai Ram SIr ( Proof )		Sai ram sir proof
4	9966188852	Aisensy ( With maruthi )
5	9951555957	Sai Ram SIr ( Proof )		Eswar Proof`;

const viCorporate = `1	9966188839	Sravani PM Vijayawada
2	996699 2587	Vizag Front Office 
3	996699 2597	Vizag Front Office`;

// Normalizes name for smart matching (e.g. "Kranthi Kumar" to "kranthikumar")
function normalizeName(n) {
  if (!n) return '';
  return n.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log('Starting Mobile Numbers master sync...');

  // 1. Pull existing Users to map their IDs
  const users = await prisma.user.findMany();
  const userMap = new Map();
  for (const u of users) {
    const key = normalizeName(u.name);
    if (key) userMap.set(key, u.id);
  }
  console.log(`Loaded ${userMap.size} normalized user names for matching.`);

  const parseLines = (blob, providerDefault) => {
    return blob.trim().split('\n').map(line => {
      const cols = line.split('\t').map(c => c.trim());
      if (cols.length < 2) return null;
      const numRaw = cols[1].replace(/[^0-9]/g, ''); // keep only digits
      if (!numRaw || numRaw.length < 5) return null; // invalid
      
      return {
        number: numRaw,
        assignedTo: cols[2] || null,
        location: cols[3] || null,
        comments: cols[4] || cols[5] || null,
        provider: providerDefault
      };
    }).filter(Boolean);
  };

  const allParsed = [
    ...parseLines(mainGroup, 'BSNL'), // Default main group
    ...parseLines(viGroup, 'Vi'),
    ...parseLines(viCorporate, 'Vi')
  ];

  console.log(`Parsed ${allParsed.length} candidate records to upsert.`);

  let countMatched = 0;
  let countUpserted = 0;

  for (const item of allParsed) {
    const originalNum = item.number;
    
    // Attempt user matching
    let matchedUserId = null;
    const lookupKey = normalizeName(item.assignedTo);
    if (lookupKey && userMap.has(lookupKey)) {
      matchedUserId = userMap.get(lookupKey);
      countMatched++;
    }

    const status = item.assignedTo ? 'ASSIGNED' : 'AVAILABLE';

    // Upsert operation: Safely insert or update
    await prisma.mobileNumber.upsert({
      where: { number: originalNum },
      update: {
        assignedTo: item.assignedTo,
        userId: matchedUserId,
        status: status,
        provider: item.provider,
        planDetails: item.comments || item.location
      },
      create: {
        number: originalNum,
        assignedTo: item.assignedTo,
        userId: matchedUserId,
        status: status,
        provider: item.provider,
        planDetails: item.comments || item.location,
        assignedAt: new Date()
      }
    });

    countUpserted++;
  }

  console.log(`✅ Successfully processed ${countUpserted} records!`);
  console.log(`   └─ Linked ${countMatched} SIM cards to dynamic database Users.`);
}

main()
  .catch(e => console.error('Sync failed:', e))
  .finally(() => prisma.$disconnect());
