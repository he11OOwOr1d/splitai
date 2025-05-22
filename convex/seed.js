// convex/seed.js
import { mutation } from "./_generated/server";


export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const existingExpenses = await ctx.db.query("expenses").collect();
    if (existingExpenses.length > 0) {
      console.log("Database already has expenses. Skipping seed.");
      return {
        skipped: true,
        existingExpenses: existingExpenses.length,
      };
    }

    const users = await ctx.db.query("users").collect();

    if (users.length < 3) {
      console.log(
        "Not enough users in the database. Please ensure you have at least 3 users."
      );
      return {
        skipped: true,
        reason: "Not enough users",
      };
    }

    const groups = await createGroups(ctx, users);

    const oneOnOneExpenses = await createOneOnOneExpenses(ctx, users);

    const groupExpenses = await createGroupExpenses(ctx, users, groups);

    const settlements = await createSettlements(
      ctx,
      users,
      groups,
      oneOnOneExpenses,
      groupExpenses
    );

    return {
      success: true,
      stats: {
        users: users.length,
        groups: groups.length,
        oneOnOneExpenses: oneOnOneExpenses.length,
        groupExpenses: groupExpenses.length,
        settlements: settlements.length,
      },
    };
  },
});

async function createGroups(ctx, users) {
  const now = Date.now();

  const user1 = users[0]; 
  const user2 = users[1]; 
  const user3 = users[2]; 

  const groupDatas = [
    {
      name: "Weekend Trip",
      description: "Expenses for our weekend getaway",
      createdBy: user1._id,
      members: [
        { userId: user1._id, role: "admin", joinedAt: now },
        { userId: user2._id, role: "member", joinedAt: now },
        { userId: user3._id, role: "member", joinedAt: now },
      ],
    },
    {
      name: "Office Expenses",
      description: "Shared expenses for our office",
      createdBy: user2._id,
      members: [
        { userId: user2._id, role: "admin", joinedAt: now },
        { userId: user3._id, role: "member", joinedAt: now },
      ],
    },
    {
      name: "Project Alpha",
      description: "Expenses for our project",
      createdBy: user3._id,
      members: [
        { userId: user3._id, role: "admin", joinedAt: now },
        { userId: user1._id, role: "member", joinedAt: now },
        { userId: user2._id, role: "member", joinedAt: now },
      ],
    },
  ];

  const groupIds = [];
  for (const groupData of groupDatas) {
    const groupId = await ctx.db.insert("groups", groupData);
    groupIds.push(groupId);
  }

  return await Promise.all(
    groupIds.map(async (id) => {
      const group = await ctx.db.get(id);
      return { ...group, _id: id };
    })
  );
}

async function createOneOnOneExpenses(ctx, users) {
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const user1 = users[0];
  const user2 = users[1];
  const user3 = users[2];

  const expenseDatas = [
    {
      description: "Dinner at Indian Restaurant",
      amount: 1250.0,
      category: "foodDrink",
      date: twoWeeksAgo,
      paidByUserId: user1._id,
      splitType: "equal",
      splits: [
        { userId: user1._id, amount: 625.0, paid: true },
        { userId: user2._id, amount: 625.0, paid: false },
      ],
      createdBy: user1._id,
    },
    {
      description: "Cab ride to airport",
      amount: 450.0,
      category: "transportation", 
      date: oneWeekAgo,
      paidByUserId: user2._id,
      splitType: "equal",
      splits: [
        { userId: user1._id, amount: 225.0, paid: false },
        { userId: user2._id, amount: 225.0, paid: true },
      ],
      createdBy: user2._id,
    },
    {
      description: "Movie tickets",
      amount: 500.0,
      category: "entertainment",
      date: oneWeekAgo + 2 * 24 * 60 * 60 * 1000,
      paidByUserId: user3._id,
      splitType: "equal",
      splits: [
        { userId: user2._id, amount: 250.0, paid: false },
        { userId: user3._id, amount: 250.0, paid: true },
      ],
      createdBy: user3._id,
    },
    {
      description: "Groceries",
      amount: 1875.5,
      category: "groceries",
      date: oneMonthAgo,
      paidByUserId: user1._id,
      splitType: "percentage",
      splits: [
        { userId: user1._id, amount: 1312.85, paid: true },
        { userId: user3._id, amount: 562.65, paid: false },
      ],
      createdBy: user1._id,
    },
    {
      description: "Internet bill",
      amount: 1200.0,
      category: "utilities",
      date: now - 3 * 24 * 60 * 60 * 1000,
      paidByUserId: user2._id,
      splitType: "equal",
      splits: [
        { userId: user2._id, amount: 600.0, paid: true },
        { userId: user3._id, amount: 600.0, paid: false },
      ],
      createdBy: user2._id,
    },
  ];

  const expenseIds = [];
  for (const expenseData of expenseDatas) {
    const expenseId = await ctx.db.insert("expenses", expenseData);
    expenseIds.push(expenseId);
  }

  return await Promise.all(
    expenseIds.map(async (id) => {
      const expense = await ctx.db.get(id);
      return { ...expense, _id: id };
    })
  );
}

