export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      branch_products: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          min_stock: number | null
          product_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          min_stock?: number | null
          product_id: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          min_stock?: number | null
          product_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_products_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address_en: string | null
          address_th: string | null
          code: string
          commission_rate: number | null
          company_name_en: string | null
          company_name_th: string | null
          created_at: string | null
          currency: string | null
          date_format: string | null
          id: string
          is_active: boolean | null
          locale: string | null
          logo_url: string | null
          name_en: string
          name_th: string
          number_format: string | null
          phone: string | null
          primary_color: string | null
          tax_id: string | null
          type: Database["public"]["Enums"]["branch_type"]
          updated_at: string | null
        }
        Insert: {
          address_en?: string | null
          address_th?: string | null
          code: string
          commission_rate?: number | null
          company_name_en?: string | null
          company_name_th?: string | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string | null
          logo_url?: string | null
          name_en: string
          name_th: string
          number_format?: string | null
          phone?: string | null
          primary_color?: string | null
          tax_id?: string | null
          type: Database["public"]["Enums"]["branch_type"]
          updated_at?: string | null
        }
        Update: {
          address_en?: string | null
          address_th?: string | null
          code?: string
          commission_rate?: number | null
          company_name_en?: string | null
          company_name_th?: string | null
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string | null
          logo_url?: string | null
          name_en?: string
          name_th?: string
          number_format?: string | null
          phone?: string | null
          primary_color?: string | null
          tax_id?: string | null
          type?: Database["public"]["Enums"]["branch_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      doc_number_settings: {
        Row: {
          branch_id: string
          created_at: string | null
          current_number: number
          doc_type: Database["public"]["Enums"]["doc_type"]
          format: string | null
          id: string
          prefix: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          current_number?: number
          doc_type: Database["public"]["Enums"]["doc_type"]
          format?: string | null
          id?: string
          prefix: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          current_number?: number
          doc_type?: Database["public"]["Enums"]["doc_type"]
          format?: string | null
          id?: string
          prefix?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doc_number_settings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      product_types: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          name_en: string
          name_th: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name_en: string
          name_th: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name_en?: string
          name_th?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          base_price: number
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name_en: string
          name_th: string
          product_type_id: string | null
          sku: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_en: string
          name_th: string
          product_type_id?: string | null
          sku: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_en?: string
          name_th?: string
          product_type_id?: string | null
          sku?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          purchase_id: string
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          purchase_id: string
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          purchase_id?: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          branch_id: string
          created_at: string | null
          created_by: string | null
          doc_no: string
          id: string
          notes: string | null
          purchase_date: string
          received_at: string | null
          status: Database["public"]["Enums"]["purchase_status"] | null
          supplier_name: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          doc_no: string
          id?: string
          notes?: string | null
          purchase_date: string
          received_at?: string | null
          status?: Database["public"]["Enums"]["purchase_status"] | null
          supplier_name: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          doc_no?: string
          id?: string
          notes?: string | null
          purchase_date?: string
          received_at?: string | null
          status?: Database["public"]["Enums"]["purchase_status"] | null
          supplier_name?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          product_id: string
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          product_id: string
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          product_id?: string
          quantity?: number
          quotation_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          accepted_at: string | null
          branch_id: string
          created_at: string | null
          created_by: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          discount: number | null
          doc_no: string
          id: string
          notes: string | null
          quotation_date: string
          sent_at: string | null
          status: Database["public"]["Enums"]["quotation_status"] | null
          subtotal: number | null
          tax: number | null
          total_amount: number | null
          updated_at: string | null
          valid_until: string
        }
        Insert: {
          accepted_at?: string | null
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          discount?: number | null
          doc_no: string
          id?: string
          notes?: string | null
          quotation_date: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quotation_status"] | null
          subtotal?: number | null
          tax?: number | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until: string
        }
        Update: {
          accepted_at?: string | null
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount?: number | null
          doc_no?: string
          id?: string
          notes?: string | null
          quotation_date?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quotation_status"] | null
          subtotal?: number | null
          tax?: number | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          sale_id: string
          total_cost: number | null
          total_price: number
          unit_cost: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          sale_id: string
          total_cost?: number | null
          total_price: number
          unit_cost?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          total_cost?: number | null
          total_price?: number
          unit_cost?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          branch_id: string
          created_at: string | null
          created_by: string | null
          customer_name: string | null
          discount: number | null
          doc_no: string
          id: string
          notes: string | null
          sale_date: string
          status: Database["public"]["Enums"]["sale_status"] | null
          subtotal: number | null
          tax: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          customer_name?: string | null
          discount?: number | null
          doc_no: string
          id?: string
          notes?: string | null
          sale_date: string
          status?: Database["public"]["Enums"]["sale_status"] | null
          subtotal?: number | null
          tax?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          customer_name?: string | null
          discount?: number | null
          doc_no?: string
          id?: string
          notes?: string | null
          sale_date?: string
          status?: Database["public"]["Enums"]["sale_status"] | null
          subtotal?: number | null
          tax?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_product_prices: {
        Row: {
          branch_id: string
          created_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          price: number
          product_id: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          effective_from: string
          effective_to?: string | null
          id?: string
          price: number
          product_id: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          price?: number
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_product_prices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_type_prices: {
        Row: {
          branch_id: string
          created_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          price: number
          product_type_id: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          effective_from: string
          effective_to?: string | null
          id?: string
          price: number
          product_type_id: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          price?: number
          product_type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_type_prices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_type_prices_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      standard_product_prices: {
        Row: {
          created_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          price: number
          product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          effective_from: string
          effective_to?: string | null
          id?: string
          price: number
          product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          price?: number
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "standard_product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      standard_type_prices: {
        Row: {
          created_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          price: number
          product_type_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          effective_from: string
          effective_to?: string | null
          id?: string
          price: number
          product_type_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          price?: number
          product_type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "standard_type_prices_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_lots: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          lot_date: string | null
          product_id: string
          quantity: number
          reference_doc_id: string | null
          reference_doc_type: Database["public"]["Enums"]["doc_type"] | null
          remaining_quantity: number
          unit_cost: number
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          lot_date?: string | null
          product_id: string
          quantity: number
          reference_doc_id?: string | null
          reference_doc_type?: Database["public"]["Enums"]["doc_type"] | null
          remaining_quantity: number
          unit_cost: number
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          lot_date?: string | null
          product_id?: string
          quantity?: number
          reference_doc_id?: string | null
          reference_doc_type?: Database["public"]["Enums"]["doc_type"] | null
          remaining_quantity?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_lots_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_lots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          transfer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          transfer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          approved_at: string | null
          created_at: string | null
          created_by: string | null
          doc_no: string
          from_branch_id: string
          id: string
          notes: string | null
          received_at: string | null
          status: Database["public"]["Enums"]["transfer_status"] | null
          to_branch_id: string
          transfer_date: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          created_by?: string | null
          doc_no: string
          from_branch_id: string
          id?: string
          notes?: string | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["transfer_status"] | null
          to_branch_id: string
          transfer_date: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          created_by?: string | null
          doc_no?: string
          from_branch_id?: string
          id?: string
          notes?: string | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["transfer_status"] | null
          to_branch_id?: string
          transfer_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_branch_id_fkey"
            columns: ["from_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_branch_id_fkey"
            columns: ["to_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          branch_id: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "consignment_owner"
      branch_type: "MAIN" | "BRANCH" | "CONSIGNMENT"
      doc_type:
        | "PURCHASE"
        | "TRANSFER"
        | "SALE"
        | "QUOTATION"
        | "INVOICE"
        | "DELIVERY"
      purchase_status: "PENDING" | "RECEIVED" | "CANCELLED"
      quotation_status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED"
      sale_status: "COMPLETED" | "CANCELLED" | "REFUNDED"
      stock_movement_type: "IN" | "OUT" | "TRANSFER" | "ADJUST"
      transfer_status: "PENDING" | "IN_TRANSIT" | "RECEIVED" | "CANCELLED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "consignment_owner"],
      branch_type: ["MAIN", "BRANCH", "CONSIGNMENT"],
      doc_type: [
        "PURCHASE",
        "TRANSFER",
        "SALE",
        "QUOTATION",
        "INVOICE",
        "DELIVERY",
      ],
      purchase_status: ["PENDING", "RECEIVED", "CANCELLED"],
      quotation_status: ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"],
      sale_status: ["COMPLETED", "CANCELLED", "REFUNDED"],
      stock_movement_type: ["IN", "OUT", "TRANSFER", "ADJUST"],
      transfer_status: ["PENDING", "IN_TRANSIT", "RECEIVED", "CANCELLED"],
    },
  },
} as const
