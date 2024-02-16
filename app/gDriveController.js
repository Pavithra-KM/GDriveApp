import gDriveServices from "../app/gDriveServices.js";
const functions = {};

functions.getVideoFilesList = async(req, res) => {
    try {
        res.send({
            status: "Success",
            result: await gDriveServices.getVideoFilesList(req.body)
        })
    } catch (error) {
        res.send({
            status: "Failed"
        })
    }
}

functions.videoDownload = async(req, res) => {
    try {
        res.send({
            status: "Success",
            result: await gDriveServices.videoDownload(req.body)
        })
    } catch (error) {
        res.send({
            status: "Failed"
        })
    }
}

export default functions;