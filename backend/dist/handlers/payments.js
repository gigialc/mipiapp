"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const platformAPIClient_1 = __importDefault(require("../services/platformAPIClient"));
require("../types/session");
function mountPaymentsEndpoints(router) {
    router.post('/incomplete', (req, res) => __awaiter(this, void 0, void 0, function* () {
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
        const order = yield orderCollection.findOne({ pi_payment_id: paymentId });
        // order doesn't exist 
        if (!order) {
            return res.status(400).json({ message: "Order not found" });
        }
        // check the transaction on the Pi blockchain
        const horizonResponse = yield axios_1.default.create({ timeout: 20000 }).get(txURL);
        const paymentIdOnBlock = horizonResponse.data.memo;
        // and check other data as well e.g. amount
        if (paymentIdOnBlock !== order.pi_payment_id) {
            return res.status(400).json({ message: "Payment id doesn't match." });
        }
        // mark the order as paid
        yield orderCollection.updateOne({ pi_payment_id: paymentId }, { $set: { txid, paid: true } });
        // let Pi Servers know that the payment is completed
        yield platformAPIClient_1.default.post(`/v2/payments/${paymentId}/complete`, { txid });
        return res.status(200).json({ message: `Handled the incomplete payment ${paymentId}` });
    }));
    console.log("hi2");
    // approve the current payment
    router.post('/approve', (req, res) => __awaiter(this, void 0, void 0, function* () {
        console.log(req.session.currentUser);
        if (!req.session.currentUser) {
            return res.status(401).json({ error: 'unauthorized', message: "User needs to sign in first" });
        }
        const app = req.app;
        const paymentId = req.body.paymentId;
        console.log("buy");
        const currentPayment = yield platformAPIClient_1.default.get(`/v2/payments/${paymentId}`);
        console.log("high");
        const orderCollection = app.locals.orderCollection;
        /*
          implement your logic here
          e.g. creating an order record, reserve an item if the quantity is limited, etc...
        */
        yield orderCollection.insertOne({
            pi_payment_id: paymentId,
            product_id: currentPayment.data.metadata.productId,
            user: req.session.currentUser.uid,
            txid: null,
            paid: false,
            cancelled: false,
            created_at: new Date()
        });
        console.log("hi3");
        // let Pi Servers know that you're ready
        yield platformAPIClient_1.default.post(`/v2/payments/${paymentId}/approve`);
        return res.status(200).json({ message: `Approved the payment ${paymentId}` });
    }));
    // complete the current payment
    router.post('/complete', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const app = req.app;
        const paymentId = req.body.paymentId;
        const txid = req.body.txid;
        const orderCollection = app.locals.orderCollection;
        /*
          implement your logic here
          e.g. verify the transaction, deliver the item to the user, etc...
        */
        yield orderCollection.updateOne({ pi_payment_id: paymentId }, { $set: { txid: txid, paid: true } });
        // let Pi server know that the payment is completed
        const paymentDto = yield platformAPIClient_1.default.post(`/v2/payments/${paymentId}/complete`, { txid });
        if (paymentDto.data.status.developer_completed === true && paymentDto.data.status.transaction_verified === true) {
            return res.status(200).json({ message: `Completed the payment ${paymentId}`, paymentCompleted: true });
        }
        else {
            return res.status(200).json({ message: `Completed the payment ${paymentId}`, paymentCompleted: false });
        }
    }));
    // handle the cancelled payment
    router.post('/cancelled_payment', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const app = req.app;
        const paymentId = req.body.paymentId;
        const orderCollection = app.locals.orderCollection;
        console.log(app, paymentId, orderCollection);
        /*
          implement your logic here
          e.g. mark the order record to cancelled, etc...
        */
        yield orderCollection.updateOne({ pi_payment_id: paymentId }, { $set: { cancelled: true } });
        return res.status(200).json({ message: `Cancelled the payment ${paymentId}` });
    }));
}
exports.default = mountPaymentsEndpoints;
