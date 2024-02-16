# GDriveApp

A simple and flexible package for interacting with Google Drive.

Perform the following actions on files and folders in Google Drive:
 - Get Video Files from specific directory
 - Download
 - Upload to specified directory

## **Google Drive OAuth**
You need to authorize your google drive inorder to interact.


## **Download & Upload Video**
```
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

```


## **Installation**
```
npm i
```
## **Running Server**
```
node server.js
```
server will listen on 5000 port

http://localhost:5000/
