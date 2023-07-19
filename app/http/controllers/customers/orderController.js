
const Order = require('../../../models/order')
const moment = require('moment')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
function orderController() {
    return {
        store(req, res) {
            const { phone, address, stripeToken, paymentType } = req.body
            if (!phone || !address) {
                // req.flash('error', 'All fields are required')
                // return res.redirect('/cart')
                return res.status(422).json({ message : 'All fields are required' });
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })

            order.save()
                .then(result => {
                    return Order.populate(result, { path: 'customerId' });
                })
                .then(placedOrder => {
                    if (paymentType === 'card') {
                        // return stripe.charges.create({
                        //     amount: req.session.cart.totalPrice * 100,
                        //     source: stripeToken,
                        //     currency: 'inr',
                        //     description: `Pizza order: ${placedOrder._id}`
                        // })
                        // .then(() => {
                        //     placedOrder.paymentStatus = true;
                        //     placedOrder.paymentType = paymentType;
                        //     return placedOrder.save();
                        // })
                        // .then(ord => {
                        //     const eventEmitter = req.app.get('eventEmitter');
                        //     eventEmitter.emit('orderPlaced', ord);
                        //     delete req.session.cart;
                        //     return res.json({ message: 'Payment successful, Order placed successfully' });
                        // })
                        // .catch(() => {
                        //     delete req.session.cart;
                        //     return res.json({ message: 'Order placed but payment failed. You can pay at delivery time.' });
                        // });
                        return stripe.charges.create({
                            amount: req.session.cart.totalPrice * 100,
                            source: stripeToken,
                            currency: 'inr',
                            description: `Pizza order: ${placedOrder._id}`
                        })
                        .then(() => {
                            placedOrder.paymentStatus = true;
                            placedOrder.paymentType = paymentType;
                            return placedOrder.save();
                        })
                        .then(ord => {
                            const eventEmitter = req.app.get('eventEmitter');
                            eventEmitter.emit('orderPlaced', ord);
                            delete req.session.cart;
                            return res.json({ message: 'Payment successful, Order placed successfully' });
                        })
                        .catch(() => {
                            delete req.session.cart;
                            return res.json({ message: 'Order placed but payment failed. You can pay at delivery time.' });
                        });
                        
                    } else {
                        delete req.session.cart;
                        return res.json({ message: 'Order placed successfully' });
                    }
                })
                .catch(err => {
                    return res.status(500).json({ message: 'Something went wrong' });
                });
        
        },

        //     order.save()
        //         .then(result => {
        //             return Order.populate(result, { path: 'customerId' });
        //         })
        //         .then(placedOrder => {
        //             //req.flash('success', 'Order placed Successfully.');
        //             delete req.session.cart;

        //             const eventEmitter = req.app.get('eventEmitter');
        //             eventEmitter.emit('orderPlaced', placedOrder);
        //             return res.json({ message : 'Payment successful, Order placed successfully' });
        //             //return res.redirect('/customers/orders');
        //         })
        //         .catch(err => {
        //             req.flash('error', 'Something went wrong.');
        //             return res.redirect('/cart');
        //         });
        // },
              
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, null,
                { sort: { 'createdAt': -1 } })
            res.header('Cache-Control', 'no-store')
            res.render('customers/orders', { orders: orders, moment: moment })
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id)
            // Authorize user
            if (req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order })
            }
            return res.redirect('/')
        }
    }
}
module.exports = orderController 