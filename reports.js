const fs = require('fs');
// * If the report exists, return it. If not, create a new one with this structure below
module.exports = fs.existsSync('./reports.json') 
    ?   JSON.parse(fs.readFileSync('./reports.json', (err, data) => {
            if (err) {
                return {};
            }
            return data.toString();  
        }))
    :   {};