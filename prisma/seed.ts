import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Clean existing data ───
  await prisma.transaction.deleteMany();
  await prisma.entryTag.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.diaryEntry.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log("  Cleared existing data.");

  // ─── Create Users ───
  const passwordHash = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      passwordHash,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      passwordHash,
    },
  });

  console.log(`  Created users: ${alice.name}, ${bob.name}`);

  // ─── Create Tags ───
  const tagData = [
    { name: "work", color: "#3B82F6" },
    { name: "personal", color: "#8B5CF6" },
    { name: "travel", color: "#F59E0B" },
    { name: "health", color: "#10B981" },
    { name: "family", color: "#EF4444" },
    { name: "learning", color: "#6366F1" },
    { name: "fitness", color: "#14B8A6" },
    { name: "food", color: "#F97316" },
    { name: "music", color: "#EC4899" },
    { name: "books", color: "#8B5CF6" },
  ];

  const aliceTags = await Promise.all(
    tagData.map((t) =>
      prisma.tag.create({ data: { ...t, userId: alice.id } })
    )
  );

  const bobTags = await Promise.all(
    tagData.slice(0, 6).map((t) =>
      prisma.tag.create({ data: { ...t, userId: bob.id } })
    )
  );

  console.log(`  Created ${aliceTags.length + bobTags.length} tags.`);

  // ─── Helper: date N days ago ───
  function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ─── Create Diary Entries for Alice (20 entries over 25 days) ───
  const aliceEntries = [
    {
      title: "Fresh Start Monday",
      content:
        "Kicked off the week with a great morning run. The air was crisp and the sunrise painted the sky in shades of pink and gold. Had a productive standup meeting at work and finally cracked that bug I'd been wrestling with for days. Made a homemade pasta dinner — the garlic bread turned out perfect.",
      mood: "productive",
      entryDate: daysAgo(0),
      highlight: "Finally fixed the authentication bug at work",
      gratitude: "Grateful for a supportive team and a warm cup of coffee",
      expense: 24.5,
      expenseTitle: "Grocery run",
      expenseDesc: "Ingredients for homemade pasta and garlic bread",
      expenseType: "food",
      tagIds: [aliceTags[0].id, aliceTags[3].id],
    },
    {
      title: "Quiet Sunday",
      content:
        "Spent the morning reading on the balcony with a cup of chai. Got through three chapters of the novel I've been putting off. Afternoon was spent rearranging the bookshelf — it's oddly therapeutic. Called mom in the evening; she told me about the garden tomatoes finally ripening.",
      mood: "peaceful",
      entryDate: daysAgo(1),
      highlight: "Finished three chapters of my book in one sitting",
      gratitude: "Grateful for quiet mornings and good books",
      expense: null,
      expenseTitle: null,
      expenseDesc: null,
      expenseType: null,
      tagIds: [aliceTags[1].id, aliceTags[9].id],
    },
    {
      title: "Saturday Adventures",
      content:
        "Went hiking at Cedar Ridge with Sarah and Jake. The trail was muddy from yesterday's rain but the views from the top were absolutely worth it. We spotted a family of deer near the creek! Grabbed burgers afterwards at that new place downtown — their sweet potato fries are incredible.",
      mood: "excited",
      entryDate: daysAgo(2),
      highlight: "Spotted a family of deer on the hiking trail",
      gratitude: "Grateful for adventurous friends",
      expense: 35.0,
      expenseTitle: "Lunch with friends",
      expenseDesc: "Burgers and fries at The Local Grill",
      expenseType: "food",
      tagIds: [aliceTags[2].id, aliceTags[3].id, aliceTags[6].id],
    },
    {
      title: "Work From Home Day",
      content:
        "Worked from home today. Had back-to-back meetings in the morning which was draining, but managed to push out the feature branch by 3pm. Took a walk around the neighborhood to decompress. Found a little free library box and swapped a book. The evening was spent cooking stir fry and watching a documentary about deep sea creatures.",
      mood: "neutral",
      entryDate: daysAgo(3),
      highlight: "Discovered a little free library in the neighborhood",
      gratitude: "Grateful for the flexibility to work from home",
      expense: 12.0,
      expenseTitle: "Coffee beans",
      expenseDesc: "New bag of Ethiopian single origin from the corner shop",
      expenseType: "food",
      tagIds: [aliceTags[0].id, aliceTags[9].id],
    },
    {
      title: "Creative Flow",
      content:
        "Had an amazing creative session today. Spent the entire afternoon sketching ideas for the new side project. The design concepts are really coming together. Tried a new watercolor technique I saw on YouTube — messy but fun. Also baked banana bread; the whole apartment smells incredible.",
      mood: "creative",
      entryDate: daysAgo(4),
      highlight: "Designed the initial mockups for my side project",
      gratitude: "Grateful for the gift of creativity",
      expense: 18.75,
      expenseTitle: "Art supplies",
      expenseDesc: "Watercolor paper and new brush set",
      expenseType: "expense",
      tagIds: [aliceTags[1].id, aliceTags[5].id],
    },
    {
      title: "Gym Progress",
      content:
        "Hit a new personal record on deadlifts today — 185 lbs! The trainer said my form has improved a lot over the past month. Followed it up with some yoga stretching. Body feels sore but accomplished. Meal prepped chicken and rice bowls for the week.",
      mood: "productive",
      entryDate: daysAgo(5),
      highlight: "New personal record: 185 lb deadlift",
      gratitude: "Grateful for a healthy body that keeps getting stronger",
      expense: 0,
      expenseTitle: null,
      expenseDesc: null,
      expenseType: null,
      tagIds: [aliceTags[3].id, aliceTags[6].id],
    },
    {
      title: "Rainy Day Reflections",
      content:
        "It rained all day. There's something meditative about the sound of rain against the window. Journaled about where I want to be in five years. It's both exciting and terrifying. Had a long video call with my college roommate — we're planning a trip to Portland in the spring.",
      mood: "reflective",
      entryDate: daysAgo(6),
      highlight: "Started planning a spring trip to Portland",
      gratitude: "Grateful for old friends who still feel like family",
      expense: null,
      expenseTitle: null,
      expenseDesc: null,
      expenseType: null,
      tagIds: [aliceTags[1].id, aliceTags[4].id],
    },
    {
      title: "Team Celebration",
      content:
        "Our team shipped the Q4 feature today! We've been working on it for two months. The PM brought in cupcakes and we had a mini celebration in the break room. Feels so good to see it live. Went out for dinner with coworkers at the Italian place — the tiramisu was heavenly.",
      mood: "happy",
      entryDate: daysAgo(7),
      highlight: "Shipped the Q4 feature after two months of work",
      gratitude: "Grateful for an incredible team that pulls together",
      expense: 52.0,
      expenseTitle: "Team dinner",
      expenseDesc: "Italian dinner with the team to celebrate the launch",
      expenseType: "food",
      tagIds: [aliceTags[0].id, aliceTags[7].id],
    },
    {
      title: "Slow Morning",
      content:
        "Woke up without an alarm for the first time in weeks. Made pancakes with blueberries. Spent the morning on the couch with the cat, just doing nothing. Sometimes doing nothing is exactly what you need. In the afternoon I organized the closet — donated two bags of clothes.",
      mood: "peaceful",
      entryDate: daysAgo(8),
      highlight: "A truly restful morning with no alarm",
      gratitude: "Grateful for lazy mornings and fluffy pancakes",
      expense: null,
      expenseTitle: null,
      expenseDesc: null,
      expenseType: null,
      tagIds: [aliceTags[1].id],
    },
    {
      title: "Music Night",
      content:
        "Went to a live jazz show at The Blue Note with Marcus. The saxophone player was unreal — she played a 10-minute solo that gave me actual chills. We stayed until midnight. The walk home through the city was magical — all the lights reflecting off the wet streets.",
      mood: "excited",
      entryDate: daysAgo(9),
      highlight: "Incredible saxophone solo at the jazz show",
      gratitude: "Grateful for live music and spontaneous nights out",
      expense: 45.0,
      expenseTitle: "Jazz show tickets",
      expenseDesc: "Two tickets + drinks at The Blue Note",
      expenseType: "expense",
      tagIds: [aliceTags[8].id, aliceTags[1].id],
    },
    {
      title: "Stressful Deadline",
      content:
        "The client moved the deadline up by a week. Spent most of the day in crisis mode trying to re-prioritize tasks. Skipped lunch and had way too much coffee. Managed to get the critical path sorted by EOD but I'm exhausted. Need to set better boundaries.",
      mood: "stressed",
      entryDate: daysAgo(10),
      highlight: null,
      gratitude: "Grateful that I can handle pressure even when it's tough",
      expense: 8.5,
      expenseTitle: "Coffee overload",
      expenseDesc: "Three lattes from the cafe across the street",
      expenseType: "food",
      tagIds: [aliceTags[0].id],
    },
    {
      title: "Family Dinner",
      content:
        "Drove to my parents' house for dinner. Dad made his famous pot roast and mom baked an apple pie. My sister brought her new puppy — a golden retriever named Biscuit who chewed on everyone's shoes. Played board games after dinner. I won Scrabble for the first time ever.",
      mood: "grateful",
      entryDate: daysAgo(12),
      highlight: "Won Scrabble for the first time against the family",
      gratitude: "Grateful for family, home cooking, and puppies named Biscuit",
      expense: 15.0,
      expenseTitle: "Gas",
      expenseDesc: "Round trip to parents' house",
      expenseType: "expense",
      tagIds: [aliceTags[4].id, aliceTags[7].id],
    },
    {
      title: "Learning Day",
      content:
        "Spent the day doing an online course on system design. The module on database sharding was particularly interesting. Took detailed notes and even built a small demo project. It's amazing how much you can learn in a single focused day.",
      mood: "productive",
      entryDate: daysAgo(14),
      highlight: "Completed the system design module on database sharding",
      gratitude: "Grateful for access to free learning resources",
      expense: null,
      expenseTitle: null,
      expenseDesc: null,
      expenseType: null,
      tagIds: [aliceTags[5].id, aliceTags[0].id],
    },
    {
      title: "Feeling Under the Weather",
      content:
        "Woke up with a sore throat and a headache. Stayed in bed most of the day. Watched comfort shows and drank about a gallon of herbal tea. The cat seemed to sense something was off and stayed curled up next to me all day. Hopefully tomorrow is better.",
      mood: "tired",
      entryDate: daysAgo(16),
      highlight: null,
      gratitude: "Grateful for a warm bed and a caring cat",
      expense: 22.0,
      expenseTitle: "Medicine",
      expenseDesc: "Cold medicine and throat lozenges from the pharmacy",
      expenseType: "expense",
      tagIds: [aliceTags[3].id],
    },
    {
      title: "Back on My Feet",
      content:
        "Feeling much better today. Went for a gentle walk in the park. The autumn leaves are stunning right now — reds, oranges, and yellows everywhere. Picked up a pumpkin spice latte (basic, I know) and sat on a bench just watching people. Sometimes the simplest things are the best.",
      mood: "happy",
      entryDate: daysAgo(17),
      highlight: "Beautiful autumn colors in the park",
      gratitude: "Grateful for health and the beauty of changing seasons",
      expense: 6.5,
      expenseTitle: "Pumpkin spice latte",
      expenseDesc: "From the coffee shop by the park",
      expenseType: "food",
      tagIds: [aliceTags[1].id, aliceTags[3].id],
    },
    {
      title: "Concert Planning",
      content:
        "Got tickets for the Arctic Monkeys concert next month! I've been waiting for this tour for years. Spent the evening making a playlist of their best songs and convincing friends to come along. Also signed up for a pottery class that starts next week — trying new things.",
      mood: "excited",
      entryDate: daysAgo(19),
      highlight: "Scored Arctic Monkeys tickets!",
      gratitude: "Grateful for music that makes life better",
      expense: 120.0,
      expenseTitle: "Concert tickets",
      expenseDesc: "Two tickets for Arctic Monkeys at the arena",
      expenseType: "expense",
      tagIds: [aliceTags[8].id, aliceTags[1].id],
    },
    {
      title: "Anxious About Tomorrow",
      content:
        "Big presentation at work tomorrow. I've prepared thoroughly but the nerves are real. Ran through the slides three times. Did some breathing exercises before bed. Talked to Mom on the phone — she always knows how to calm me down. Early bedtime tonight.",
      mood: "anxious",
      entryDate: daysAgo(20),
      highlight: null,
      gratitude: "Grateful for a mother who always picks up the phone",
      expense: null,
      expenseTitle: null,
      expenseDesc: null,
      expenseType: null,
      tagIds: [aliceTags[0].id],
    },
    {
      title: "Nailed It!",
      content:
        "The presentation went incredibly well! The client loved the proposal and we got the green light for the next phase. My manager gave me a shoutout in the all-hands meeting. Celebrated with the team over drinks. Feeling on top of the world tonight.",
      mood: "happy",
      entryDate: daysAgo(21),
      highlight: "Client approved the proposal and I got a shoutout from my manager",
      gratitude: "Grateful for hard work paying off",
      expense: 38.0,
      expenseTitle: "Celebration drinks",
      expenseDesc: "Drinks with the team at the rooftop bar",
      expenseType: "food",
      tagIds: [aliceTags[0].id],
    },
    {
      title: "Weekend Cooking Spree",
      content:
        "Tried three new recipes today: Thai green curry, homemade naan bread, and chocolate lava cake. The curry was amazing, the naan was a bit dense, and the lava cake... well, it was more of a chocolate puddle cake. But it still tasted great! Shared with neighbors.",
      mood: "creative",
      entryDate: daysAgo(23),
      highlight: "The Thai green curry turned out restaurant-quality",
      gratitude: "Grateful for the joy of cooking and sharing food",
      expense: 42.0,
      expenseTitle: "Groceries",
      expenseDesc: "Ingredients for Thai curry, naan, and chocolate lava cake",
      expenseType: "food",
      tagIds: [aliceTags[7].id, aliceTags[1].id],
    },
    {
      title: "Sad News",
      content:
        "Found out that Mrs. Henderson from next door is moving to a care home. She's been our neighbor for as long as I can remember. Brought her flowers and we sat on her porch talking about the old days for hours. She told me stories about the neighborhood from 50 years ago. I'll miss her.",
      mood: "sad",
      entryDate: daysAgo(25),
      highlight: null,
      gratitude: "Grateful for neighbors who become family",
      expense: 15.0,
      expenseTitle: "Flowers",
      expenseDesc: "Bouquet for Mrs. Henderson",
      expenseType: "expense",
      tagIds: [aliceTags[4].id, aliceTags[1].id],
    },
  ];

  for (const entry of aliceEntries) {
    const { tagIds, ...entryData } = entry;
    const created = await prisma.diaryEntry.create({
      data: {
        ...entryData,
        userId: alice.id,
      },
    });

    if (tagIds.length > 0) {
      await prisma.entryTag.createMany({
        data: tagIds.map((tagId) => ({
          entryId: created.id,
          tagId,
        })),
      });
    }
  }

  console.log(`  Created ${aliceEntries.length} diary entries for Alice.`);

  // ─── Create Diary Entries for Bob (8 entries) ───
  const bobEntries = [
    {
      title: "New Project Kickoff",
      content:
        "Started a new project at work today. The tech stack is exciting — we're using Rust for the backend. Spent most of the day setting up the dev environment and reading through the architecture docs. The team seems sharp. Looking forward to diving in.",
      mood: "productive",
      entryDate: daysAgo(0),
      highlight: "Getting to work with Rust for the first time professionally",
      gratitude: "Grateful for new challenges",
      expense: null,
      expenseTitle: null,
      expenseDesc: null,
      expenseType: null,
      tagIds: [bobTags[0].id, bobTags[5].id],
    },
    {
      title: "Morning Run",
      content:
        "Did a 5K this morning before work. The route along the river was beautiful with the morning mist hovering over the water. Legs felt strong. Thinking about signing up for a half marathon in the spring.",
      mood: "happy",
      entryDate: daysAgo(1),
      highlight: "Ran my fastest 5K time: 24 minutes",
      gratitude: "Grateful for early mornings",
      expense: null,
      expenseTitle: null,
      expenseDesc: null,
      expenseType: null,
      tagIds: [bobTags[3].id],
    },
    {
      title: "Date Night",
      content:
        "Took Lisa to that new sushi place downtown. The omakase was incredible — 12 courses of the freshest fish I've ever tasted. We walked along the waterfront afterwards and talked about our trip plans for next year. Perfect evening.",
      mood: "happy",
      entryDate: daysAgo(3),
      highlight: "Amazing 12-course omakase dinner",
      gratitude: "Grateful for quality time with Lisa",
      expense: 180.0,
      expenseTitle: "Sushi dinner",
      expenseDesc: "Omakase dinner for two at Sushi Zen",
      expenseType: "food",
      tagIds: [bobTags[1].id],
    },
    {
      title: "Debugging Marathon",
      content:
        "Spent 6 hours tracking down a race condition in the message queue. Finally found it — a missing mutex on the shared cache. The fix was two lines of code. Software engineering in a nutshell: hours of investigation, seconds of fixing.",
      mood: "reflective",
      entryDate: daysAgo(5),
      highlight: "Found and fixed the race condition bug",
      gratitude: "Grateful for persistence",
      expense: 15.0,
      expenseTitle: "Energy drinks",
      expenseDesc: "Fuel for the debugging marathon",
      expenseType: "food",
      tagIds: [bobTags[0].id],
    },
    {
      title: "Weekend Hike",
      content:
        "Hiked up to Eagle Peak with the guys. The trail was challenging — 8 miles roundtrip with 2000 feet of elevation gain. The view from the top was breathtaking. We could see all the way to the coast. Grilled steaks at camp afterwards.",
      mood: "excited",
      entryDate: daysAgo(8),
      highlight: "Panoramic view from Eagle Peak summit",
      gratitude: "Grateful for nature and good company",
      expense: 30.0,
      expenseTitle: "Camping supplies",
      expenseDesc: "Steaks, charcoal, and supplies for the grill",
      expenseType: "food",
      tagIds: [bobTags[2].id, bobTags[3].id],
    },
    {
      title: "Book Club",
      content:
        "Had our monthly book club meeting. We discussed 'Project Hail Mary' by Andy Weir. Everyone loved it — the discussion went on for two hours. Next month we're reading 'Klara and the Sun'. I love these evenings.",
      mood: "happy",
      entryDate: daysAgo(12),
      highlight: "Great book discussion that went on for 2 hours",
      gratitude: "Grateful for friends who love reading",
      expense: null,
      expenseTitle: null,
      expenseDesc: null,
      expenseType: null,
      tagIds: [bobTags[1].id, bobTags[5].id],
    },
    {
      title: "Tough Day",
      content:
        "Production went down for 3 hours today. It was my code that caused the issue — a bad database migration. Spent the day firefighting and writing a post-mortem. The team was supportive but I still feel terrible about it. Learning experience, I guess.",
      mood: "stressed",
      entryDate: daysAgo(15),
      highlight: null,
      gratitude: "Grateful for a team that doesn't point fingers",
      expense: null,
      expenseTitle: null,
      expenseDesc: null,
      expenseType: null,
      tagIds: [bobTags[0].id],
    },
    {
      title: "Family Visit",
      content:
        "Parents flew in for the weekend. Showed them around the city — they loved the food market. Dad tried his first boba tea and his reaction was priceless. Mom kept commenting on how 'hip' the neighborhood is. Already planning their next visit.",
      mood: "grateful",
      entryDate: daysAgo(18),
      highlight: "Dad trying boba tea for the first time",
      gratitude: "Grateful that my parents made the trip to visit",
      expense: 95.0,
      expenseTitle: "Family outing",
      expenseDesc: "Food market tour, lunch, and boba tea",
      expenseType: "food",
      tagIds: [bobTags[4].id, bobTags[2].id],
    },
  ];

  for (const entry of bobEntries) {
    const { tagIds, ...entryData } = entry;
    const created = await prisma.diaryEntry.create({
      data: {
        ...entryData,
        userId: bob.id,
      },
    });

    if (tagIds.length > 0) {
      await prisma.entryTag.createMany({
        data: tagIds.map((tagId) => ({
          entryId: created.id,
          tagId,
        })),
      });
    }
  }

  console.log(`  Created ${bobEntries.length} diary entries for Bob.`);

  // ─── Create Habits ───
  const aliceHabits = await Promise.all([
    prisma.habit.create({ data: { userId: alice.id, name: "Morning Run" } }),
    prisma.habit.create({ data: { userId: alice.id, name: "Read 30 Minutes" } }),
    prisma.habit.create({ data: { userId: alice.id, name: "Meditate" } }),
    prisma.habit.create({ data: { userId: alice.id, name: "Drink 8 Glasses of Water" } }),
    prisma.habit.create({ data: { userId: alice.id, name: "No Social Media Before Noon" } }),
  ]);

  const bobHabits = await Promise.all([
    prisma.habit.create({ data: { userId: bob.id, name: "Gym Session" } }),
    prisma.habit.create({ data: { userId: bob.id, name: "Read Before Bed" } }),
    prisma.habit.create({ data: { userId: bob.id, name: "Cook Dinner" } }),
  ]);

  // Log habits for the last 14 days (partial completion)
  for (let i = 0; i < 14; i++) {
    const date = daysAgo(i);
    for (const habit of aliceHabits) {
      // ~70% completion rate
      if (Math.random() < 0.7) {
        await prisma.habitLog.create({
          data: {
            habitId: habit.id,
            logDate: date,
            isCompleted: true,
          },
        });
      }
    }
    for (const habit of bobHabits) {
      // ~60% completion rate
      if (Math.random() < 0.6) {
        await prisma.habitLog.create({
          data: {
            habitId: habit.id,
            logDate: date,
            isCompleted: true,
          },
        });
      }
    }
  }

  console.log(`  Created ${aliceHabits.length + bobHabits.length} habits with logs.`);

  // ─── Create Transactions ───
  const aliceTransactions = [
    { type: "expense", amount: 24.50, title: "Grocery Run", description: "Ingredients for pasta night", category: "Food & Dining", date: daysAgo(0) },
    { type: "expense", amount: 35.00, title: "Lunch with Friends", description: "Burgers at The Local Grill", category: "Food & Dining", date: daysAgo(2) },
    { type: "expense", amount: 12.00, title: "Coffee Beans", description: "Ethiopian single origin", category: "Food & Dining", date: daysAgo(3) },
    { type: "expense", amount: 18.75, title: "Art Supplies", description: "Watercolor paper and brushes", category: "Shopping", date: daysAgo(4) },
    { type: "income", amount: 3200.00, title: "Salary", description: "Monthly paycheck", category: "Salary", date: daysAgo(5) },
    { type: "expense", amount: 45.00, title: "Jazz Show", description: "Tickets at The Blue Note", category: "Entertainment", date: daysAgo(9) },
    { type: "expense", amount: 52.00, title: "Team Dinner", description: "Italian restaurant celebration", category: "Food & Dining", date: daysAgo(7) },
    { type: "expense", amount: 8.50, title: "Coffee Overload", description: "Three lattes", category: "Food & Dining", date: daysAgo(10) },
    { type: "expense", amount: 15.00, title: "Gas", description: "Trip to parents", category: "Transport", date: daysAgo(12) },
    { type: "expense", amount: 120.00, title: "Concert Tickets", description: "Arctic Monkeys", category: "Entertainment", date: daysAgo(19) },
    { type: "expense", amount: 22.00, title: "Cold Medicine", description: "Pharmacy visit", category: "Health", date: daysAgo(16) },
    { type: "expense", amount: 6.50, title: "Pumpkin Spice Latte", description: null, category: "Food & Dining", date: daysAgo(17) },
    { type: "expense", amount: 38.00, title: "Celebration Drinks", description: "Rooftop bar with team", category: "Entertainment", date: daysAgo(21) },
    { type: "expense", amount: 42.00, title: "Cooking Ingredients", description: "Thai curry, naan, lava cake", category: "Food & Dining", date: daysAgo(23) },
    { type: "expense", amount: 15.00, title: "Flowers", description: "For Mrs. Henderson", category: "Gift", date: daysAgo(25) },
    { type: "income", amount: 500.00, title: "Freelance Payment", description: "Logo design project", category: "Freelance", date: daysAgo(14) },
    { type: "expense", amount: 89.00, title: "Gym Membership", description: "Monthly renewal", category: "Health", date: daysAgo(1) },
    { type: "expense", amount: 156.00, title: "Electric Bill", description: "Monthly utility", category: "Bills & Utilities", date: daysAgo(8) },
    { type: "income", amount: 3200.00, title: "Salary", description: "Monthly paycheck", category: "Salary", date: daysAgo(20) },
    { type: "expense", amount: 29.99, title: "Streaming Services", description: "Netflix + Spotify", category: "Entertainment", date: daysAgo(6) },
  ];

  for (const txn of aliceTransactions) {
    await prisma.transaction.create({
      data: {
        userId: alice.id,
        type: txn.type,
        amount: txn.amount,
        title: txn.title,
        description: txn.description,
        category: txn.category,
        date: txn.date,
      },
    });
  }

  const bobTransactions = [
    { type: "income", amount: 4500.00, title: "Salary", description: "Monthly paycheck", category: "Salary", date: daysAgo(1) },
    { type: "expense", amount: 180.00, title: "Sushi Dinner", description: "Omakase for two", category: "Food & Dining", date: daysAgo(3) },
    { type: "expense", amount: 15.00, title: "Energy Drinks", description: "Debugging fuel", category: "Food & Dining", date: daysAgo(5) },
    { type: "expense", amount: 30.00, title: "Camping Supplies", description: "Steaks and charcoal", category: "Food & Dining", date: daysAgo(8) },
    { type: "expense", amount: 95.00, title: "Family Outing", description: "Food market + boba", category: "Food & Dining", date: daysAgo(18) },
    { type: "expense", amount: 65.00, title: "Running Shoes", description: "New pair from Nike", category: "Shopping", date: daysAgo(10) },
    { type: "income", amount: 200.00, title: "Side Project", description: "Plugin sales", category: "Freelance", date: daysAgo(7) },
  ];

  for (const txn of bobTransactions) {
    await prisma.transaction.create({
      data: {
        userId: bob.id,
        type: txn.type,
        amount: txn.amount,
        title: txn.title,
        description: txn.description,
        category: txn.category,
        date: txn.date,
      },
    });
  }

  console.log(`  Created ${aliceTransactions.length + bobTransactions.length} transactions.`);

  // ─── Create Notifications ───
  await prisma.notification.createMany({
    data: [
      {
        userId: alice.id,
        title: "Welcome to LifeLog!",
        message: "Start capturing your journey. Create your first diary entry to get started.",
        type: "info",
        isRead: true,
        createdAt: daysAgo(25),
      },
      {
        userId: alice.id,
        title: "7-Day Streak!",
        message: "You've been journaling for 7 days in a row. Keep up the great work!",
        type: "achievement",
        isRead: true,
        createdAt: daysAgo(18),
      },
      {
        userId: alice.id,
        title: "New Feature: Highlights",
        message: "Check out the new Highlights page to see a visual gallery of your best memories.",
        type: "info",
        isRead: false,
        createdAt: daysAgo(3),
      },
      {
        userId: alice.id,
        title: "Don't forget to journal!",
        message: "You haven't written an entry in a while. Take a moment to reflect on your day.",
        type: "reminder",
        isRead: false,
        createdAt: daysAgo(1),
      },
      {
        userId: alice.id,
        title: "20 Entries Milestone!",
        message: "Congratulations! You've written 20 diary entries. Your memories are safe with LifeLog.",
        type: "achievement",
        isRead: false,
        createdAt: daysAgo(0),
      },
      {
        userId: bob.id,
        title: "Welcome to LifeLog!",
        message: "Start capturing your journey. Create your first diary entry to get started.",
        type: "info",
        isRead: true,
        createdAt: daysAgo(20),
      },
      {
        userId: bob.id,
        title: "Habit Streak: 5 Days",
        message: "You've completed 'Gym Session' for 5 days straight. Great discipline!",
        type: "achievement",
        isRead: false,
        createdAt: daysAgo(2),
      },
    ],
  });

  console.log("  Created 7 notifications.");

  console.log("\n✅ Seed complete!\n");
  console.log("  Login credentials:");
  console.log("  ┌──────────────────────────────────────┐");
  console.log("  │  alice@example.com / password123      │");
  console.log("  │  bob@example.com   / password123      │");
  console.log("  └──────────────────────────────────────┘\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
