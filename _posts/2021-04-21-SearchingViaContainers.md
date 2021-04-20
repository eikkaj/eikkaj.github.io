---
layout: post
title: How to search for documents via their parent containers
---

Hey all, I was recently asked what the best way is to created a page provider / search in the Nuxeo WebUI that allows users to search for documents and filter by their parent containers. I thought this was a great opportunity to create a sandbox project with some code that folks can adapt and utilize.

[Check out the git repo for searching via parent containers](https://github.com/nuxeo-sandbox/nuxeo-content-location-search)

The solution I am proposing requires some Studio configuration and java development, and this is due to the nature of Nuxeo's OOTB data model. Documents have knowledge of their parents via `ecm:parentId` but using the `parentId` as a predicate or aggregate isn't super useful, since you'd have to search by the parent's UID...Indexing the parent's path is a much nicer solution for users in the UI. 

First, check out my data model. I've created a new custom schema specific for use in my page provider. `assets_search:content_location` won't be added to any layouts but the page provider that I'm setting up for this example - meaning ES is only going to be writing to it.
![custom schema](/images/0421/customschema.png)

Next, I update the File doctype so that it inherits the `assets_search` schema.
![File doctype](/images/0421/fileschemas.png)

Finally, I have created a page provider to leverage this field in the form of an aggregate.
![Custom PP](/images/0421/custompp.png)

If you deploy your app with a similar Studio configuration, you'll find an aggregate in your search (assuming you added it to the proper layouts) but no data will be available, because nothing is being written to `assets_search:content_location` yet. Here is where the fun begins.

I contributed a new ES Document Writer to help write a given document's path to `assets_search:content_location` . See [ContentESDocumentWriter](https://github.com/nuxeo-sandbox/nuxeo-content-location-search/blob/master/nuxeo-content-location-search-core/src/main/java/contentlocation/core/es/ContentESDocumentWriter.java) for more info. 

The key of this override is the actual writing to that custom field:
```
DocumentModel parentDoc = coreSession.getDocument(doc.getParentRef());
Path path = parentDoc.getPath();
jg.writeStringField("assets_search:content_location", path.toString());
```

Once this writer is in place, documents will have `assets_search:content_location` available in ES, meaning a page provider utilizing ES will be able to use this in a predicate or aggregate so users can filter for documents by their parent path!

If you have any questions about this sandbox project, how to create your own, or anything else, please don't hesitate to ask!