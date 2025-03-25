export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      demo_trades: {
        Row: {
          amount: number
          base_asset: string
          created_at: string
          id: string
          price: number
          quote_asset: string
          side: string
          status: string
          symbol: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          base_asset: string
          created_at?: string
          id?: string
          price: number
          quote_asset: string
          side: string
          status: string
          symbol: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          base_asset?: string
          created_at?: string
          id?: string
          price?: number
          quote_asset?: string
          side?: string
          status?: string
          symbol?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_wallets: {
        Row: {
          asset: string
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset: string
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset?: string
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          asset: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          asset: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          asset?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_suggestions: {
        Row: {
          created_at: string
          expected_return: number
          id: string
          risk_score: number
          suggestion_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          expected_return: number
          id?: string
          risk_score: number
          suggestion_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          expected_return?: number
          id?: string
          risk_score?: number
          suggestion_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          referral_code: string | null
          referred_by: string | null
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      quantum_signals: {
        Row: {
          asset: string
          confidence: number
          created_at: string
          id: string
          prediction_data: Json
          signal_type: string
          status: string | null
          user_id: string | null
          valid_until: string
        }
        Insert: {
          asset: string
          confidence: number
          created_at?: string
          id?: string
          prediction_data: Json
          signal_type: string
          status?: string | null
          user_id?: string | null
          valid_until: string
        }
        Update: {
          asset?: string
          confidence?: number
          created_at?: string
          id?: string
          prediction_data?: Json
          signal_type?: string
          status?: string | null
          user_id?: string | null
          valid_until?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          interval: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          features: Json
          id?: string
          interval: string
          name: string
          price: number
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          interval?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      trades: {
        Row: {
          amount: number
          base_asset: string
          created_at: string
          id: string
          price: number
          quote_asset: string
          side: string
          status: string
          symbol: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          base_asset?: string
          created_at?: string
          id?: string
          price: number
          quote_asset?: string
          side: string
          status: string
          symbol?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          base_asset?: string
          created_at?: string
          id?: string
          price?: number
          quote_asset?: string
          side?: string
          status?: string
          symbol?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          notifications: Json | null
          quantum_features_enabled: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notifications?: Json | null
          quantum_features_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notifications?: Json | null
          quantum_features_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          created_at: string
          id: string
          points: number
          reward_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          reward_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reward_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          asset: string
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset: string
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset?: string
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          address: string
          amount: number
          asset: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          address: string
          amount: number
          asset: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          address?: string
          amount?: number
          asset?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_secret: {
        Args: {
          secret_name: string
        }
        Returns: string
      }
      initialize_demo_account: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      initialize_wallet: {
        Args: {
          asset_symbol: string
        }
        Returns: undefined
      }
      process_demo_trade: {
        Args: {
          trade_id: string
          p_user_id: string
          p_base_asset: string
          p_quote_asset: string
          p_side: string
          p_amount: number
          p_price: number
        }
        Returns: undefined
      }
      process_deposit: {
        Args: {
          p_deposit_id: string
        }
        Returns: undefined
      }
      process_withdrawal: {
        Args: {
          withdrawal_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      update_user_rewards: {
        Args: {
          p_user_id: string
          p_reward_type: string
          p_points: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
