const crypto = require('crypto');

const text = '{"data":"{\\"app_id\\":2554,\\"app_trans_id\\":\\"260615_6a2fe4e338f818e9cccb7fb5\\",\\"app_time\\":1781523683910,\\"app_user\\":\\"alaba@gmail.com\\",\\"amount\\":124000,\\"embed_data\\":\\"{\\\\\\"redirecturl\\\\\\":\\\\\\"https://pizzateo.vercel.app/orders/6a2fe4e338f818e9cccb7fb5?clear-cart=1\\\\\\"}\\",\\"item\\":\\"[]\\",\\"zp_trans_id\\":260615000002404,\\"server_time\\":1781523715679,\\"channel\\":41,\\"merchant_user_id\\":\\"4n2LtVGwMfjZhIs7wv82hA\\",\\"zp_user_id\\":\\"4n2LtVGwMfjZhIs7wv82hA\\",\\"user_fee_amount\\":0,\\"discount_amount\\":0}","mac":"5f5428176d4f5b7a96ee227a283626c34365499af5e51698a7abba129474cad5","type":1}';

const expected = '5f5428176d4f5b7a96ee227a283626c34365499af5e51698a7abba129474cad5';
const key = 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf';

// Cách 1: body.data sau parse
const body = JSON.parse(text);
const mac1 = crypto.createHmac('sha256', key).update(body.data).digest('hex');
console.log('after parse:', mac1 === expected);

// Cách 2: raw string slice
const start = text.indexOf('"data":"') + 8;
const end = text.lastIndexOf('","mac"');
const rawSlice = text.slice(start, end);
const mac2 = crypto.createHmac('sha256', key).update(rawSlice).digest('hex');
console.log('raw slice (escaped):', mac2 === expected);

// Cách 3: unescape raw slice
const unescaped = JSON.parse('"' + rawSlice + '"');
const mac3 = crypto.createHmac('sha256', key).update(unescaped).digest('hex');
console.log('raw slice (unescaped):', mac3 === expected);

// Log để so sánh
console.log('\nbody.data length:', body.data.length);
console.log('rawSlice length:', rawSlice.length);
console.log('unescaped length:', unescaped.length);