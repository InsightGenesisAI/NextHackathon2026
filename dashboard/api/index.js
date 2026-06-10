// Vercel serverless entrypoint. Delegates every request to the pure-Node
// dashboard hub handler in server/index.js.
module.exports = require("../server/index.js");