async function createGroupExpenses(ctx, users, groups) {
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

  const user1 = users[0];
  const user2 = users[1];
  const user3 = users[2];

  const weekendTripExpenses = [
    {
      description: "Hotel reservation",
      amount: 9500.0,
      category: "housing",
      date: twoWeeksAgo,
      paidByUserId: user1._id,
      splitType: "equal",
      splits: [
        { userId: user1._id, amount: 3166.67, paid: true },
        { userId: user2._id, amount: 3166.67, paid: false },
        { userId: user3._id, amount: 3166.66, paid: false },
      ],
      groupId: groups[0]._id,
      createdBy: user1._id,
    },
    {
      description: "Groceries for weekend",
      amount: 2450.75,
      category: "groceries",
      date: twoWeeksAgo + 1 * 24 * 60 * 60 * 1000,
      paidByUserId: user2._id,
      splitType: "equal",
      splits: [
        { userId: user1._id, amount: 816.92, paid: false },
        { userId: user2._id, amount: 816.92, paid: true },
        { userId: user3._id, amount: 816.91, paid: false },
      ],
      groupId: groups[0]._id,
      createdBy: user2._id,
    },
    {
      description: "Sight-seeing tour",
      amount: 4500.0,
      category: "entertainment",
      date: twoWeeksAgo + 2 * 24 * 60 * 60 * 1000,
      paidByUserId: user3._id,
      splitType: "equal",
      splits: [
        { userId: user1._id, amount: 1500.0, paid: false },
        { userId: user2._id, amount: 1500.0, paid: false },
        { userId: user3._id, amount: 1500.0, paid: true },
      ],
      groupId: groups[0]._id,
      createdBy: user3._id,
    },
  ];

  const officeExpenses = [
    {
      description: "Coffee and snacks",
      amount: 850.0,
      category: "coffee",
      date: oneWeekAgo,
      paidByUserId: user2._id,
      splitType: "equal",
      splits: [
        { userId: user2._id, amount: 425.0, paid: true },
        { userId: user3._id, amount: 425.0, paid: false },
      ],
      groupId: groups[1]._id,
      createdBy: user2._id,
    },
    {
      description: "Office supplies",
      amount: 1250.4,
      category: "shopping",
      date: oneWeekAgo + 2 * 24 * 60 * 60 * 1000,
      paidByUserId: user3._id,
      splitType: "equal",
      splits: [
        { userId: user2._id, amount: 625.2, paid: false },
        { userId: user3._id, amount: 625.2, paid: true },
      ],
      groupId: groups[1]._id,
      createdBy: user3._id,
    },
  ];

  const projectExpenses = [
    {
      description: "Domain purchase",
      amount: 1200.0,
      category: "technology",
      date: now - 5 * 24 * 60 * 60 * 1000,
      paidByUserId: user3._id,
      splitType: "equal",
      splits: [
        { userId: user1._id, amount: 400.0, paid: false },
        { userId: user2._id, amount: 400.0, paid: false },
        { userId: user3._id, amount: 400.0, paid: true },
      ],
      groupId: groups[2]._id,
      createdBy: user3._id,
    },
    {
      description: "Server hosting",
      amount: 3600.0,
      category: "bills",
      date: now - 4 * 24 * 60 * 60 * 1000,
      paidByUserId: user1._id,
      splitType: "equal",
      splits: [
        { userId: user1._id, amount: 1200.0, paid: true },
        { userId: user2._id, amount: 1200.0, paid: false },
        { userId: user3._id, amount: 1200.0, paid: false },
      ],
      groupId: groups[2]._id,
      createdBy: user1._id,
    },
    {
      description: "Project dinner",
      amount: 4800.6,
      category: "foodDrink",
      date: now - 2 * 24 * 60 * 60 * 1000,
      paidByUserId: user2._id,
      splitType: "percentage",
      splits: [
        { userId: user1._id, amount: 1600.2, paid: false },
        { userId: user2._id, amount: 1600.2, paid: true },
        { userId: user3._id, amount: 1600.2, paid: false },
      ],
      groupId: groups[2]._id,
      createdBy: user2._id,
    },
  ];

  const allGroupExpenses = [
    ...weekendTripExpenses,
    ...officeExpenses,
    ...projectExpenses,
  ];

  const expenseIds = [];
  for (const expenseData of allGroupExpenses) {
    const expenseId = await ctx.db.insert("expenses", expenseData);
    expenseIds.push(expenseId);
  }

  return await Promise.all(
    expenseIds.map(async (id) => {
      const expense = await ctx.db.get(id);
      return { ...expense, _id: id };
    })
  );
}

