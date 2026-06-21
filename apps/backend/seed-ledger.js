require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const rawData = `01/04/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-142832417		10,699.80		10,699.80 Dr
01/04/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-142866177		11,719.80		11,719.80 Dr
03/04/2025	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED	Bill	C37E252600004505		10,718.40		10,718.40 Dr
03/04/2025	IT and Internet Expenses	JIO PLATFORMS LIMITED	Bill	C37E252600000668		4,593.60		4,593.60 Dr
06/04/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	MF2637I000054253		13,049.42		13,049.42 Dr
09/04/2025	IT and Internet Expenses	Petty Cash	Expense			649.00		649.00 Dr
09/04/2025	IT and Internet Expenses	Petty Cash	Expense			506.00		506.00 Dr
09/04/2025	IT and Internet Expenses	Petty Cash	Expense			3,741.00		3,741.00 Dr
09/04/2025	IT and Internet Expenses	Petty Cash	Expense			4,000.00		4,000.00 Dr
16/04/2025	IT and Internet Expenses	Petty Cash	Expense			600.00		600.00 Dr
16/04/2025	IT and Internet Expenses	Petty Cash	Expense			460.00		460.00 Dr
16/04/2025	IT and Internet Expenses	Petty Cash	Expense			1,720.00		1,720.00 Dr
16/04/2025	IT and Internet Expenses	Petty Cash	Expense			99.00		99.00 Dr
16/04/2025	IT and Internet Expenses	Petty Cash	Expense			226.00		226.00 Dr
17/04/2025	IT and Internet Expenses	Petty Cash	Expense			999.00		999.00 Dr
18/04/2025	IT and Internet Expenses	Kotak - VIJ	Expense			8,319.00		8,319.00 Dr
18/04/2025	IT and Internet Expenses	Petty Cash	Expense			1,740.00		1,740.00 Dr
23/04/2025	IT and Internet Expenses	Petty Cash	Expense			1,070.00		1,070.00 Dr
24/04/2025	IT and Internet Expenses	Petty Cash	Expense			1,050.00		1,050.00 Dr
24/04/2025	IT and Internet Expenses	Petty Cash	Expense			629.00		629.00 Dr
24/04/2025	IT and Internet Expenses	Petty Cash	Expense			380.00		380.00 Dr
24/04/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I000486981		2,997.00		2,997.00 Dr
25/04/2025	IT and Internet Expenses	EXCELL MEDIA PVT LTD	Bill	V-16536982		16,542.00		16,542.00 Dr
25/04/2025	IT and Internet Expenses	EXCELL MEDIA PVT LTD	Vendor Credits	V-697358			5,513.89	5,513.89 Cr
25/04/2025	IT and Internet Expenses	EXCELL MEDIA PVT LTD	Vendor Credits	V-697359			5,513.90	5,513.90 Cr
25/04/2025	IT and Internet Expenses	EXCELL MEDIA PVT LTD	Vendor Credits	V-697360			5,513.92	5,513.92 Cr
25/04/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HT2636I000012139		8,320.00		8,320.00 Dr
26/04/2025	IT and Internet Expenses	Kotak - VIJ	Expense			6,850.00		6,850.00 Dr
01/05/2025	IT and Internet Expenses	Petty Cash	Expense			500.00		500.00 Dr
01/05/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-135293780		6,294.00		6,294.00 Dr
01/05/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-135297524		6,294.00		6,294.00 Dr
01/05/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-135298877		6,294.00		6,294.00 Dr
02/05/2025	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED	Bill	C37E252600015666		8,169.60		8,169.60 Dr
03/05/2025	IT and Internet Expenses	JIO PLATFORMS LIMITED	Bill	C37E252600000795		2,042.40		2,042.40 Dr
06/05/2025	IT and Internet Expenses	Kotak - VIJ	Expense			8,135.00		8,135.00 Dr
06/05/2025	IT and Internet Expenses	Kotak - VIJ	Expense			8,135.00		8,135.00 Dr
06/05/2025	IT and Internet Expenses	Kotak - VIJ	Expense			8,135.00		8,135.00 Dr
06/05/2025	IT and Internet Expenses	Kotak - VIJ	Expense			1,110.02		1,110.02 Dr
06/05/2025	IT and Internet Expenses	Petty Cash	Expense			280.00		280.00 Dr
06/05/2025	IT and Internet Expenses	Moghalrajpuram HDFC Bank	Expense			35.57		35.57 Dr
06/05/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	MF2637I000340295		13,157.00		13,157.00 Dr
07/05/2025	IT and Internet Expenses	Petty Cash	Expense			3,100.00		3,100.00 Dr
08/05/2025	IT and Internet Expenses	Petty Cash	Expense			200.00		200.00 Dr
10/05/2025	IT and Internet Expenses	Petty Cash	Expense			1,049.00		1,049.00 Dr
14/05/2025	IT and Internet Expenses	Moghalrajpuram HDFC Bank	Expense			391.90		391.90 Dr
16/05/2025	IT and Internet Expenses	Petty Cash	Expense			3,823.00		3,823.00 Dr
17/05/2025	IT and Internet Expenses	Petty Cash	Expense			700.00		700.00 Dr
18/05/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-144775564		510.93		510.93 Dr
18/05/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-144776386		510.93		510.93 Dr
18/05/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-144776592		510.93		510.93 Dr
19/05/2025	IT and Internet Expenses	Petty Cash	Expense			1,894.00		1,894.00 Dr
19/05/2025	IT and Internet Expenses	Petty Cash	Expense			3,313.00		3,313.00 Dr
23/05/2025	IT and Internet Expenses	Moghalrajpuram HDFC Bank	Expense			12,051.00		12,051.00 Dr
27/05/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	HT2637I000006761		2,997.00		2,997.00 Dr
29/05/2025	IT and Internet Expenses	Petty Cash	Expense			1,299.00		1,299.00 Dr
29/05/2025	IT and Internet Expenses	Petty Cash	Expense			180.00		180.00 Dr
31/05/2025	IT and Internet Expenses	Petty Cash	Expense			526.00		526.00 Dr
03/06/2025	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED	Bill	C37E252600026163		8,169.60		8,169.60 Dr
03/06/2025	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED	Bill	C37E252600026164		8,169.60		8,169.60 Dr
03/06/2025	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED	Bill	C37E252600026165		8,169.60		8,169.60 Dr
03/06/2025	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED-TG	Bill	C36E252600045543		4,444.80		4,444.80 Dr
04/06/2025	IT and Internet Expenses	Kotak - VIJ	Expense			2,580.66		2,580.66 Dr
05/06/2025	IT and Internet Expenses	JIO PLATFORMS LIMITED	Bill	C37E252600001834		2,042.40		2,042.40 Dr
05/06/2025	IT and Internet Expenses	JIO PLATFORMS LIMITED	Bill	C37E252600001835		2,042.40		2,042.40 Dr
05/06/2025	IT and Internet Expenses	JIO PLATFORMS LIMITED	Bill	C37E252600001836		2,042.40		2,042.40 Dr
05/06/2025	IT and Internet Expenses	JIO PLATFORMS LIMITED-TG	Bill	C36E252600005074		1,111.20		1,111.20 Dr
06/06/2025	IT and Internet Expenses	Petty Cash	Expense			594.00		594.00 Dr
06/06/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	MF2637I000619188		13,162.00		13,162.00 Dr
10/06/2025	IT and Internet Expenses	Petty Cash	Expense			7,200.00		7,200.00 Dr
11/06/2025	IT and Internet Expenses	Petty Cash	Expense			6,957.00		6,957.00 Dr
18/06/2025	IT and Internet Expenses	Petty Cash	Expense			500.00		500.00 Dr
18/06/2025	IT and Internet Expenses	Petty Cash	Expense			1,800.00		1,800.00 Dr
24/06/2025	IT and Internet Expenses	Petty Cash	Expense			269.00		269.00 Dr
24/06/2025	IT and Internet Expenses	Kotak - HYD	Expense			6,556.08		6,556.08 Dr
25/06/2025	IT and Internet Expenses	M/S KRISHNA COMPUTER PERIPHERALS	Bill	KCP/25-26/5826		2,966.10		2,966.10 Dr
27/06/2025	IT and Internet Expenses	Petty Cash	Expense			10,000.00		10,000.00 Dr
27/06/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HT2636I000023289		5,380.87		5,380.87 Dr
27/06/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Vendor Credits	HT2636C000000700			5,516.52	5,516.52 Cr
01/07/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-148251131		8,313.90		8,313.90 Dr
01/07/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-148261486		3,105.94		3,105.94 Dr
01/07/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-148261462		3,105.94		3,105.94 Dr
01/07/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-148235658		8,313.90		8,313.90 Dr
01/07/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-148261265		3,105.94		3,105.94 Dr
01/07/2025	IT and Internet Expenses	Petty Cash	Expense			600.00		600.00 Dr
01/07/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Vendor Credits	AP-B1-148261550			7,081.40	7,081.40 Cr
02/07/2025	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED	Bill	C37E252600033968		8,169.60		8,169.60 Dr
02/07/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-148266899		7,734.22		7,734.22 Dr
02/07/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Vendor Credits	AP-B1-148267424			355.54	355.54 Cr
03/07/2025	IT and Internet Expenses	JIO PLATFORMS LIMITED	Bill	C37E252600003157		2,042.40		2,042.40 Dr
05/07/2025	IT and Internet Expenses	Kotak - VIJ	Expense			2,518.12		2,518.12 Dr
05/07/2025	IT and Internet Expenses	Kotak - VIJ	Expense			1,653.18		1,653.18 Dr
06/07/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	MF2637I000932562		13,299.60		13,299.60 Dr
07/07/2025	IT and Internet Expenses	Kotak - VIJ	Expense			1,510.00		1,510.00 Dr
07/07/2025	IT and Internet Expenses	Petty Cash	Expense			9,551.00		9,551.00 Dr
09/07/2025	IT and Internet Expenses	Petty Cash	Expense			9,551.00		9,551.00 Dr
12/07/2025	IT and Internet Expenses	Kotak - VIJ	Expense			9,816.42		9,816.42 Dr
15/07/2025	IT and Internet Expenses	Kotak - VIJ	Expense			3,559.82		3,559.82 Dr
15/07/2025	IT and Internet Expenses	Kotak - VIJ	Expense			3,559.82		3,559.82 Dr
15/07/2025	IT and Internet Expenses	Kotak - VIJ	Expense			770.09		770.09 Dr
16/07/2025	IT and Internet Expenses	Petty Cash	Expense			675.00		675.00 Dr
17/07/2025	IT and Internet Expenses	Petty Cash	Expense			850.00		850.00 Dr
17/07/2025	IT and Internet Expenses	Kotak - VIJ	Expense			3,559.82		3,559.82 Dr
19/07/2025	IT and Internet Expenses	Petty Cash	Expense			2,004.00		2,004.00 Dr
19/07/2025	IT and Internet Expenses	Petty Cash	Expense			411.00		411.00 Dr
20/07/2025	IT and Internet Expenses	Petty Cash	Expense			3,490.00		3,490.00 Dr
21/07/2025	IT and Internet Expenses	Moghalrajpuram HDFC Bank	Expense	108455770650		390.90		390.90 Dr
23/07/2025	IT and Internet Expenses	Petty Cash	Expense			700.00		700.00 Dr
24/07/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I002610350		2,997.00		2,997.00 Dr
26/07/2025	IT and Internet Expenses	Petty Cash	Expense			472.00		472.00 Dr
27/07/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HT2636I000031919		8,457.90		8,457.90 Dr
29/07/2025	IT and Internet Expenses	Petty Cash	Expense			7,000.00		7,000.00 Dr
29/07/2025	IT and Internet Expenses	Petty Cash	Expense			10,000.00		10,000.00 Dr
02/08/2025	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED-TG	Bill	C36E252600079267		8,169.60		8,169.60 Dr
02/08/2025	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED-TG	Bill	C36E252600090955		4,444.80		4,444.80 Dr
04/08/2025	IT and Internet Expenses	JIO PLATFORMS LIMITED-TG	Bill	C36E252600010100		1,111.20		1,111.20 Dr
04/08/2025	IT and Internet Expenses	JIO PLATFORMS LIMITED-TG	Bill	C36E252600010106		2,042.40		2,042.40 Dr
04/08/2025	IT and Internet Expenses	Kotak - VIJ	Expense			2,470.92		2,470.92 Dr
05/08/2025	IT and Internet Expenses	Kotak - VIJ	Expense			5,994.00		5,994.00 Dr
05/08/2025	IT and Internet Expenses	Kotak - VIJ	Expense			9,551.00		9,551.00 Dr
06/08/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	MF2637I001297053		14,462.94		14,462.94 Dr
06/08/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LTD	Bill	TG-B1-150091166		8,093.92		8,093.92 Dr
11/08/2025	IT and Internet Expenses	Petty Cash	Expense			4,502.00		4,502.00 Dr
17/08/2025	IT and Internet Expenses	Moghalrajpuram HDFC Bank	Expense			8,403.00		8,403.00 Dr
23/08/2025	IT and Internet Expenses	Petty Cash	Expense			1,300.00		1,300.00 Dr
24/08/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I003423706		460.40		460.40 Dr
25/08/2025	IT and Internet Expenses	Kotak - HYD	Expense			12,050.16		12,050.16 Dr
25/08/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HT2636I000048274		8,320.00		8,320.00 Dr
28/08/2025	IT and Internet Expenses	Kotak - HYD	Expense			6,556.08		6,556.08 Dr
06/09/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	MF2637I001683849		14,902.00		14,902.00 Dr
08/09/2025	IT and Internet Expenses	Kotak - VIJ	Expense			5,232.12		5,232.12 Dr
09/09/2025	IT and Internet Expenses	Kotak - VIJ	Expense			9,816.42		9,816.42 Dr
16/09/2025	IT and Internet Expenses	Moghalrajpuram HDFC Bank	Expense			391.90		391.90 Dr
19/09/2025	IT and Internet Expenses	Petty Cash	Expense			1,897.00		1,897.00 Dr
22/09/2025	IT and Internet Expenses	Petty Cash	Expense			2,994.00		2,994.00 Dr
22/09/2025	IT and Internet Expenses	Petty Cash	Expense			1,254.00		1,254.00 Dr
23/09/2025	IT and Internet Expenses	Petty Cash	Expense			614.00		614.00 Dr
24/09/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I004188808		999.00		999.00 Dr
25/09/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	HT2637I000010614		7,432.00		7,432.00 Dr
25/09/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HT2636I000054865		8,320.00		8,320.00 Dr
06/10/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	MF2637I002053449		15,465.77		15,465.77 Dr
08/10/2025	IT and Internet Expenses	Kotak - VIJ	Expense			9,731.81		9,731.81 Dr
15/10/2025	IT and Internet Expenses	Petty Cash	Expense			1,137.00		1,137.00 Dr
24/10/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I004999383		8,314.00		8,314.00 Dr
24/10/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I005007945		999.00		999.00 Dr
24/10/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Vendor Credits	HF2636C000226675			130.30	130.30 Cr
25/10/2025	IT and Internet Expenses	Kotak - HYD	Expense			10,085.24		10,085.24 Dr
25/10/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HT2636I000061785		8,320.00		8,320.00 Dr
27/10/2025	IT and Internet Expenses	Petty Cash	Expense			609.00		609.00 Dr
27/10/2025	IT and Internet Expenses	Petty Cash	Expense			243.00		243.00 Dr
31/10/2025	IT and Internet Expenses	Petty Cash	Expense			1,769.00		1,769.00 Dr
04/11/2025	IT and Internet Expenses	Kotak - HYD	Expense			8,319.00		8,319.00 Dr
06/11/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	MF2637I002434531		16,601.98		16,601.98 Dr
11/11/2025	IT and Internet Expenses	Petty Cash	Expense			5,071.00		5,071.00 Dr
11/11/2025	IT and Internet Expenses	Kotak - VIJ	Expense			7,610.90		7,610.90 Dr
22/11/2025	IT and Internet Expenses	Kotak - VIJ	Expense			9,816.42		9,816.42 Dr
24/11/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I005876240		999.00		999.00 Dr
01/12/2025	IT and Internet Expenses	Petty Cash	Expense			500.00		500.00 Dr
01/12/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-150000674		8,313.90		8,313.90 Dr
01/12/2025	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-150038849		8,313.90		8,313.90 Dr
02/12/2025	IT and Internet Expenses	Kotak - VIJ	Expense			8,846.46		8,846.46 Dr
03/12/2025	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED-TG	Bill	C36E252600154153		4,444.80		4,444.80 Dr
04/12/2025	IT and Internet Expenses	JIO PLATFORMS LIMITED-TG	Bill	C36E252600019653		1,111.20		1,111.20 Dr
05/12/2025	IT and Internet Expenses	Petty Cash	Expense			6,000.00		6,000.00 Dr
18/12/2025	IT and Internet Expenses	Petty Cash	Expense			1,000.00		1,000.00 Dr
24/12/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I006711658		999.00		999.00 Dr
27/12/2025	IT and Internet Expenses	Kotak - HYD	Expense			6,556.08		6,556.08 Dr
27/12/2025	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	BBL372612B019398		9,565.22		9,565.22 Dr
01/01/2026	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-144639532		8,313.90		8,313.90 Dr
01/01/2026	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-151280470		8,313.90		8,313.90 Dr
01/01/2026	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-151282828		8,313.90		8,313.90 Dr
01/01/2026	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-151283662		8,313.90		8,313.90 Dr
01/01/2026	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-151676420		10,313.90		10,313.90 Dr
02/01/2026	IT and Internet Expenses	Kotak - HYD	Expense			9,809.80		9,809.80 Dr
02/01/2026	IT and Internet Expenses	Kotak - VIJ	Expense			9,816.42		9,816.42 Dr
06/01/2026	IT and Internet Expenses	CANARA - OD/OCC xxxxxxxx4810	Expense	Act Server Internet bill		22,180.82		22,180.82 Dr
06/01/2026	IT and Internet Expenses	CANARA CA  xxxxxxxx9658	Expense			9,390.22		9,390.22 Dr
06/01/2026	IT and Internet Expenses	CANARA CA  xxxxxxxx9658	Expense			9,040.31		9,040.31 Dr
06/01/2026	IT and Internet Expenses	CANARA CA  xxxxxxxx9658	Expense			30,975.00		30,975.00 Dr
06/01/2026	IT and Internet Expenses	CANARA CA  xxxxxxxx9658	Expense			11,286.96		11,286.96 Dr
06/01/2026	IT and Internet Expenses	FUTURIQ SYSTEMS PRIVATE LIMITED	Bill	SignX/OS/429859		840.00		840.00 Dr
06/01/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	MF2637I003273910		18,797.30		18,797.30 Dr
08/01/2026	IT and Internet Expenses	CANARA CA  xxxxxxxx9658	Expense			9,810.40		9,810.40 Dr
08/01/2026	IT and Internet Expenses	Kotak - VIJ	Expense			5,232.12		5,232.12 Dr
09/01/2026	IT and Internet Expenses	CANARA CA  xxxxxxxx9658	Expense			9,810.40		9,810.40 Dr
09/01/2026	IT and Internet Expenses	CANARA CA  xxxxxxxx9658	Expense			9,810.40		9,810.40 Dr
17/01/2026	IT and Internet Expenses	Kotak - VIJ	Expense			5,306.46		5,306.46 Dr
20/01/2026	IT and Internet Expenses	Moghalrajpuram HDFC Bank	Expense	107189383421		13,445.00		13,445.00 Dr
22/01/2026	IT and Internet Expenses	Kotak - VIJ	Expense			699.00		699.00 Dr
24/01/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I007585823		999.00		999.00 Dr
26/01/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I007627338		16,640.00		16,640.00 Dr
27/01/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	BBL372601B020900		45,347.22		45,347.22 Dr
01/02/2026	IT and Internet Expenses	JIO PLATFORMS LIMITED	Bill	C37E252600094668		10,718.40		10,718.40 Dr
01/02/2026	IT and Internet Expenses	JIO PLATFORMS LIMITED	Bill	C37E252600009423		4,593.60		4,593.60 Dr
01/02/2026	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-160669876		11,394.30		11,394.30 Dr
01/02/2026	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-160663984		12,984.60		12,984.60 Dr
01/02/2026	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LTD	Bill	TG-B1-153326656		8,094.00		8,094.00 Dr
02/02/2026	IT and Internet Expenses	Moghalrajpuram HDFC Bank	Expense			5,232.12		5,232.12 Dr
02/02/2026	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED	Bill	C37E252600094668		10,718.40		10,718.40 Dr
02/02/2026	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED-TG	Bill	C36E252600195174		4,444.80		4,444.80 Dr
03/02/2026	IT and Internet Expenses	JIO PLATFORMS LIMITED-TG	Bill	C36E252600025671		1,111.20		1,111.20 Dr
23/02/2026	IT and Internet Expenses	Kotak - VIJ	Expense			29,486.00		29,486.00 Dr
24/02/2026	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-160844550		24,988.00		24,988.00 Dr
24/02/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I008497744		999.00		999.00 Dr
27/02/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I008578222		29,395.00		29,395.00 Dr
27/02/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Vendor Credits	HF2637C000143603			3,405.88	3,405.88 Cr
01/03/2026	IT and Internet Expenses	Petty Cash	Expense			6,556.00		6,556.00 Dr
03/03/2026	IT and Internet Expenses	Kotak - VIJ	Expense			9,140.00		9,140.00 Dr
03/03/2026	IT and Internet Expenses	RELIANCE JIO INFOCOMM LIMITED	Bill	C37E252600101358		10,718.40		10,718.40 Dr
04/03/2026	IT and Internet Expenses	ATRIA CONVERGENCE TECHNOLOGIES LIMITED	Bill	AP-B1-162452764		7,746.30		7,746.30 Dr
05/03/2026	IT and Internet Expenses	JIO PLATFORMS LIMITED	Bill	C37E252600010133		4,593.60		4,593.60 Dr
09/03/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	BBL372603B023181		20,444.44		20,444.44 Dr
09/03/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Vendor Credits	BBL372603C004903			15,555.55	15,555.55 Cr
13/03/2026	IT and Internet Expenses	Petty Cash	Expense			2,824.00		2,824.00 Dr
14/03/2026	IT and Internet Expenses	Petty Cash	Expense			2,343.00		2,343.00 Dr
16/03/2026	IT and Internet Expenses	KUMAR ELECTRONICS	Bill	2056		3,940.68		3,940.68 Dr
21/03/2026	IT and Internet Expenses	KUMAR ELECTRONICS	Bill	2076		2,288.14		2,288.14 Dr
24/03/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I009404574		1,099.00		1,099.00 Dr
26/03/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED	Bill	HF2637I005670350		13,431.00		13,431.00 Dr
26/03/2026	IT and Internet Expenses	BHARTI AIRTEL LIMITED-TG	Bill	HF2636I009459838		8,320.00		8,320.00 Dr`;

