import type {Metadata} from "next";
import {PaymentResult} from "@/components/payment-result";
export const metadata:Metadata={title:"Resultado del pago"};
export default function PaymentResultPage(){return <PaymentResult/>}
