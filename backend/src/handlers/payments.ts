import axios from "axios";
import { Router } from "express";
import platformAPIClient from "../services/platformAPIClient";
import "../types/session";
import { Types } from 'mongoose';
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, authenticateToken } from '../Middleware/auth';
import { Response } from 'express';

const router = Router();
const JWT_SECRET =  process.env.JWT_SECRET || 'UaIh0qWFOiKOnFZmyuuZ524Jp74E7Glq';

const ObjectId = mongoose.Types.ObjectId;

export default function mountPaymentsEndpoints(router: Router) {

  router.post('/incomplete', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const payment = req.body.payment;
    const paymentId = payment.identifier;
    const txid = payment.transaction && payment.transaction.txid;
    const txURL = payment.transaction && payment.transaction._link;

    /* 
      implement your logic here
      e.g. verifying the payment, delivering the item to the user, etc...

      below is a naive example
    */

    // find the incomplete order
    const app = req.app;
    const orderCollection = app.locals.orderCollection;
    const order = await orderCollection.findOne({ pi_payment_id: paymentId });

    // order doesn't exist 
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    // check the transaction on the Pi blockchain
    const horizonResponse = await axios.create({ timeout: 20000 }).get(txURL);
    const paymentIdOnBlock = horizonResponse.data.memo;

    // and check other data as well e.g. amount
    if (paymentIdOnBlock !== order.pi_payment_id) {
      return res.status(400).json({ message: "Payment id doesn't match." });
    }

    // mark the order as paid
    await orderCollection.updateOne({ pi_payment_id: paymentId }, { $set: { txid, paid: true } });

    // let Pi Servers know that the payment is completed
    await platformAPIClient.post(`/v2/payments/${paymentId}/complete`, { txid });
    return res.status(200).json({ message: `Handled the incomplete payment ${paymentId}` });
  });
console.log("hi2");
  // approve the current payment
  router.post('/approve', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const userCollection = req.app.locals.userCollection;
    const currentUser = req.user;
    console.log(currentUser);
    if (!currentUser) {
      return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
    }

    const app = req.app;

    const paymentId = req.body.paymentId;
    console.log("buy"); 
    const currentPayment = await platformAPIClient.get(`/v2/payments/${paymentId}`);
    console.log("high"); 
    const orderCollection = app.locals.orderCollection;

    /* 
      implement your logic here 
      e.g. creating an order record, reserve an item if the quantity is limited, etc...
    */

    await orderCollection.insertOne({
      pi_payment_id: paymentId,
      product_id: currentPayment.data.metadata.productId,
      user: currentUser.uid,
      txid: null,
      paid: false,
      cancelled: false,
      created_at: new Date()
    });
    console.log("hi3");
    // let Pi Servers know that you're ready
    await platformAPIClient.post(`/v2/payments/${paymentId}/approve`);
    return res.status(200).json({ message: `Approved the payment ${paymentId}` });
  });

  // complete the current payment
  router.post('/complete', async (req, res) => {
    const app = req.app;

    const paymentId = req.body.paymentId;
    const txid = req.body.txid;
    const orderCollection = app.locals.orderCollection;

    /* 
      implement your logic here
      e.g. verify the transaction, deliver the item to the user, etc...
    */

    await orderCollection.updateOne({ pi_payment_id: paymentId }, { $set: { txid: txid, paid: true } });

    // let Pi server know that the payment is completed
    const paymentDto = await platformAPIClient.post(`/v2/payments/${paymentId}/complete`, { txid });
    if (paymentDto.data.status.developer_completed === true && paymentDto.data.status.transaction_verified === true) {
      return res.status(200).json({ message: `Completed the payment ${paymentId}` , paymentCompleted : true});}
    else {
      return res.status(200).json({ message: `Completed the payment ${paymentId}` , paymentCompleted : false});
    }
  });

  // handle the cancelled payment
  router.post('/cancelled_payment', async (req, res) => {
    const app = req.app;
    

    const paymentId = req.body.paymentId;
    const orderCollection = app.locals.orderCollection;
    console.log(app,paymentId,orderCollection);
    

    /*
      implement your logic here
      e.g. mark the order record to cancelled, etc...
    */

    await orderCollection.updateOne({ pi_payment_id: paymentId }, { $set: { cancelled: true } });
    return res.status(200).json({ message: `Cancelled the payment ${paymentId}` });
  })
}
