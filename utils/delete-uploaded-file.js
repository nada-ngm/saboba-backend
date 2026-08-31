const path = require("path")
const fs = require("fs").promises

function deleteUploadedFile(foldername, filename){
    const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        foldername,
        filename
    )

    fs.unlink(filePath).catch((err)=>{
        console.log(`Error deleting file: ${err.message}`)
    })
}

module.exports = deleteUploadedFile

