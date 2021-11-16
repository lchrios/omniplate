const fs = require('fs');

let generateDigits = (n) => {
    let digits = "";
    for (let i = 0; i < n; i++){
        digits = digits.concat(Math.floor(Math.random() * 10).toString());
    }
    return digits;
} 

let generateLetters = (n) => {
    let letters = "";
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    for (let i = 0; i < n; i++){
        letters += chars.charAt(Math.round(Math.random() * chars.length));
    }

    return letters;
}

let illegalWord = (letters) => {
    let INVALID_PLATE_LETTERS = ["FOR", "AXE", "JAM", "JAB", "ZIP", "ARE", "YOU",
    "JUG", "JAW", "JOY" ]; 
    return !INVALID_PLATE_LETTERS.includes(letters);
}

let generateRandomPlate = () => {
    let plate = "";
    let letters;
    
    do {
        letters = generateLetters(3);
    } while(illegalWord(letters));

    let digits = generateDigits(2).concat("-").concat(generateDigits(2));

    plate += letters.concat("-").concat(digits);
    return plate;
}

const saveReports = reports => {
    // * Writes the report into its file with a new timestamp
    fs.writeFileSync('reports.json', JSON.stringify(reports, null, "\t"), err => {
        if (err){
            console.error(err)
        }
        console.log("reports.json saved successfully!");
    })
}


module.exports = {generateRandomPlate, saveReports};