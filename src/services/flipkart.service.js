const csv = require('csv-parser');
const fs = require('fs');
const Product = require('../models/Product');
const Order = require('../models/Order');

class FlipkartService {
  /**
   * Process Flipkart product CSV file and store in MongoDB
   * @param {string} filePath - Path to the CSV file
   * @returns {Promise<Array>} - Array of processed products
   */
  async processProductsCSV(filePath) {
    const products = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            const product = {
              id: row.product_id || row.listing_id,
              name: row.product_name || row.title,
              price: row.selling_price || row.price,
              description: row.description || '',
              sku: row.sku || '',
              stock_quantity: parseInt(row.quantity || '0'),
              images: row.image_urls ? [{ src: row.image_urls }] : [],
              categories: row.category ? [{ name: row.category }] : [],
              source: 'flipkart',
              status: 'Pending',
              date_modified: new Date().toISOString(),
              created_date: new Date().toISOString(),
              author_name: row.brand || 'Unknown',
              publisher: row.manufacturer || '',
              dimensions: row.package_dimensions || '',
              item_weight: row.package_weight || '',
              country_of_origin: row.country_of_origin || '',
              packer: row.packer_details || ''
            };

            const savedProduct = await Product.findOneAndUpdate(
              { id: product.id },
              product,
              { upsert: true, new: true }
            );
            products.push(savedProduct);
          } catch (error) {
            console.error(`Error processing product row: ${error.message}`);
          }
        })
        .on('end', () => {
          resolve(products);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Process Flipkart orders CSV file and store in MongoDB
   * @param {string} filePath - Path to the CSV file
   * @returns {Promise<Array>} - Array of processed orders
   */
  async processOrdersCSV(filePath) {
    const orders = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            const order = {
              id: row.order_id,
              status: row.order_status || 'completed',
              total: row.order_total || '0',
              currency: 'INR',
              date_created: row.order_date || new Date().toISOString(),
              date_modified: row.last_modified_date || new Date().toISOString(),
              customer_id: row.customer_id || '',
              source: 'flipkart',
              line_items: [{
                name: row.product_name || '',
                quantity: parseInt(row.quantity || '1'),
                price: row.unit_price || '0',
                bookId: row.product_id || '',
                total: parseFloat(row.item_total || '0')
              }],
              billing: {
                first_name: row.customer_name?.split(' ')[0] || '',
                last_name: row.customer_name?.split(' ')[1] || '',
                email: row.customer_email || '',
                phone: row.customer_phone || '',
                address_1: row.billing_address || '',
                city: row.billing_city || '',
                state: row.billing_state || '',
                postcode: row.billing_pincode || '',
                country: row.billing_country || 'IN'
              },
              shipping: {
                first_name: row.shipping_name?.split(' ')[0] || '',
                last_name: row.shipping_name?.split(' ')[1] || '',
                address_1: row.shipping_address || '',
                city: row.shipping_city || '',
                state: row.shipping_state || '',
                postcode: row.shipping_pincode || '',
                country: row.shipping_country || 'IN'
              }
            };

            const savedOrder = await Order.findOneAndUpdate(
              { id: order.id },
              order,
              { upsert: true, new: true }
            );
            orders.push(savedOrder);
          } catch (error) {
            console.error(`Error processing order row: ${error.message}`);
          }
        })
        .on('end', () => {
          resolve(orders);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}

module.exports = new FlipkartService();