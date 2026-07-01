import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserAccounts, getUserCategories } from "@/lib/flowise/queries";
import { syncAccountBalance } from "@/lib/flowise/balance";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const DEFAULT_MODEL_CHAIN = [
  "google:gemini-2.5-flash",
  "google:gemini-3.5-flash",
  "google:gemini-2.5-flash-lite",
  "groq:openai/gpt-oss-120b",
  "groq:llama-3.1-8b-instant",
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    messages: { role: "user" | "assistant"; content: string }[];
    localDate?: string;
    timezone?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, localDate = new Date().toISOString().slice(0, 10), timezone = "UTC" } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  // Fetch context (accounts and categories) to inject into the system prompt
  const [accounts, categories] = await Promise.all([
    getUserAccounts(),
    getUserCategories(),
  ]);

  const accountsCtx = accounts.length > 0
    ? accounts.map((a) => `- ${a.name} (ID: ${a.id}, Type: ${a.type}, Currency: ${a.currency}, Balance: ${a.current_balance})`).join("\n")
    : "No accounts created yet. Tell the user they need to add an account first.";

  const categoriesCtx = categories.map((c) => `- ${c.name} (ID: ${c.id}, Icon: ${c.icon})`).join("\n");

  const systemPrompt = `You are Flowy, the friendly and extremely smart AI Voice & Chat Assistant for Flowise, a personal finance management app.
Your goal is to help the user manage their money effortlessly using voice or text commands.

Current Local Date: ${localDate}
User Timezone: ${timezone}

Here are the user's active financial accounts:
${accountsCtx}

Here are the available transaction categories:
${categoriesCtx}

Instructions for logging actions:
1. ADD_TRANSACTION: If the user says they spent money or received money (e.g. "I spent 5000 naira for lunch", "Received 150k salary", "Spent 1000 on fuel"):
   - Extract "amount" (number): Expenses MUST be negative. Income MUST be positive.
   - Extract "description" (string): e.g., "Lunch at restaurant", "Fuel", "Monthly Salary".
   - Extract "date" (string): YYYY-MM-DD format. Default to current local date (${localDate}) unless they specify otherwise (e.g. "yesterday", "last Friday").
   - Match to the most relevant "account_id" from their active accounts. If they don't specify, use their cash or main bank account, or the first account available. If no accounts exist, return NONE.
   - Match to the most relevant "category_id" from the categories list. (e.g., "lunch" -> "food_dining", "fuel" -> "transport", "salary" -> "salary").
2. SET_BUDGET: If they want to set a spending limit (e.g. "limit dining to 30000 this month"):
   - Extract "category_id", "amount", and "month" (YYYY-MM, default to current month).
3. CREATE_GOAL: If they want to save money (e.g. "Save 500k for holiday by December"):
   - Extract "name", "target_amount", and "deadline" (YYYY-MM-DD).

You must respond in valid JSON format. Your output will be parsed directly.
JSON Response Schema:
{
  "reply": "A friendly conversational confirmation of the action you took or the answer to their query (e.g. 'I've logged a ₦5,000 food expense from your Cash wallet.'). Keep it brief and friendly.",
  "action": {
    "type": "ADD_TRANSACTION" | "SET_BUDGET" | "CREATE_GOAL" | "NONE",
    "data": {
      // for ADD_TRANSACTION:
      "account_id": "uuid",
      "amount": number, // negative for expense, positive for income
      "category_id": "string",
      "date": "YYYY-MM-DD",
      "description": "string"
      
      // for SET_BUDGET:
      // "category_id": "string", "amount": number, "month": "YYYY-MM"
      
      // for CREATE_GOAL:
      // "name": "string", "target_amount": number, "deadline": "YYYY-MM-DD"
    }
  }
}`;

  // Execute LLM Fallback chain
  let rawResponse = "";
  let successModel = "";

  for (const modelStr of DEFAULT_MODEL_CHAIN) {
    try {
      const [provider, modelName] = modelStr.split(":");
      if (provider === "google") {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) continue;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
        });

        const chat = model.startChat({
          history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I will act as Flowy and output only JSON matching the schema." }] },
            ...messages.slice(0, -1).map((m) => ({
              role: m.role === "user" ? "user" : "model",
              parts: [{ text: m.content }],
            })),
          ],
        });

        const lastMsg = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMsg);
        rawResponse = result.response.text().trim();
        successModel = modelStr;
        break;
      } else if (provider === "groq") {
        if (!process.env.GROQ_API_KEY) continue;
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });

        rawResponse = completion.choices[0]?.message?.content?.trim() ?? "";
        successModel = modelStr;
        break;
      }
    } catch (err) {
      console.warn(`[flowise/assistant] model ${modelStr} failed:`, err);
    }
  }

  if (!rawResponse) {
    return NextResponse.json({
      reply: "I'm having trouble connecting to my AI brain right now. Please verify your API key configurations in the settings.",
      actionExecuted: "NONE",
      refreshRequired: false,
    });
  }

  try {
    const clean = rawResponse.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
    const result = JSON.parse(clean) as {
      reply: string;
      action?: {
        type: "ADD_TRANSACTION" | "SET_BUDGET" | "CREATE_GOAL" | "NONE";
        data: any;
      };
    };

    let refreshRequired = false;
    let actionExecuted = "NONE";

    if (result.action && result.action.type !== "NONE" && result.action.data) {
      const { type, data } = result.action;

      if (type === "ADD_TRANSACTION") {
        const { account_id, amount, category_id, date, description } = data;
        
        // Verify account ownership
        const { data: account } = await supabase
          .from("fw_accounts")
          .select("id")
          .eq("id", account_id)
          .eq("user_id", user.id)
          .single();

        if (account) {
          const { error: txErr } = await supabase
            .from("fw_transactions")
            .insert({
              user_id: user.id,
              account_id,
              amount,
              category_id: category_id || null,
              date,
              description: description || "Voice transaction",
              source: "ai_scan",
            });

          if (!txErr) {
            await syncAccountBalance(supabase, account_id, user.id);
            actionExecuted = "ADD_TRANSACTION";
            refreshRequired = true;
          } else {
            console.error("[flowise/assistant] insert transaction error:", txErr);
          }
        }
      } else if (type === "SET_BUDGET") {
        const { category_id, amount, month } = data;
        const { error: budgetErr } = await supabase
          .from("fw_budgets")
          .upsert(
            { user_id: user.id, category_id, amount, month, rollover_enabled: false },
            { onConflict: "user_id,category_id,month" }
          );

        if (!budgetErr) {
          actionExecuted = "SET_BUDGET";
          refreshRequired = true;
        } else {
          console.error("[flowise/assistant] upsert budget error:", budgetErr);
        }
      } else if (type === "CREATE_GOAL") {
        const { name, target_amount, deadline } = data;
        const { error: goalErr } = await supabase
          .from("fw_goals")
          .insert({
            user_id: user.id,
            name,
            target_amount,
            current_amount: 0,
            deadline: deadline || null,
            is_completed: false,
            color: "#16A34A",
            icon: "🎯",
          });

        if (!goalErr) {
          actionExecuted = "CREATE_GOAL";
          refreshRequired = true;
        } else {
          console.error("[flowise/assistant] create goal error:", goalErr);
        }
      }
    }

    return NextResponse.json({
      reply: result.reply,
      actionExecuted,
      refreshRequired,
      modelUsed: successModel,
    });

  } catch (err) {
    console.error("[flowise/assistant] parse or execute error:", err, "rawResponse:", rawResponse);
    return NextResponse.json({
      reply: "I processed your request, but had difficulty formatting the action. Could you try again?",
      actionExecuted: "NONE",
      refreshRequired: false,
    });
  }
}