async function createSettlements(
  ctx,
  users,
  groups,
  oneOnOneExpenses,
  groupExpenses
) {
  const now = Date.now();
  const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
  const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;

  const user1 = users[0];
  const user2 = users[1];
  const user3 = users[2];

  const cabExpense = oneOnOneExpenses.find(
    (expense) => expense.description === "Cab ride to airport"
  );

  const hotelExpense = groupExpenses.find(
    (expense) => expense.description === "Hotel reservation"
  );

  const coffeeExpense = groupExpenses.find(
    (expense) => expense.description === "Coffee and snacks"
  );

  const settlementDatas = [
    {
      amount: 225.0,
      note: "For cab ride",
      date: fiveDaysAgo,
      paidByUserId: user1._id,
      receivedByUserId: user2._id,
      relatedExpenseIds: cabExpense ? [cabExpense._id] : undefined,
      createdBy: user1._id,
    },
    {
      amount: 3166.67,
      note: "Hotel payment",
      date: threeDaysAgo,
      paidByUserId: user2._id,
      receivedByUserId: user1._id,
      groupId: groups[0]._id,
      relatedExpenseIds: hotelExpense ? [hotelExpense._id] : undefined,
      createdBy: user2._id,
    },
    {
      amount: 425.0,
      note: "Office coffee",
      date: now - 1 * 24 * 60 * 60 * 1000,
      paidByUserId: user3._id,
      receivedByUserId: user2._id,
      groupId: groups[1]._id,
      relatedExpenseIds: coffeeExpense ? [coffeeExpense._id] : undefined,
      createdBy: user3._id,
    },
  ];

  const settlementIds = [];
  for (const settlementData of settlementDatas) {
    const settlementId = await ctx.db.insert("settlements", settlementData);
    settlementIds.push(settlementId);
  }

  return await Promise.all(
    settlementIds.map(async (id) => {
      const settlement = await ctx.db.get(id);
      return { ...settlement, _id: id };
    })
  );
}