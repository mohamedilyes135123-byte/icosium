const https = require('https');

https.get('https://3inaya-patient.vercel.app/login', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    if (data.includes('https://bvhdeqbonkmfxdndwgge.supabase.co')) {
      console.log("Supabase URL is present in the build!");
    } else {
      console.log("Supabase URL is MISSING from the build! Using placeholder!");
    }
  });
}).on('error', err => {
  console.log("Error: ", err.message);
});
