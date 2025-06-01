export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      payments: {
        Row: {
          id: string;
          user_id: string | null;
          payment_id: string;
          order_number: string | null;
          product_id: string;
          product_name: string | null;
          amount: number | null;
          currency: string | null;
          payment_status: string;
          custom_fields: Json | null;
          request_id: string | null;
          webhook_data: Json | null;
          created_at: string;
          updated_at: string;
          email: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          payment_id: string;
          order_number?: string | null;
          product_id: string;
          product_name?: string | null;
          amount?: number | null;
          currency?: string | null;
          payment_status?: string;
          custom_fields?: Json | null;
          request_id?: string | null;
          webhook_data?: Json | null;
          created_at?: string;
          updated_at?: string;
          email?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          payment_id?: string;
          order_number?: string | null;
          product_id?: string;
          product_name?: string | null;
          amount?: number | null;
          currency?: string | null;
          payment_status?: string;
          custom_fields?: Json | null;
          request_id?: string | null;
          webhook_data?: Json | null;
          created_at?: string;
          updated_at?: string;
          email?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      premium_credits: {
        Row: {
          id: string;
          user_id: string;
          credits_remaining: number;
          credits_used: number;
          last_purchase_id: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credits_remaining?: number;
          credits_used?: number;
          last_purchase_id?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          credits_remaining?: number;
          credits_used?: number;
          last_purchase_id?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "premium_credits_last_purchase_id_fkey";
            columns: ["last_purchase_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "premium_credits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      name_generations: {
        Row: {
          id: string;
          user_id: string | null;
          original_name: string;
          korean_name: string | null;
          gender: string | null;
          name_style: string | null;
          is_premium: boolean;
          premium_credit_used: string | null;
          generation_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          original_name: string;
          korean_name?: string | null;
          gender?: string | null;
          name_style?: string | null;
          is_premium?: boolean;
          premium_credit_used?: string | null;
          generation_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          original_name?: string;
          korean_name?: string | null;
          gender?: string | null;
          name_style?: string | null;
          is_premium?: boolean;
          premium_credit_used?: string | null;
          generation_data?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "name_generations_premium_credit_used_fkey";
            columns: ["premium_credit_used"];
            isOneToOne: false;
            referencedRelation: "premium_credits";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "name_generations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      available_premium_credits: {
        Row: {
          id: string;
          user_id: string;
          credits_remaining: number;
          credits_used: number;
          last_purchase_id: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "premium_credits_last_purchase_id_fkey";
            columns: ["last_purchase_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "premium_credits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {};
    Enums: {};
  };
}
