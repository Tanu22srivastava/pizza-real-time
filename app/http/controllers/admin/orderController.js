const Order = require('../../../models/order');

function orderController() {
    return {
        index(req, res) {
            Order.find({ status: { $ne: 'completed' } })
                .sort({ 'createdAt': -1 })
                .populate('customerId', '-password')
                .exec()
                .then(orders => {
                    if (req.xhr) {
                        return res.json(orders);
                    } else {
                        return res.render('admin/orders');
                    }
                })
                .catch(err => {
                    console.log(err);
                    // Handle the error
                });
        }
    };
}

module.exports = orderController;
