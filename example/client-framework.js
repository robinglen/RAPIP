const { client } = require("../src");

client.framework.listen(3000, () => {
  console.log("Listening on port 3000!");
});
