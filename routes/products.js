const express = require('express');
const router = express.Router();
const {database} = require('../server/connections');

/* GET ALL PRODUCTS */
router.get('/', function(req, res) {
  //set the current page number
  let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
  //set the limit of items per page
  const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;

  let startValue;
  let endValue;

  if (page > 0){
    startValue = (page * limit) - limit;// 0,10,20,30
    endValue = page * limit;
  }else {
    startValue = 0;
    endValue = 10;
  }
  database.table('product as p')
      .join([{
        table: 'category as c',
        on:  'c.id = p.category_id'
      }])
      .withFields(['p.id',
          'c.category_name as category',
          'p.product_name as name',
          'p.price',
          'p.quantity',
          'p.picture',
          'p.size'])
      .slice(startValue, endValue)
      .sort({'p.id': .1})
      .getAll()
      .then(prods => {
        if (prods.length > 0) {
          res.status(200).json({
            count: prods.length,
            products: prods
          });
        }else {
          res.json({message: 'No products found'});
        }
      }).catch(err => console.log(err));

});

/* GET SINGLE PRODUCT */
router.get('/:id', (req, res) => {
    let productId = req.params.id;
    console.log(productId);


    database.table('product as p')
        .join([{
            table: 'category as c',
            on:  'c.id = p.category_id'
        }])
        .withFields(['p.id',
            'c.category_name as category',
            'p.product_name as name',
            'p.price',
            'p.quantity',
            'p.picture',
            'p.size'])
        .filter({'p.id': productId})
        .get()
        .then(prod => {
            if (prod) {
                res.status(200).json(prod);
            }else {
                res.json({message: 'No product found matching id '+ productId});
            }
        }).catch(err => console.log(err));




})

/*GET ALL PRODUCTS FROM ONE CATEGORY*/
router.get('/category/:catName', (req, res) => {
    //set the current page number
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    //set the limit of items per page
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;

    let startValue;
    let endValue;

    if (page > 0){
        startValue = (page * limit) - limit;// 0,10,20,30
        endValue = page * limit;
    }else {
        startValue = 0;
        endValue = 10;
    }

    //Fetch category name from url
    const cat_title = req.params.catName;

    database.table('product as p')
        .join([{
            table: 'category as c',
            on:  `c.id = p.category_id WHERE c.category_name LIKE '%${cat_title}%'`
        }])
        .withFields(['p.id',
            'c.category_name as category',
            'p.product_name as name',
            'p.price',
            'p.quantity',
            'p.picture',
            'p.size'])
        .slice(startValue, endValue)
        .sort({'p.id': .1})
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            }else {
                res.json({message: 'No products found from '+ cat_title + ' category'});
            }
        }).catch(err => console.log(err));
})


module.exports = router;
