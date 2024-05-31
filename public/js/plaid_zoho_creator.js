console.log("v500 site: widget.accountingtech.co repo: https://github.com/Admin-Nexxess/plaid_widget.git branch: widget 053124 1030");

let connected_bank_accounts_url;

console.log('connected_bank_accounts_url', connected_bank_accounts_url)

///////////////////
/// Variable
///////////////////
var recordOps;
var business;
var existing_plaid_accounts = [];
var accounts;
var queryParams;
var add_item_data;
var add_item_metadata;
var add_item_token;

async function initZohoCreatorWidget() {
    var creatorSdkPromise = ZOHO.CREATOR.init();
    creatorSdkPromise.then(function (data) {
        recordOps = ZOHO.CREATOR.API;
        console.log('recordOps', recordOps);
        queryParams = ZOHO.CREATOR.UTIL.getQueryParams();
        console.log('queryParams', queryParams);
        if (!queryParams.zoho_loginuserid) {
            console.log("No queryParam");
            $(".error").show();
        } else {
            console.log("zoho_loginuserid", queryParams.zoho_loginuserid);
            var return_site = queryParams.return_site;
            var return_page =  queryParams.return_page;
            connected_bank_accounts_url = return_site + "/#" + return_page;
            console.log("connected_bank_accounts_url",connected_bank_accounts_url);
            $("#params").text(queryParams.zoho_loginuserid);
            initPlaid();
        }
        return recordOps;
    });
}

async function addItem(payload, metadata) {
    console.log(":68 function addItem()");
    console.log(":69 payload", payload);
    console.log(":70 payload", metadata);
        console.log(":178 Adding Records to Zoho Creator...", payload);

        var formLinkName = "Plaid_Item";
        var formData = {
            "data": {
                "item_id": payload.item_id,
                "Owner_Email": queryParams.zoho_loginuserid,
                "public_token": payload.public_token,
                "access_token": payload.access_token
            }
        };
        var config = {
            formName: formLinkName,
            data: formData
        }

        var addRecord = recordOps.addRecord(config);
        addRecord.then(function (jsonData) {
            console.log(':64 addItem() *** Record Added ***', jsonData);
            console.log(':65 ' + new Date().toTimeString());
            console.log(':66  connected_bank_accounts_url' + connected_bank_accounts_url);
            window.parent.location.href = connected_bank_accounts_url;
        });
        // });
        console.log('addItem() end');
    // }).catch(function (error) {
    //     console.log('addItem() very end', error);
    // });
}

async function updateItem(payload, metadata) {
    console.log("function updateItem()", payload, metadata);
    // let url_items = '/api/item/';
    // fetch_options = { referrerPolicy: "no-referrer-when-downgrade" };
    // Promise.all([
    //     fetch(url_items, fetch_options),
    // ]).then(function (responses) {
    //     return Promise.all(responses.map(function (response) {
    //         return response.json();
    //     }));
    // }).then(function (data) {
    //     console.log("updateItem() Promise all", data);

    //     item = data[0];
        var formLinkName = "Plaid_Item";
        var formData = {
            "data": {
                "Update_Plaid_Link_Response_API": new Date().toString()  +  " " + JSON.stringify(payload) + " " + JSON.stringify(metadata)
            }
        };

        // var config = {
        //     formName: formLinkName,
        //     data: formData,
        //     id: queryParams.plaid_item_record_id
        // }

        var config = {
            appName : "scarlett-2-0",
        reportName : "All_Plaid_Items",
        id: queryParams.plaid_item_record_id,
        data : formData
    }


        console.log (":102", config);
        var updateRecord = recordOps.updateRecord(config);
        console.log (":104", updateRecord);
        updateRecord.then(function (jsonData) {

            console.log('updateItem() *** Record Updated ***', jsonData);
            redirect_page = 'Accounts_Scarlett_Next';
            window.parent.parent.location.href = connected_bank_accounts_url;
        });
        console.log('updateItem() end');
    // }).catch(function (error) {
        // if there's an error, log it
        // console.log('updateItem() very end', error);
    // });
}

///////////////////
/// Plaid Functions
///////////////////
async function render_page($, page_info) {

    var products = page_info.products;

    var handler = null;
    $.post("/api/create_link_token", queryParams, function (data) {
        if (data.error != null) {
            $(".loading-indicator").hide();
            $(".spinner").hide();
            displayError($("#container"), data.error);
            return;
        }
        localStorage.setItem("link_token", data.link_token);
        handler = Plaid.create({
            token: data.link_token,
            onSuccess: function (public_token, metadata) {
                console.log("Plaid client onSuccess", public_token, metadata);
                $.post(
                    "/api/set_access_token",
                    {
                        public_token: public_token
                    },
                    function (data) {
                        console.log("on success handler")
                        console.log(':304 Plaid.create client ACCESS data', data)
                        console.log('Plaid.create client ACCESS public_token', public_token)
                        console.log('Plaid.create client ACCESS metadata', metadata)
                        /////// Add Item ////////
                        add_item_data = data;
                        add_item_metadata = metadata;
                        add_item_token = public_token;

                        data.public_token = public_token;
                        if (queryParams.access_token) {
                            updateItem(data, metadata);
                            console.log(':154 updateItem');
                        } else {
                            addItem(data, metadata);
                            console.log(':156 addItem');
                        }
                        $(".spinner").show();
                    }
                );
            },
            onExit: (error, metadata) => {
                console.log('onExit error', error)
                console.log('onExit metadata', metadata)
                console.log('*** parent', 2)
                window.parent.location.href = connected_bank_accounts_url; // initial only zoho_loginuserid

            },
            onEvent: (eventName, metadata) => {
                console.log('onEvent eventName', eventName)
                console.log('onEvent metadata', metadata)
                if (eventName == "HANDOFF") {
                    $(".spinner").show();
                    return null;
                }
            },
            onLoad: function () {
                console.log("on load");
                if (handler != null) {
                    handler.open();
                    console.log('handler open')
                }
            }
        });
        $(".loading-indicator").hide();
        $(".spinner").hide();
    });
}

async function initPlaid() {
    $.post("/api/info", {}, function (result) {
        render_page(jQuery, result);
    });
}

async function initApp() {
    await initZohoCreatorWidget();
    //await initPlaid();
};

///////////////////
/// Document Ready Call
///////////////////
$(document).ready(function () {
    initApp();
});

///////////////////
/// Helpers
///////////////////

function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(
        new RegExp("[?&]" + key + "=([^&]+)(&|$)")
    );
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

function displayError(element, error) {
    var html = `
<div class="alert alert-danger">
<p><strong>Error Code:</strong> ${error.error_code}</p>
<p><strong>Error Type:</strong> ${error.error_type}</p>
<p><strong>Error Message:</strong> ${error.display_message == null
            ? error.error_message
            : error.display_message
        }</p>
<div>Check out our <a href="https://plaid.com/docs/#errors-overview">errors documentation</a> for more information.</div>
</div>`;
    $(element).html(html).slideDown();
}

function toFixedNumber(num) {
    digits = 2;
    base = 10;
    var pow = Math.pow(base || 10, digits);
    return String(Math.round(num * pow) / pow);
}