"use client"

// MOCK DATA: replace with transaction rows from the database later.
const transactions = [
    {
        id: 1,
        title: "Freelance project",
        category: "Income",
        amount: 18500,
        type: "income",
        date: "Jun 17",
        icon: "work",
    },
    {
        id: 2,
        title: "Groceries",
        category: "Food",
        amount: 1450,
        type: "expense",
        date: "Jun 16",
        icon: "shopping_bag",
    },
    {
        id: 3,
        title: "Electric bill",
        category: "Utilities",
        amount: 2350,
        type: "expense",
        date: "Jun 15",
        icon: "bolt",
    },
    {
        id: 4,
        title: "Part-time payout",
        category: "Income",
        amount: 6200,
        type: "income",
        date: "Jun 14",
        icon: "payments",
    },
];

// MOCK DATA: replace with an aggregate query grouped by expense category.
const expenseCategories = [
    { label: "Food", amount: 8450, color: "bg-[#F87171]" },
    { label: "Transport", amount: 3200, color: "bg-[#60A5FA]" },
    { label: "Bills", amount: 5200, color: "bg-[#FBBF24]" },
    { label: "Shopping", amount: 4100, color: "bg-[#A78BFA]" },
];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "THB",
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function Earns(){
    // MOCK DATA: replace these summary values with monthly income/expense aggregates.
    const totalIncome = 46200;
    const totalExpense = 21150;
    const balance = totalIncome - totalExpense;

    // MOCK DATA: replace with the user's saving goal and current saved amount.
    const savingGoal = 50000;
    const savedAmount = 32500;
    const savingProgress = Math.round((savedAmount / savingGoal) * 100);

    return(
        <main className="min-h-screen w-[calc(100vw-240px)] bg-[var(--color1)] px-6 py-6 text-[var(--font)]">
            <div className="flex flex-col gap-6">
                <section className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-[34px] font-bold">Earns</h1>
                        <p className="mt-1 text-[15px] font-bold text-[var(--color3)]/70">
                            รายรับ รายจ่าย และเป้าหมายเงินเก็บ
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border border-[var(--color3)]/15 bg-[var(--color2)] px-4 py-3 text-[14px] font-bold text-[var(--color3)]">
                        <span className="material-symbols-outlined !text-[22px] text-[var(--color4)]">calendar_month</span>
                        June 2026
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-emerald-300/15 bg-[var(--color2)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
                            <div className="flex items-center justify-between">
                                <div className="text-[14px] font-bold text-[var(--color3)]/75">Income</div>
                                <span className="material-symbols-outlined rounded-xl bg-emerald-400/12 p-2 !text-[22px] text-emerald-300">trending_up</span>
                            </div>
                            <div className="mt-5 text-[28px] font-bold text-emerald-300">{formatCurrency(totalIncome)}</div>
                            <div className="mt-2 text-[13px] font-bold text-emerald-200/65">+12% from last month</div>
                        </div>

                        <div className="rounded-2xl border border-red-300/15 bg-[var(--color2)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
                            <div className="flex items-center justify-between">
                                <div className="text-[14px] font-bold text-[var(--color3)]/75">Expense</div>
                                <span className="material-symbols-outlined rounded-xl bg-red-400/12 p-2 !text-[22px] text-red-300">trending_down</span>
                            </div>
                            <div className="mt-5 text-[28px] font-bold text-red-300">{formatCurrency(totalExpense)}</div>
                            <div className="mt-2 text-[13px] font-bold text-red-200/65">Daily avg. {formatCurrency(705)}</div>
                        </div>

                        <div className="rounded-2xl border border-[var(--color4)]/20 bg-[var(--color2)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
                            <div className="flex items-center justify-between">
                                <div className="text-[14px] font-bold text-[var(--color3)]/75">Balance</div>
                                <span className="material-symbols-outlined rounded-xl bg-[var(--color4)]/12 p-2 !text-[22px] text-[var(--color4)]">account_balance_wallet</span>
                            </div>
                            <div className="mt-5 text-[28px] font-bold text-[var(--font)]">{formatCurrency(balance)}</div>
                            <div className="mt-2 text-[13px] font-bold text-[var(--color3)]/60">Available this month</div>
                        </div>
                    </div>

                    <div className="row-span-2 rounded-2xl border border-[var(--color3)]/15 bg-[var(--color2)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-[18px] font-bold">Saving Goal</div>
                                <div className="mt-1 text-[13px] font-bold text-[var(--color3)]/65">Emergency fund</div>
                            </div>
                            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color3)]/15 text-[var(--color3)] transition hover:border-[var(--color4)] hover:text-[var(--color4)]">
                                <span className="material-symbols-outlined !text-[22px]">edit</span>
                            </button>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <div
                                className="grid h-[210px] w-[210px] place-items-center rounded-full"
                                style={{
                                    background: `conic-gradient(var(--color4) ${savingProgress * 3.6}deg, rgba(217,217,217,0.12) 0deg)`,
                                }}
                            >
                                <div className="grid h-[156px] w-[156px] place-items-center rounded-full bg-[var(--color2)] shadow-[inset_0_0_22px_rgba(0,0,0,0.35)]">
                                    <div className="text-center">
                                        <div className="text-[40px] font-bold text-[var(--font)]">{savingProgress}%</div>
                                        <div className="text-[13px] font-bold text-[var(--color3)]/65">saved</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-[var(--color3)]/10 bg-[var(--color1)] p-3">
                                <div className="text-[12px] font-bold text-[var(--color3)]/60">Saved</div>
                                <div className="mt-1 text-[17px] font-bold text-[var(--font)]">{formatCurrency(savedAmount)}</div>
                            </div>
                            <div className="rounded-xl border border-[var(--color3)]/10 bg-[var(--color1)] p-3">
                                <div className="text-[12px] font-bold text-[var(--color3)]/60">Goal</div>
                                <div className="mt-1 text-[17px] font-bold text-[var(--font)]">{formatCurrency(savingGoal)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
                        <section className="rounded-2xl border border-[var(--color3)]/15 bg-[var(--color2)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[18px] font-bold">New Record</h2>
                                <div className="flex rounded-xl border border-[var(--color3)]/15 bg-[var(--color1)] p-1">
                                    <button className="rounded-lg bg-emerald-400/15 px-3 py-1 text-[13px] font-bold text-emerald-300">Income</button>
                                    <button className="rounded-lg px-3 py-1 text-[13px] font-bold text-[var(--color3)]">Expense</button>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                <label className="block">
                                    <span className="text-[12px] font-bold text-[var(--color3)]/65">Title</span>
                                    <input className="mt-2 h-11 w-full rounded-xl border border-[var(--color3)]/15 bg-[var(--color1)] px-4 text-[14px] font-bold text-[var(--font)] outline-none transition placeholder:text-[var(--color3)]/35 focus:border-[var(--color4)]" placeholder="Salary, coffee, rent" />
                                </label>
                                <label className="block">
                                    <span className="text-[12px] font-bold text-[var(--color3)]/65">Amount</span>
                                    <input className="mt-2 h-11 w-full rounded-xl border border-[var(--color3)]/15 bg-[var(--color1)] px-4 text-[14px] font-bold text-[var(--font)] outline-none transition placeholder:text-[var(--color3)]/35 focus:border-[var(--color4)]" placeholder="0.00" />
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block">
                                        <span className="text-[12px] font-bold text-[var(--color3)]/65">Category</span>
                                        <button className="mt-2 flex h-11 w-full items-center justify-between rounded-xl border border-[var(--color3)]/15 bg-[var(--color1)] px-4 text-[14px] font-bold text-[var(--font)]">
                                            Food
                                            <span className="material-symbols-outlined !text-[20px] text-[var(--color3)]">expand_more</span>
                                        </button>
                                    </label>
                                    <label className="block">
                                        <span className="text-[12px] font-bold text-[var(--color3)]/65">Date</span>
                                        <button className="mt-2 flex h-11 w-full items-center justify-between rounded-xl border border-[var(--color3)]/15 bg-[var(--color1)] px-4 text-[14px] font-bold text-[var(--font)]">
                                            Today
                                            <span className="material-symbols-outlined !text-[20px] text-[var(--color3)]">event</span>
                                        </button>
                                    </label>
                                </div>
                                <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color4)] text-[15px] font-bold text-[var(--font)] shadow-[0_10px_24px_rgba(0,173,181,0.22)] transition hover:brightness-110">
                                    <span className="material-symbols-outlined !text-[21px]">add</span>
                                    Add Record
                                </button>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-[var(--color3)]/15 bg-[var(--color2)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[18px] font-bold">Recent Transactions</h2>
                                <button className="flex items-center gap-1 text-[13px] font-bold text-[var(--color4)]">
                                    View all
                                    <span className="material-symbols-outlined !text-[18px]">arrow_forward</span>
                                </button>
                            </div>

                            <div className="mt-4 space-y-3">
                                {transactions.map((transaction) => {
                                    const isIncome = transaction.type === "income";

                                    return(
                                        <div key={transaction.id} className="flex items-center gap-3 rounded-xl border border-[var(--color3)]/10 bg-[var(--color1)] p-3">
                                            <div className={`grid h-11 w-11 place-items-center rounded-xl ${isIncome ? "bg-emerald-400/12 text-emerald-300" : "bg-red-400/12 text-red-300"}`}>
                                                <span className="material-symbols-outlined !text-[23px]">{transaction.icon}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[15px] font-bold">{transaction.title}</div>
                                                <div className="mt-1 text-[12px] font-bold text-[var(--color3)]/55">{transaction.category} • {transaction.date}</div>
                                            </div>
                                            <div className={`text-right text-[15px] font-bold ${isIncome ? "text-emerald-300" : "text-red-300"}`}>
                                                {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </section>

                <section className="rounded-2xl border border-[var(--color3)]/15 bg-[var(--color2)] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-[18px] font-bold">Expense Breakdown</h2>
                        <div className="text-[13px] font-bold text-[var(--color3)]/60">This month</div>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-4">
                        {expenseCategories.map((category) => (
                            <div key={category.label} className="rounded-xl border border-[var(--color3)]/10 bg-[var(--color1)] p-4">
                                <div className="flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${category.color}`} />
                                    <div className="text-[14px] font-bold text-[var(--color3)]">{category.label}</div>
                                </div>
                                <div className="mt-3 text-[20px] font-bold text-[var(--font)]">{formatCurrency(category.amount)}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
