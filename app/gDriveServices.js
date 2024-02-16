const functions = {};
import { google } from 'googleapis';
import { oauth2Client } from '../config/routes.js';
import fs from 'fs';

// Function to check specified directory is there or not
async function getDirectoryId(directoryName) {
    try {
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const res = await drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${directoryName}'`,
            fields: 'files(id)',
        });
        if (res.data.files.length > 0) {
            return res.data.files[0].id;
        } else {
            console.log(`Directory '${directoryName}' not found.`);
            return null;
        }
    } catch (err) {
        console.error('Error retrieving directory ID:', err);
        return null;
    }
}

// Function to fetch specified directory files
functions.getVideoFilesList = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            const directoryName = data.directoryName;
            getDirectoryId(directoryName)
                .then(directoryId => {
                    if (directoryId) {
                        drive.files.list({
                            q: `'${directoryId}' in parents and trashed=false`,
                            fields: 'nextPageToken, files(id, name, webContentLink, mimeType)',
                        }, (err, res) => {
                            if (err) {
                                reject(err)
                            } else {
                                const videoFile = res.data.files.filter(file => file.mimeType === 'video/mp4');
                                resolve(videoFile)
                            }
                        });
                    } else {
                        resolve({
                            status: "Failed",
                            message: "Directory name not found"
                        })
                    }
                });

        } catch (error) {

        }
    })
}

// Function to download video file
functions.videoDownload = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const directoryName = data.destination;
            getDirectoryId(directoryName)
                .then(async (directoryId) => {
                    if (directoryId) {
                        let fileId = data.id
                        const dest = fs.createWriteStream(data.destination);
                        const drive = google.drive({ version: 'v3', auth: oauth2Client });
                        const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
                        res.data
                            .on('end', async () => {
                                console.log('Download completed');
                                let result = await uploadVideo(data.destination, directoryId);
                                if (result == "Success") {
                                    resolve({
                                        status: "Success"
                                    })
                                }
                            })
                            .on('error', err => {
                                dest.close();
                                reject(err)
                            })
                            .pipe(dest);
                    } else {
                        resolve({
                            status: "Failed",
                            message: "Directory name not found"
                        })
                    }
                }).catch((err) => {
                    reject(err)
                })
        } catch (err) {
            console.error('Error fetching video from Google Drive', err);
            dest.close();
            reject(err)
        }
    })
}

// Function to upload video to Google Drive
async function uploadVideo(filePath, directoryId) {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const fileMetadata = {
        name: 'UploadedVideo.mp4',
        parents: [directoryId]
    };
    const media = {
        mimeType: 'video/mp4',
        body: fs.createReadStream(filePath)
    };
    const res = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    });
    console.log('File uploaded successfully:', res.data.id);
    if (res.data.id) {
        return "Success"
    }
}

export default functions;