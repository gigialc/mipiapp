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
  return axiosClient.post(`/payments/incomplete`, { payment })
    .then(response => {
      console.log('Payment incomplete response:', response);
      return response.data;
    })
    .catch(error => {
      console.error('Error in incomplete payment:', error);
      throw error;
    });
}

export const onReadyForServerApproval = (paymentId: string) => {
  console.log("onReadyForServerApproval", paymentId);
  axiosClient.post(`/payments/approve`, { paymentId })
    .then(response => {
      console.log('Payment approval response:', response);
    })
    .catch(error => {
      console.error('Error in payment approval:', error.message);
      console.error('Stack Trace:', error.stack);
      throw error;
    });
}

export const onReadyForServerCompletion = (paymentId: string, txid: string) => {
  console.log("onReadyForServerCompletion", paymentId, txid);
  return axiosClient.post(`/payments/complete`, { paymentId, txid })
    .then(response => {
      console.log('Payment completion response:', response);
      return response.data;
    })
    .catch(error => {
      console.error('Error in payment completion:', error);
      throw error;
    });
}

export const onCancel = (paymentId: string) => {
  console.log("onCancel", paymentId);
  return axiosClient.post(`/payments/cancelled_payment`, { paymentId })
    .then(response => {
      console.log('Payment cancellation response:', response);
      return response.data;
    })
    .catch(error => {
      console.error('Error in payment cancellation:', error);
      throw error;
    });
}
  
export const onError = (error: Error, payment?: PaymentDTO) => {
  console.error("onError", error);
  if (payment) {
      console.log(payment);
      return axiosClient.post(`/payments/error`, { error, payment })
        .then(response => {
          console.log('Payment error response:', response);
          return response.data;
        })
        .catch(error => {
          console.error('Error in payment error:', error);
          throw error;
        });

    }
}
