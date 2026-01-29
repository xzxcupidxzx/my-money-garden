import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEEPSEEK_ENDPOINT = "https://deepseek.hoangthaison2812.workers.dev";

interface ParseNoteRequest {
  text: string;
  incomeCategories: string[];
  expenseCategories: string[];
  accounts: string[];
}

interface DeepSeekTransaction {
  type: 'Thu' | 'Chi' | 'Transfer';
  amount: number;
  category: string;
  account: string;
  description: string;
  datetime?: string;
  toAccount?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.error('Auth error:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.user.id;
    console.log(`Processing note for user: ${userId}`);

    // Parse request body
    const body: ParseNoteRequest = await req.json();
    const { text, incomeCategories, expenseCategories, accounts } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Calling DeepSeek API with text: ${text.substring(0, 100)}...`);

    // Call DeepSeek Cloudflare Worker
    const deepseekPayload = {
      userInput: text,
      incomeCategories: incomeCategories || [],
      expenseCategories: expenseCategories || [],
      accounts: accounts || [],
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

    let deepseekResponse: Response;
    try {
      deepseekResponse = await fetch(DEEPSEEK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deepseekPayload),
        signal: controller.signal,
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('DeepSeek timeout');
        return new Response(
          JSON.stringify({ error: 'AI timeout - vui lòng thử lại' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error(`DeepSeek error: ${deepseekResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `AI error: ${deepseekResponse.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deepseekData = await deepseekResponse.json();
    console.log('DeepSeek response:', JSON.stringify(deepseekData).substring(0, 500));

    // Parse transactions from response
    let transactions: DeepSeekTransaction[] = [];
    
    if (Array.isArray(deepseekData.transactions)) {
      transactions = deepseekData.transactions;
    } else if (Array.isArray(deepseekData)) {
      transactions = deepseekData;
    }

    // Validate and normalize transactions
    const validTransactions = transactions
      .filter((tx) => {
        const amount = parseFloat(tx.amount?.toString() || '0');
        return Number.isFinite(amount) && amount > 0;
      })
      .map((tx) => ({
        type: tx.type || 'Chi',
        amount: parseFloat(tx.amount?.toString() || '0'),
        category: tx.category || 'Khác',
        account: tx.account || '',
        description: tx.description || '',
        datetime: tx.datetime || null,
        toAccount: tx.toAccount || null,
      }));

    console.log(`Parsed ${validTransactions.length} valid transactions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactions: validTransactions,
        raw_text: text,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Parse note error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
