const build = "Build my business → Chat";
const run = "Run my business → Chat";
// Presentation prompts suggest conversations; they do not run actions or promise outcomes.
export const inspirationPrompts = [
  [
    "FIND YOUR DIRECTION",
    "Help me explore a business idea around my skills and budget.",
    "Start with what you know. Explore what it could become.",
    build,
  ],
  [
    "SOLVE SOMETHING REAL",
    "Help me get clear on the problem my business could solve.",
    "A useful business often starts with one real problem.",
    build,
  ],
  [
    "CHOOSE A STARTING POINT",
    "Help me compare two business ideas and choose one to test.",
    "You can explore possibilities without committing to everything.",
    build,
  ],
  [
    "MAKE IT SIMPLE",
    "Help me explain my business idea in one clear sentence.",
    "Clarity is a good place to begin.",
    build,
  ],
  [
    "START AT YOUR PACE",
    "How could I explore my idea alongside my current job?",
    "A small start can still be a meaningful start.",
    build,
  ],
  [
    "BUILD ON YOUR STRENGTHS",
    "Help me identify skills I could turn into a useful service.",
    "There may be more value in your experience than you realise.",
    build,
  ],
  [
    "SHAPE YOUR FIRST OFFER",
    "Help me turn my idea into one simple service I could offer.",
    "You don’t have to launch everything at once.",
    build,
  ],
  [
    "TAKE A MEASURED STEP",
    "Help me think of a low-cost way to test my business idea.",
    "Learn a little before you risk a lot.",
    build,
  ],
  [
    "MAKE IT YOURS",
    "Help me work out what I want this business to make possible.",
    "Your definition of progress matters.",
    build,
  ],
  [
    "BEGIN WHERE YOU ARE",
    "What could I do with the resources I already have?",
    "The first step might be closer than you think.",
    build,
  ],
  [
    "MEET YOUR FIRST CUSTOMERS",
    "Help me think through who my first customers could be.",
    "Get a clearer picture of the people you want to help.",
    build,
  ],
  [
    "ASK BETTER QUESTIONS",
    "What could I ask potential customers before I launch?",
    "A useful conversation can sharpen an idea.",
    build,
  ],
  [
    "FIND YOUR PEOPLE",
    "Help me explore where potential customers might look for my service.",
    "Start by understanding where people already turn for help.",
    build,
  ],
  [
    "TEST SOMETHING SMALL",
    "Help me plan a small pilot of my business idea.",
    "You can learn from a small, carefully chosen experiment.",
    build,
  ],
  [
    "LOOK FOR REAL SIGNALS",
    "What signs of customer interest should I look for?",
    "Curiosity is useful. Evidence gives it direction.",
    build,
  ],
  [
    "CHECK YOUR ASSUMPTIONS",
    "Help me spot the assumptions I’m making about my customers.",
    "A better question can lead to a better next step.",
    build,
  ],
  [
    "START A CONVERSATION",
    "Help me draft a friendly message to a potential first customer.",
    "You can begin with a conversation, not a hard sell.",
    build,
  ],
  [
    "FIND YOUR DIFFERENCE",
    "Help me explain what could make my service different.",
    "You don’t need to be everything to everyone.",
    build,
  ],
  [
    "LET GOOD WORK TRAVEL",
    "Help me write a thoughtful request for a customer referral.",
    "A clear, personal message can make asking easier.",
    build,
  ],
  [
    "SET A CLEAR SCOPE",
    "Help me explain what is and isn’t included in my service.",
    "Clear expectations are a good foundation.",
    build,
  ],
  [
    "MAKE THE NEXT STEP SMALLER",
    "What could I do this week to test my business idea?",
    "A useful next step is worth more than a perfect plan.",
    build,
  ],
  [
    "GIVE YOUR IDEA A MONTH",
    "Help me sketch a practical first-month plan.",
    "A little structure can turn an idea into action.",
    build,
  ],
  [
    "WORK WITH YOUR TIME",
    "I have five hours a week. Help me choose a realistic first step.",
    "Build a plan around the time you actually have.",
    build,
  ],
  [
    "CHOOSE WHAT MATTERS",
    "Help me prioritise the tasks on my business to-do list.",
    "You don’t have to do it all today.",
    build,
  ],
  [
    "NOTICE YOUR PROGRESS",
    "Help me choose a small milestone for my business idea.",
    "Make progress something you can recognise.",
    build,
  ],
  [
    "PLAN AROUND THE OBSTACLE",
    "Help me break down the part of starting that feels hardest.",
    "Something that feels big can often become a few smaller steps.",
    build,
  ],
  [
    "MAKE A THOUGHTFUL START",
    "Help me list the startup costs I should research.",
    "Getting clearer on costs is part of building confidence.",
    build,
  ],
  [
    "KEEP THE START SIMPLE",
    "Help me separate launch essentials from things that can wait.",
    "Give your first step some breathing room.",
    build,
  ],
  [
    "LOOK BEYOND DAY ONE",
    "What ongoing business costs should I think about?",
    "A practical plan looks beyond the launch.",
    build,
  ],
  [
    "KNOW WHAT TO CHECK",
    "Help me list the rules and requirements I should research for my idea.",
    "Find the questions, then check the official guidance.",
    build,
  ],
  [
    "UNDERSTAND YOUR COSTS",
    "Help me think through the costs behind one service or job.",
    "A price starts with understanding the work.",
    build,
  ],
  [
    "MAKE YOUR OFFER CLEAR",
    "Help me compare a simple service with a larger package.",
    "Keep the choices understandable for you and your customers.",
    build,
  ],
  [
    "QUESTION THE ESTIMATE",
    "What might I be overlooking in my pricing assumptions?",
    "A second look can make your thinking stronger.",
    build,
  ],
  [
    "LEARN ABOUT YOUR PRICE",
    "How could I explore whether my starting price makes sense to customers?",
    "Treat early pricing as something to research, not guess.",
    build,
  ],
  [
    "SEE THE BIGGER PICTURE",
    "Help me understand the difference between revenue, costs and profit.",
    "Getting comfortable with the basics is a useful step.",
    build,
  ],
  [
    "FIND THE RIGHT WORDS",
    "Help me write a clear introduction to my new business.",
    "You don’t need complicated language to explain useful work.",
    build,
  ],
  [
    "MAKE YOUR MESSAGE CLEAR",
    "Help me describe the benefit of my service to a customer.",
    "Lead with the difference your work could make.",
    build,
  ],
  [
    "SHARE YOUR FIRST UPDATE",
    "Help me draft a short post introducing my business idea.",
    "Your first message can be simple and honest.",
    build,
  ],
  [
    "TELL YOUR STORY",
    "Help me explain why I want to start this business.",
    "The person behind the business is part of the story.",
    build,
  ],
  [
    "SHOW WHAT YOU CAN DO",
    "Help me plan a small portfolio of work I can genuinely demonstrate.",
    "Start with real examples, even if your collection is small.",
    build,
  ],
  [
    "GET THE WORK MOVING",
    "Help me put together an invoice draft for my latest job.",
    "Work through the details, then review before you save.",
    run,
  ],
  [
    "TURN NOTES INTO A DRAFT",
    "Help me organise my job notes into an invoice draft.",
    "Bring the details together while they’re still fresh.",
    run,
  ],
  [
    "CHECK THE DETAILS",
    "Help me check what information is missing from this invoice draft.",
    "A little care now can mean fewer loose ends later.",
    run,
  ],
  [
    "MAKE IT EASY TO UNDERSTAND",
    "Help me make the description on my invoice clearer.",
    "Clear wording helps customers understand the work.",
    run,
  ],
  [
    "TAKE THE NEXT PRACTICAL STEP",
    "Help me think through what to include in a customer follow-up.",
    "Keep the message useful, clear and personal.",
    run,
  ],
  [
    "GET A CLEARER DAY",
    "Help me turn these business notes into a short list of next steps.",
    "Give your thoughts a little structure.",
    run,
  ],
  [
    "KEEP YOUR CUSTOMER IN MIND",
    "Help me write a clear summary of the work a customer needs.",
    "Start with a shared understanding of the job.",
    run,
  ],
  [
    "MAKE SPACE TO REFLECT",
    "Help me review what went well in my business this week.",
    "Notice what is working, as well as what needs attention.",
    build,
  ],
  [
    "BUILD ON WHAT YOU LEARN",
    "Help me turn customer feedback into a practical improvement.",
    "Every useful insight can shape your next step.",
    build,
  ],
  [
    "KEEP YOUR AMBITION MOVING",
    "Help me choose one meaningful thing to work on next.",
    "One idea. One next step. Your pace.",
    build,
  ],
].map(([category, prompt, detail, location]) => ({
  category,
  prompt: "“" + prompt + "”",
  detail,
  location,
}));

export function createPromptSequence(length, random = Math.random) {
  let remaining = [],
    previous = -1;
  return {
    next() {
      if (!remaining.length) {
        remaining = Array.from({ length }, (_, index) => index);
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        if (length > 1 && remaining.at(-1) === previous)
          [remaining[0], remaining[length - 1]] = [
            remaining[length - 1],
            remaining[0],
          ];
      }
      previous = remaining.pop();
      return previous;
    },
  };
}