async function main() {
  console.log('Starting ledger seeding...');
  
  const lines = rawData.trim().split('\n');
  let inserted = 0;

  // Delete existing to prevent duplication if run multiple times, but SAFELY only deleting from the newly created table!
  await prisma.internetExpense.deleteMany();

  for (const line of lines) {
    const cols = line.split('\t').map(c => c.trim());
    if (cols.length < 5) continue;

    const rawDate = cols[0]; // DD/MM/YYYY
    const payee = cols[2];
    const type = cols[3];
    const refNum = cols[4];
    
    // Depending on whether it's a bill or credit, columns can shift. Let's capture debit, credit, amount, type.
    // Example layout: [date, acct, payee, type, ref, val1, val2, val3, finalAmountStr]
    const amountCol = cols[cols.length - 1] || ''; 
    const balanceType = amountCol.includes('Cr') ? 'Cr' : 'Dr';
    
    // Extract numerical amount from the final column (e.g. "10,699.80 Dr")
    const numericAmount = parseFloat(amountCol.replace(/[^\d.]/g, '')) || 0;

    // Parse the components manually:
    // If there is a Debit value and a Credit value
    let debit = null;
    let credit = null;

    if (balanceType === 'Dr') {
      debit = numericAmount;
    } else {
      credit = numericAmount;
    }

    // Parse Date
    const [day, month, year] = rawDate.split('/');
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    await prisma.internetExpense.create({
      data: {
        date: parsedDate,
        payee,
        type,
        reference: refNum || null,
        debit,
        credit,
        amount: numericAmount,
        balanceType
      }
    });
    inserted++;
  }

  console.log(`Seeded ${inserted} Internet Expense records!`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
