"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
export type CartItem={productId:string;variantId:string;slug:string;name:string;sku:string;size:string;color:string;unitPriceCents:number;image:string|null;quantity:number};
type CartContextValue={items:CartItem[];ready:boolean;count:number;subtotalCents:number;addItem:(item:Omit<CartItem,"quantity">,quantity:number)=>void;removeItem:(variantId:string)=>void;setQuantity:(variantId:string,quantity:number)=>void;clear:()=>void};
const CartContext=createContext<CartContextValue|null>(null);
const KEY="elara-cart-v1";
export function CartProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]);const [ready,setReady]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const parsed:unknown=JSON.parse(raw);if(Array.isArray(parsed))setItems(parsed.filter((v):v is CartItem=>!!v&&typeof v==="object"&&typeof v.variantId==="string"&&typeof v.productId==="string"&&Number.isInteger(v.quantity)&&v.quantity>0&&v.quantity<=20));}}catch{}finally{setReady(true)}},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(KEY,JSON.stringify(items))}catch{}},[items,ready]);
 const addItem=useCallback((item:Omit<CartItem,"quantity">,quantity:number)=>{if(!Number.isInteger(quantity)||quantity<1||quantity>20)return;setItems(old=>{const exists=old.find(x=>x.variantId===item.variantId);if(exists)return old.map(x=>x.variantId===item.variantId?{...x,quantity:Math.min(20,x.quantity+quantity)}:x);return [...old,{...item,quantity}]})},[]);
 const removeItem=useCallback((variantId:string)=>setItems(old=>old.filter(x=>x.variantId!==variantId)),[]);
 const setQuantity=useCallback((variantId:string,quantity:number)=>{if(!Number.isInteger(quantity)||quantity<1){removeItem(variantId);return}setItems(old=>old.map(x=>x.variantId===variantId?{...x,quantity:Math.min(20,quantity)}:x))},[removeItem]);
 const clear=useCallback(()=>setItems([]),[]);
 const value=useMemo(()=>({items,ready,count:items.reduce((n,x)=>n+x.quantity,0),subtotalCents:items.reduce((n,x)=>n+x.quantity*x.unitPriceCents,0),addItem,removeItem,setQuantity,clear}),[items,ready,addItem,removeItem,setQuantity,clear]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart(){const context=useContext(CartContext);if(!context)throw new Error("useCart debe usarse dentro de CartProvider");return context;}
