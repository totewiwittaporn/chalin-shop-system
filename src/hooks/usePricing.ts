import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Standard Product Prices
export interface StandardProductPrice {
  id: string;
  product_id: string;
  price: number;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  products?: {
    sku: string;
    name_th: string;
    name_en: string;
  };
}

export interface StandardProductPriceInput {
  product_id: string;
  price: number;
  effective_from: Date;
  effective_to?: Date;
}

// Standard Type Prices
export interface StandardTypePrice {
  id: string;
  product_type_id: string;
  price: number;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  product_types?: {
    code: string;
    name_th: string;
    name_en: string;
  };
}

export interface StandardTypePriceInput {
  product_type_id: string;
  price: number;
  effective_from: Date;
  effective_to?: Date;
}

// Shop Product Prices
export interface ShopProductPrice {
  id: string;
  branch_id: string;
  product_id: string;
  price: number;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  branches?: {
    code: string;
    name_th: string;
    name_en: string;
  };
  products?: {
    sku: string;
    name_th: string;
    name_en: string;
  };
}

export interface ShopProductPriceInput {
  branch_id: string;
  product_id: string;
  price: number;
  effective_from: Date;
  effective_to?: Date;
}

// Shop Type Prices
export interface ShopTypePrice {
  id: string;
  branch_id: string;
  product_type_id: string;
  price: number;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  branches?: {
    code: string;
    name_th: string;
    name_en: string;
  };
  product_types?: {
    code: string;
    name_th: string;
    name_en: string;
  };
}

export interface ShopTypePriceInput {
  branch_id: string;
  product_type_id: string;
  price: number;
  effective_from: Date;
  effective_to?: Date;
}

export function usePricing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Standard Product Prices
  const { data: standardProductPrices, isLoading: isLoadingStandardProduct } = useQuery({
    queryKey: ["standard-product-prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("standard_product_prices")
        .select(`
          *,
          products (sku, name_th, name_en)
        `)
        .order("effective_from", { ascending: false });

      if (error) throw error;
      return data as StandardProductPrice[];
    },
  });

  const createStandardProductPriceMutation = useMutation({
    mutationFn: async (input: StandardProductPriceInput) => {
      const { error } = await supabase
        .from("standard_product_prices")
        .insert({
          product_id: input.product_id,
          price: input.price,
          effective_from: input.effective_from.toISOString().split("T")[0],
          effective_to: input.effective_to?.toISOString().split("T")[0],
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["standard-product-prices"] });
      toast({ title: "เพิ่มราคามาตรฐานสำเร็จ" });
    },
    onError: (error: any) => {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    },
  });

  // Standard Type Prices
  const { data: standardTypePrices, isLoading: isLoadingStandardType } = useQuery({
    queryKey: ["standard-type-prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("standard_type_prices")
        .select(`
          *,
          product_types (code, name_th, name_en)
        `)
        .order("effective_from", { ascending: false });

      if (error) throw error;
      return data as StandardTypePrice[];
    },
  });

  const createStandardTypePriceMutation = useMutation({
    mutationFn: async (input: StandardTypePriceInput) => {
      const { error } = await supabase
        .from("standard_type_prices")
        .insert({
          product_type_id: input.product_type_id,
          price: input.price,
          effective_from: input.effective_from.toISOString().split("T")[0],
          effective_to: input.effective_to?.toISOString().split("T")[0],
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["standard-type-prices"] });
      toast({ title: "เพิ่มราคามาตรฐานสำเร็จ" });
    },
    onError: (error: any) => {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    },
  });

  // Shop Product Prices
  const { data: shopProductPrices, isLoading: isLoadingShopProduct } = useQuery({
    queryKey: ["shop-product-prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_product_prices")
        .select(`
          *,
          branches (code, name_th, name_en),
          products (sku, name_th, name_en)
        `)
        .order("effective_from", { ascending: false });

      if (error) throw error;
      return data as ShopProductPrice[];
    },
  });

  const createShopProductPriceMutation = useMutation({
    mutationFn: async (input: ShopProductPriceInput) => {
      const { error } = await supabase
        .from("shop_product_prices")
        .insert({
          branch_id: input.branch_id,
          product_id: input.product_id,
          price: input.price,
          effective_from: input.effective_from.toISOString().split("T")[0],
          effective_to: input.effective_to?.toISOString().split("T")[0],
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-product-prices"] });
      toast({ title: "เพิ่มราคาร้านค้าสำเร็จ" });
    },
    onError: (error: any) => {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    },
  });

  // Shop Type Prices
  const { data: shopTypePrices, isLoading: isLoadingShopType } = useQuery({
    queryKey: ["shop-type-prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_type_prices")
        .select(`
          *,
          branches (code, name_th, name_en),
          product_types (code, name_th, name_en)
        `)
        .order("effective_from", { ascending: false });

      if (error) throw error;
      return data as ShopTypePrice[];
    },
  });

  const createShopTypePriceMutation = useMutation({
    mutationFn: async (input: ShopTypePriceInput) => {
      const { error } = await supabase
        .from("shop_type_prices")
        .insert({
          branch_id: input.branch_id,
          product_type_id: input.product_type_id,
          price: input.price,
          effective_from: input.effective_from.toISOString().split("T")[0],
          effective_to: input.effective_to?.toISOString().split("T")[0],
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-type-prices"] });
      toast({ title: "เพิ่มราคาร้านค้าสำเร็จ" });
    },
    onError: (error: any) => {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    },
  });

  return {
    // Standard Product
    standardProductPrices,
    isLoadingStandardProduct,
    createStandardProductPrice: createStandardProductPriceMutation.mutateAsync,
    isCreatingStandardProduct: createStandardProductPriceMutation.isPending,

    // Standard Type
    standardTypePrices,
    isLoadingStandardType,
    createStandardTypePrice: createStandardTypePriceMutation.mutateAsync,
    isCreatingStandardType: createStandardTypePriceMutation.isPending,

    // Shop Product
    shopProductPrices,
    isLoadingShopProduct,
    createShopProductPrice: createShopProductPriceMutation.mutateAsync,
    isCreatingShopProduct: createShopProductPriceMutation.isPending,

    // Shop Type
    shopTypePrices,
    isLoadingShopType,
    createShopTypePrice: createShopTypePriceMutation.mutateAsync,
    isCreatingShopType: createShopTypePriceMutation.isPending,
  };
}
