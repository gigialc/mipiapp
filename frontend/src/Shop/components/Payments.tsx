import axios from 'axios';
import { PaymentDTO } from "./Types";

interface WindowWithEnv extends Window {
  __ENV?: {
    BACKEND_URL: string, // REACT_APP_BACKEND_URL environment variable
    sandbox: string, // REACT_APP_SANDBOX_SDK environment variable - string, not boolean!
  }
}

const _window: WindowWithEnv = window;
const backendURL = _window.__ENV && _window.__ENV.BACKEND_URL;


const axiosClient = axios.create({ baseURL: `${backendURL}`, timeout: 20000, withCredentials: true});
const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};
 

export const onIncompletePaymentFound = (payment: PaymentDTO) => {
    console.log("onIncompletePaymentFound", payment);
    return axiosClient.post('/payments/incomplete', {payment});
  }
  
export const onReadyForServerApproval = (paymentId: string) => {
    console.log("onReadyForServerApproval", paymentId);
    axiosClient.post('/payments/approve', {paymentId}, config);
  }
  
export const onReadyForServerCompletion = (paymentId: string, txid: string) => {
    console.log("onReadyForServerCompletion", paymentId, txid);
    return axiosClient.post('/payments/complete', {paymentId, txid}, config);
  }
  
export const onCancel = (paymentId: string) => {
    console.log("onCancel", paymentId);
    return axiosClient.post('/payments/cancelled_payment', {paymentId});
  }
  
export const onError = (error: Error, payment?: PaymentDTO) => {
  console.error("onError", error);
  if (payment) {
      console.log(payment);
      // handle the error accordingly
    }
  }