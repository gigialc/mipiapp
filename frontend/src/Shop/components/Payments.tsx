import axios from 'axios';
import { PaymentDTO } from "./Types";

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';

const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

const axiosClient = axios.create({
  baseURL: backendURL,
  timeout: 20000,
  withCredentials: true,
  headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

export const onIncompletePaymentFound = (payment: PaymentDTO) => {
    console.log("onIncompletePaymentFound", payment);
    return axiosClient.post(`/payments/incomplete`, {payment});
}
  
export const onReadyForServerApproval = (paymentId: string) => {
    console.log("onReadyForServerApproval", paymentId);
    axiosClient.post(`/payments/approve`, {paymentId}, config);
}
  
export const onReadyForServerCompletion = (paymentId: string, txid: string) => {
    console.log("onReadyForServerCompletion", paymentId, txid);
    return axiosClient.post(`/payments/complete`, {paymentId, txid}, config);
}
  
export const onCancel = (paymentId: string) => {
    console.log("onCancel", paymentId);
    return axiosClient.post(`/payments/cancelled_payment`, {paymentId});
}
  
export const onError = (error: Error, payment?: PaymentDTO) => {
  console.error("onError", error);
  if (payment) {
      console.log(payment);
      // handle the error accordingly
    }
}
