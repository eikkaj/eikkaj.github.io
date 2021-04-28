---
layout: post
title: How to select all documents from search and send to bulk action
---

Hey all, I was recently asked what the best way was to implement a "Select All" type of functionality in the Nuxeo Web UI such that all documents returned in a search could be sent to a particular bulk action. This is actually something on the [Nuxeo roadmap](https://doc.nuxeo.com/nxdoc/web-ui-roadmap/) to be implemented officially, but meanwhile, I figured I'd show a quick workaround. Select All currently doesn't exist because of the challenges around selecting all of the checkboxes in the results view when it is a lazily load infinite scrolling list. De-selecting specific items may also present challenges. My solution avoids the visual application of actually selecting the checkboxes and I've simply added a button in the UI that takes all of the results of the page provider and sends them to a Bulk Action.

[Check out the git repo for selecting all documents from search and sending to a bulk action](https://github.com/nuxeo/nuxeo-studio-community-cookbook/tree/master/modules/nuxeo/select-all-bulk-action)

In my example, there is very basic configuration done in Studio - mainly I have created an extremely simple Page Provider with one predicate: `dc:title`. I've scaffolded the search form and results layouts. The real customization comes in the results layout.

Essentially, I've added a few components to my search results form to accomplish everything:
1- I've embedded a `nuxeo-operation-button` at the top of my `search-results` tied to the `Bulk.RunAction` operation.
2- I've embedded a `nuxeo-page-provider` element in the UI which will be fed to the `Bulk.RunAction` operation
3- I've created a dialog that will pop-up when a user presses on the 
`nuxeo-operation-button` to confirm the bulk action and trigger it.

In my example, the `nuxeo-operation-button` uses a checkmark icon:
![checkmark](/images/0428/checkmark.png)

When the user presses the checkmark, a dialog will appear:
![dialog](/images/0428/dialog.png)

Here's the UI source code that accomplishes this:
```
<nuxeo-operation-button id="bulkRunAction" operation="Bulk.RunAction" input="[[nxProvider]]" notification="All results in this search were sent to be exported to csv" event="document-updated"></nuxeo-operation-button>

    <div class="action" on-tap="_toggleDialog">
      <paper-icon-button id="bt" icon="icons:check"></paper-icon-button>
    </div>

    <nuxeo-page-provider id="nxProvider"
                         provider="MySearch"
                         page-size="40"
                         params="[[params]]"
                         schemas="dublincore,common,uid,file"
                         headers='{ "X-NXfetch.document": "properties", "X-NXtranslate.directoryEntry": "label" }'
                         fetch-aggregates>
    </nuxeo-page-provider>

    <nuxeo-dialog id="dialog" on-iron-overlay-closed="" with-backdrop>
      <div class="content">
        <h2>Export All Documents Returned From Search</h2>
      </div>
      <div class="buttons">
        <paper-button dialog-dismiss="">Cancel</paper-button>
        <paper-button dialog-confirm="" class="primary" on-tap="_doAction">Export to CSV</paper-button>
      </div>
    </nuxeo-dialog>
```

So to summarize, I'm going to send all of the results of the executed search to the `#bulkRunAction` operation I've embedded in my `search-results` form. I added the `nuxeo-page-provider` to the UI because the `Bulk.RunAction` operation will take that as input. In addition to the page provider, `Bulk.RunAction` will accept `namedParameters` in its input parameters. This is how we can pass the parameters utilized to execute the search to the bulk action, such as a predicate or an aggregate selected. This is all accomplished in the `doAction` function I've written, which as you can see, is triggered when a user presses the confirm button in the dialog. You will also notice that I've essentially hard-coded what bulk action is going to ne executed (CSV Export). This could obviously be far more customizable.

```
_doAction: function() {
	// hack to pull the parameters the user selected in the search-form to execute the search in the UI
   var ppParams = document.querySelector("nuxeo-app").root.querySelector("#drawerPanel").querySelector("div[slot=drawer]").querySelector("#drawer-pages").querySelector("nuxeo-search-form[name=mynewsearch]").params;
      
   ppParams = JSON.stringify(ppParams);

   this.$.bulkRunAction.params = {
    action: 'csvExport', 
    providerName: 'MySearch',
    namedParameters: ppParams
      };

    this.$.bulkRunAction._execute();
    },

    _toggleDialog: function() {
      this.$.dialog.toggle();
    }
```

Curious to learn more about the `Bulk.RunAction` operation? Check out the doc here: [https://explorer.nuxeo.com/nuxeo/site/distribution/Nuxeo%20Platform-2021/viewOperation/Bulk.RunAction](https://explorer.nuxeo.com/nuxeo/site/distribution/Nuxeo%20Platform-2021/viewOperation/Bulk.RunAction)

Happy Coding!
