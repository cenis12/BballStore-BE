const express = require('express');
const router = express.Router();
const {database} = require('../server/connections');
const crypto = require('crypto');

/* GET ALL ORDERS */
router.get('/', (req, res) => {
  database.table('productorder as po')
      .join([
        {
          table: 'orders as o',
          on: 'o.id = po.order_id'
        },
        {
          table: 'product as p',
          on: 'p.id = po.product_id'
        },
        {
          table: 'user as u',
          on: 'u.id = o.user_id'
        }
      ])
      .withFields(['o.id',
      'p.product_name as name',
      'p.price',
      'p.promotion',
      'u.username'])
      .sort({id: 1})
      .getAll()
      .then(orders => {
        if (orders.length > 0) {
          res.status(200).json(orders);
        }else {
          res.json({message: 'No order found'});
        }
      }).catch(err => console.log(err));

});

/*GET SINGLE ORDER*/
router.get('/:id', (req, res) => {
    const orderId = req.params.id;

    database.table('productorder as po')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = po.order_id'
            },
            {
                table: 'product as p',
                on: 'p.id = po.product_id'
            },
            {
                table: 'user as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id',
            'p.product_name as name',
            'p.price',
            'p.promotion',
            'u.username'])
        .filter({'o.id': orderId})
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.status(200).json(orders);
            }else {
                res.json({message: 'No order found with orderId ' + orderId});
            }
        }).catch(err => console.log(err));
})

/*NEW ORDER*/
router.post('/new', async (req,res) => {

    let {userId, products} = req.body;
    /*console.log(userId);
    console.log(products);*/
    if(userId !== null && userId > 0 && !isNaN(userId) ) {
        database.table('orders')
            .insert({
                user_id: userId
            }).then(newOrderId => {
                if(newOrderId > 0) {
                    products.forEach(async(p) => {
                        let data = await database.table('product').filter({id: p.id}).withFields(['quantity']).get();

                        let inCart = p.incart
                    // deduce pieces ordered from quantity column in database
                        if(data.quantity > 0){
                            data.quantity = data.quantity - inCart

                            if(data.quantity < 0) {
                                data.quantity = 0;
                            }
                        }else {
                            data.quantity = 0;
                        }
                     // INSERT ORDER DETAILS WITH THE NEWLY GENERATED ORDER ID

                        database.table('productorder')
                            .insert({
                                order_id: newOrderId,
                                product_id: p.id,
                                product_quantity: inCart
                            }).then(newId => {
                                database.table( 'product')
                                    .filter({id: p.id})
                                    .update({
                                        product_quantity: data.quantity
                                    }).then(successNum => {}).catch(console.log(err));
                        }).catch(err => console.log(err));
                    });
                }else {
                    res.json({message: 'new order failed while adding productorder', success: false})
                }
                res.json({
                    message: `Order successfully placed with order id ${newOrderId}`,
                    success: true,
                    order_id: newOrderId,
                    products: products
                })

        }).catch(err => console.log(err));

    }
    else {
        res.json({message: 'New order failed', success: false});
    }
});

/*FAKE PAYMENT*/
router.post('/payment', (req, res) => {
    setTimeout(() => {
        res.status(200).json({success: true});
    },3000);
});
module.exports = router;
