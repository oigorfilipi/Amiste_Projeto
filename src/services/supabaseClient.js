import { createClient } from "@supabase/supabase-js";

// Copie do site do Supabase (Settings > API)
const supabaseUrl = "https://adibxcuvqsfkmtxkuusk.supabase.co";
const supabaseKey = "sb_publishable_HEGdUuhszHrHwqD3Rwhavw_WtmpPxW-";

export const supabase = createClient(supabaseUrl, supabaseKey);
