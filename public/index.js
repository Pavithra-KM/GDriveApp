$(document).on('click', '#fetchFilesBtn', function () {
    if ($("#directoryName").val()) {
        let url = "/getVideoFilesList"
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ directoryName: $("#directoryName").val() })
        })
            .then(async (response) => {
                $("#errorMessage").html(``)
                
                let data = await response.json()
                if (data.result.length > 0 && data.status == "Success") {
                    $("#directoryName").val("")
                    if (data.result.length > 0) {
                        $("#filesTable").css("height", "170px")
                        prepareFilesTable(data.result)
                    } else {
                        $("#filesTable").css("height", "500px")
                        $("#filesTable").html(`<h4>Files not found</h4>`)
                    }
                } else {
                    $("#toastMessage").html(`<div class="mt-4"><h5 class="colorRed">${data.result.message}</h5></div>`)
                    setTimeout(() => {
                        $("#toastMessage").html(``)
                    }, 2000)
                }
            })
    } else {
        $("#errorMessage").html(`<div class="colorRed">Directory name is required</div>`)
    }
})

function prepareFilesTable(data) {
    let tableHtml = ''
    tableHtml += `<table class="table mt-3">
            <thead>
                <tr>
                    <th scope="col">Sl No</th>
                    <th scope="col">File name</th>
                    <th scope="col">Mime type</th>
                    <th scope="col">Download and Upload</th>
                </tr>
            </thead>
            <tbody>`
    data.forEach(function (x, index) {
        tableHtml += `<tr>
                <th scope="col">${index + 1}</th>
                <th scope="col">${x.name}</th>
                <th scope="col">${x.mimeType}</th>
                <th scope="col"><div class="d-flex"><input type="text" id="destinationNameInp_`+ index +`" class="form-control me-3 w-50" placeholder="Enter destination folder to upload video"><button class="btn btn-primary" id="downloadVideos" onclick="downloadVideos(\`` + x.id + `\`, \`` + index + `\`)">Download</button></div><div id="destErrMessage_`+ index +`"></div></th>
            </tr>`
    })
    tableHtml += `</tbody>
            </table>`
    $('#filesTable').html(tableHtml);
}

function downloadVideos(file, index) {
    $("#destinationNameInp_"+index).removeClass("d-none")
    if ($("#destinationNameInp_"+index).val()) {
        $("#destErrMessage_"+index).html("")
        let url = "/videoDownload"
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: file, destination: $("#destinationNameInp_"+index).val() })
        }).then(async (response) => {
            $("#destinationNameInp_"+index).val("")
            let result = await response.json()
            if (result.result.status == "Success") {
                $("#toastMessage").html(`<div class="d-flex justify-content-center mt-4"><h5 class="greenColor">Uploaded Successfully!</h5></div>`)
                setTimeout(() => {
                    $("#toastMessage").html(``)
                }, 2000)
            } else {
                $("#toastMessage").html(`<div class="d-flex justify-content-center mt-4"><h5 class="colorRed">${result.result.message}</h5></div>`)
                setTimeout(() => {
                    $("#toastMessage").html(``)
                }, 2000)
            }
        }).catch((err) => {
            $("#toastMessage").html(`<div class="d-flex justify-content-center mt-4"><h5 class="colorRed">Something went wrong please try again later!</h5></div>`)
            setTimeout(() => {
                $("#toastMessage").html(``)
            }, 2000)
        })
    } else {
        $("#destErrMessage_"+index).html(`<div class="colorRed">Destination is required</div>`)
    }
}